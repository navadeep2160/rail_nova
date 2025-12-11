import pandas as pd
import numpy as np
import torch
import joblib
import os
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
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
    print("Training Delay Prediction Model...")
    df = pd.read_csv(f"{DATA_DIR}/historical_movements.csv")
    
    X = df[['weather_code', 'priority', 'current_delay']]
    y = df['next_delay']
    
    model = GradientBoostingRegressor(n_estimators=100)
    model.fit(X, y)
    
    joblib.dump(model, f"{MODELS_DIR}/delay_gb.pkl")
    print("Delay Model Saved.")

def train_conflict_model():
    print("Training Conflict Probability Model...")
    df = pd.read_csv(f"{DATA_DIR}/conflict_cases.csv")
    
    X = df[['track_id', 'time_gap', 'opposite_direction']]
    y = df['is_conflict']
    
    model = RandomForestClassifier(n_estimators=50)
    model.fit(X, y)
    
    joblib.dump(model, f"{MODELS_DIR}/conflict_rf.pkl")
    print("Conflict Model Saved.")

if __name__ == "__main__":
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)
        
    train_eta_model()
    train_delay_model()
    train_conflict_model()
