import pandas as pd
import numpy as np
import torch
import joblib
import os
import json
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from prophet import Prophet
import shap
from definitions import ETALSTM

MODELS_DIR = "ml/models"
DATA_DIR = "datasets"

def train_eta_model():
    print("Training ETA LSTM Model...")
    df = pd.read_csv(f"{DATA_DIR}/historical_movements.csv")
    
    # Preprocessing
    feature_cols = ['speed', 'dist_remaining', 'current_delay', 'hour_of_day']
    target_col = 'actual_time_remaining'
    
    X = df[feature_cols].values.astype(np.float32)
    y = df[target_col].values.astype(np.float32)
    
    # Reshape for LSTM: (Samples, Seq_Len=1, Features)
    X = X.reshape(-1, 1, 4)
    y = y.reshape(-1, 1)
    
    X_tensor = torch.tensor(X)
    y_tensor = torch.tensor(y)
    
    model = ETALSTM()
    criterion = torch.nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    
    # Simple training loop
    for epoch in range(50):
        outputs = model(X_tensor)
        loss = criterion(outputs, y_tensor)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
    torch.save(model.state_dict(), f"{MODELS_DIR}/eta_lstm.pth")
    print("ETA Model Saved.")

def train_delay_model():
    print("Training Delay Prediction Model (XGBoost/GBR)...")
    df = pd.read_csv(f"{DATA_DIR}/historical_movements.csv")
    
    # Features: Weather, Priority, Current Delay
    # Ensure no NaNs
    df = df.fillna(0)
    
    X = df[['weather_code', 'priority', 'current_delay']]
    y = df['next_delay']
    
    model = GradientBoostingRegressor(n_estimators=100)
    model.fit(X, y)
    
    joblib.dump(model, f"{MODELS_DIR}/delay_gb.pkl")
    print("Delay Model Saved.")
    
    # Train SHAP Explainer for Delay Model
    print("Training SHAP Explainer for Delay Model...")
    explainer = shap.Explainer(model, X)
    joblib.dump(explainer, f"{MODELS_DIR}/delay_shap.pkl")
    print("Delay SHAP Explainer Saved.")

def train_conflict_model():
    print("Training Conflict Probability Model (Random Forest)...")
    df = pd.read_csv(f"{DATA_DIR}/conflict_cases.csv")
    
    X = df[['track_id', 'time_gap', 'opposite_direction']]
    y = df['is_conflict']
    
    model = RandomForestClassifier(n_estimators=50)
    model.fit(X, y)
    
    joblib.dump(model, f"{MODELS_DIR}/conflict_rf.pkl")
    print("Conflict Model Saved.")
    
    # Train SHAP Explainer for Conflict Model
    print("Training SHAP Explainer for Conflict Model...")
    # TreeExplainer is better for RF
    explainer = shap.TreeExplainer(model)
    joblib.dump(explainer, f"{MODELS_DIR}/conflict_shap.pkl")
    print("Conflict SHAP Explainer Saved.")

def train_congestion_model():
    print("Training Congestion Forecasting Model (Prophet)...")
    df = pd.read_csv(f"{DATA_DIR}/historical_movements.csv")
    
    # Create time series: Count of trains per hour
    # Mocking a datetime column if not present in generate_data (I added timestamp in generate_data)
    if 'timestamp' in df.columns:
        df['ds'] = pd.to_datetime(df['timestamp'])
        # Truncate to hour
        df['ds'] = df['ds'].dt.floor('h')
        # Count rows per hour
        df_agg = df.groupby('ds').size().reset_index(name='y')
    else:
        # Fallback if timestamp missing
        dates = pd.date_range(start='2023-01-01', periods=len(df), freq='H')
        df_agg = pd.DataFrame({'ds': dates, 'y': np.random.randint(5, 20, len(dates))})

    model = Prophet()
    model.fit(df_agg)
    
    # Save Prophet model
    # joblib works for Prophet objects in recent versions
    joblib.dump(model, f"{MODELS_DIR}/congestion_prophet.pkl")
    print("Congestion Model Saved.")

if __name__ == "__main__":
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)
        
    train_eta_model()
    train_delay_model()
    train_conflict_model()
    train_congestion_model()

