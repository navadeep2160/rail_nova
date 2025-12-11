import torch
import joblib
import numpy as np
import pandas as pd
from ml.definitions import ETALSTM
from typing import List

MODELS_DIR = "ml/models"

class MLService:
    def __init__(self):
        self.eta_model = None
        self.delay_model = None
        self.conflict_model = None
        self.congestion_model = None
        self.delay_explainer = None
        self.conflict_explainer = None
        
        try:
            self._load_models()
        except Exception as e:
            print(f"Error loading ML models: {e}")

    def _load_models(self):
        # Load ETA LSTM
        self.eta_model = ETALSTM()
        try:
            self.eta_model.load_state_dict(torch.load(f"{MODELS_DIR}/eta_lstm.pth"))
            self.eta_model.eval()
        except:
             print("ETA model not found, skipping.")

        # Load Sklearn Models & Explainers
        try:
            self.delay_model = joblib.load(f"{MODELS_DIR}/delay_gb.pkl")
            self.conflict_model = joblib.load(f"{MODELS_DIR}/conflict_rf.pkl")
            self.congestion_model = joblib.load(f"{MODELS_DIR}/congestion_prophet.pkl")
            
            self.delay_explainer = joblib.load(f"{MODELS_DIR}/delay_shap.pkl")
            self.conflict_explainer = joblib.load(f"{MODELS_DIR}/conflict_shap.pkl")
        except Exception as e:
            print(f"Sklearn/Prophet/SHAP models not found: {e}")

    def predict_eta(self, speed, dist, delay, hour):
        if not self.eta_model:
            return -1
        
        input_tensor = torch.tensor([[speed, dist, delay, hour]], dtype=torch.float32)
        input_tensor = input_tensor.reshape(1, 1, 4)
        
        with torch.no_grad():
            output = self.eta_model(input_tensor)
        
        return float(output.item())

    def predict_delay(self, weather, priority, current_delay):
        if not self.delay_model:
            return -1
        
        X = np.array([[weather, priority, current_delay]])
        return float(self.delay_model.predict(X)[0])

    def predict_conflict(self, track_id, time_gap, opposite_dir):
        if not self.conflict_model:
            return 0.0
            
        X = np.array([[track_id, time_gap, opposite_dir]])
        # Return probability of class 1
        return float(self.conflict_model.predict_proba(X)[0][1])

    def predict_congestion(self, periods=24):
        if not self.congestion_model:
            return []
            
        future = self.congestion_model.make_future_dataframe(periods=periods, freq='H')
        forecast = self.congestion_model.predict(future)
        
        # Return last 'periods' rows
        result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)
        return result.to_dict('records')

    def explain_delay(self, weather, priority, current_delay):
        if not self.delay_explainer:
            return {}
            
        X = np.array([[weather, priority, current_delay]])
        # Calculate SHAP values
        shap_values = self.delay_explainer(X)
        
        # Structure output
        explanation = {
            "base_value": float(shap_values.base_values[0]),
            "features": {
                "weather": float(shap_values.values[0][0]),
                "priority": float(shap_values.values[0][1]),
                "current_delay": float(shap_values.values[0][2])
            }
        }
        return explanation

    def explain_conflict(self, track_id, time_gap, opposite_dir):
        if not self.conflict_explainer:
            return {}
            
        X = np.array([[track_id, time_gap, opposite_dir]])
        shap_values = self.conflict_explainer.shap_values(X)
        
        # For classification, shap_values is a list of arrays (one for each class)
        # We usually care about the positive class (1)
        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0] # Regression or binary generic
            
        explanation = {
            "features": {
                "track_id": float(sv[0]),
                "time_gap": float(sv[1]),
                "opposite_dir": float(sv[2])
            }
        }
        return explanation
