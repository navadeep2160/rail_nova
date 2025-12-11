import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

DATA_DIR = "datasets"

def generate_datasets():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    print("Generating Synthetic Data...")

    # 1. Block Sections
    blocks = []
    for i in range(1, 21):
        blocks.append({
            "block_id": f"BLK-{i:03d}",
            "length_km": np.random.uniform(5, 15),
            "max_speed": np.random.choice([80, 100, 120, 160])
        })
    df_blocks = pd.DataFrame(blocks)
    df_blocks.to_csv(f"{DATA_DIR}/block_sections.csv", index=False)
    print(" - block_sections.csv")

    # 2. Train Timetable
    timetable = []
    train_ids = [f"TRN-{i:03d}" for i in range(1, 11)]
    stations = ["STA-A", "STA-B", "STA-C", "STA-D", "STA-E"]
    
    start_time = datetime(2023, 1, 1, 6, 0, 0)
    
    for train in train_ids:
        curr_time = start_time + timedelta(minutes=np.random.randint(0, 120))
        for i, station in enumerate(stations):
            arrival = curr_time
            departure = arrival + timedelta(minutes=np.random.randint(2, 10))
            timetable.append({
                "train_id": train,
                "station": station,
                "seq": i+1,
                "arrival_time": arrival.time(),
                "departure_time": departure.time()
            })
            curr_time = departure + timedelta(minutes=np.random.randint(20, 40))
            
    df_tt = pd.DataFrame(timetable)
    df_tt.to_csv(f"{DATA_DIR}/train_timetable.csv", index=False)
    print(" - train_timetable.csv")

    # 3. Weather Data
    weather_data = []
    curr_date = datetime(2023, 1, 1)
    for _ in range(365):
        weather_data.append({
            "date": curr_date.date(),
            "temp": np.random.uniform(10, 40),
            "rain_mm": np.random.exponential(2) if np.random.rand() > 0.7 else 0,
            "visibility_km": np.random.uniform(0.5, 10)
        })
        curr_date += timedelta(days=1)
    df_weather = pd.DataFrame(weather_data)
    df_weather.to_csv(f"{DATA_DIR}/weather_data.csv", index=False)
    print(" - weather_data.csv")

    # 4. Historical Movements (Main Training Data)
    # Target: actual_time_remaining (for ETA), next_delay (for Delay Prediction)
    movements = []
    for _ in range(5000):
        dist_remaining = np.random.uniform(0, 100)
        speed = np.random.uniform(20, 120)
        
        # Physics-ish ETA
        base_time = (dist_remaining / max(1, speed)) * 60 # minutes
        
        # Add noise/delay factors
        weather_code = np.random.randint(0, 3) # 0: Clear, 1: Rain, 2: Fog
        priority = np.random.randint(0, 2) # 0: Normal, 1: High
        current_delay = np.random.exponential(5)
        
        delay_factor = 1.0
        if weather_code == 1: delay_factor = 1.2
        if weather_code == 2: delay_factor = 1.5
        if priority == 1: delay_factor *= 0.8
        
        actual_time = base_time * delay_factor + np.random.normal(0, 5)
        actual_time = max(1, actual_time)
        
        next_delay = current_delay + (actual_time - base_time)
        
        movements.append({
            "train_id": np.random.choice(train_ids),
            "block_id": np.random.choice(df_blocks['block_id']),
            "speed": speed,
            "dist_remaining": dist_remaining,
            "current_delay": current_delay,
            "hour_of_day": np.random.randint(0, 24),
            "weather_code": weather_code,
            "priority": priority,
            "actual_time_remaining": actual_time,
            "next_delay": next_delay,
            "timestamp": (datetime(2023,1,1) + timedelta(minutes=np.random.randint(0, 525600))).isoformat() 
        })
        
    df_move = pd.DataFrame(movements)
    df_move.to_csv(f"{DATA_DIR}/historical_movements.csv", index=False)
    print(" - historical_movements.csv")
    
    # 5. Conflict Cases
    conflicts = []
    for _ in range(1000):
        time_gap = np.random.uniform(0, 20) # mins
        opposite = np.random.randint(0, 2)
        track_occupied = np.random.randint(0, 2)
        
        # Logic: If gap is small and opposite direction on single line -> Conflict
        is_conflict = 0
        if time_gap < 5 and opposite == 1:
            is_conflict = 1
        
        conflicts.append({
            "track_id": np.random.randint(1, 5),
            "time_gap": time_gap,
            "opposite_direction": opposite,
            "is_conflict": is_conflict
        })
    df_conf = pd.DataFrame(conflicts)
    df_conf.to_csv(f"{DATA_DIR}/conflict_cases.csv", index=False)
    print(" - conflict_cases.csv")
    
    # 6. Delay Logs
    logs = []
    reasons = ["Signal Failure", "Track Maintenance", "Weather", "Crossing", "Late Arrival"]
    for _ in range(500):
        logs.append({
            "log_id": f"LOG-{np.random.randint(1000, 9999)}",
            "train_id": np.random.choice(train_ids),
            "delay_minutes": np.random.exponential(15),
            "reason": np.random.choice(reasons)
        })
    df_logs = pd.DataFrame(logs)
    df_logs.to_csv(f"{DATA_DIR}/delay_logs.csv", index=False)
    print(" - delay_logs.csv")
    
    print("All datasets generated.")

if __name__ == "__main__":
    generate_datasets()
