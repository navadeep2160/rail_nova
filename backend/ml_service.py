import torch
import joblib
import numpy as np
from ml.definitions import ETALSTM
from typing import List

MODELS_DIR = "ml/models"

class MLService:
    def __init__(self):
        self.eta_model = None
        self.delay_model = None
        self.conflict_model = None
        
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

        # Load Sklearn Models
        try:
            self.delay_model = joblib.load(f"{MODELS_DIR}/delay_gb.pkl")
            self.conflict_model = joblib.load(f"{MODELS_DIR}/conflict_rf.pkl")
        except:
            print("Sklearn models not found, skipping.")

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
