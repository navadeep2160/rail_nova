from typing import List, Tuple
from .models import Train, Block, Alert, AlertType
from datetime import datetime

# We will need the MLService instance. 
# Ideally passed in, but for this structure we might access via global or import in function scope to avoid circular deps if needed.
# Better pattern: Pass ml_service to the check functions.

def check_head_on(trains: List[Train]) -> List[Alert]:
    alerts = []
    # Simplified logic: In this prototype, we assume single track (SC-KZJ main up/down simplified to 1 line for head-on check demo)
    return alerts

def check_rear_end(trains: List[Train], safe_distance_km: float = 2.0) -> List[Alert]:
    alerts = []
    sorted_trains = sorted(trains, key=lambda t: t.distance)
    
    for i in range(len(sorted_trains) - 1):
        t1 = sorted_trains[i]
        t2 = sorted_trains[i+1]
        
        distance_gap = t2.distance - t1.distance
        
        if distance_gap < safe_distance_km and distance_gap > 0:
            severity = AlertType.CRITICAL if distance_gap < 1.0 else AlertType.MAJOR
            
            alerts.append(Alert(
                id=int(datetime.now().timestamp() + i), 
                type=severity,
                message=f"Collision Risk: {t1.name} and {t2.name} are too close ({distance_gap:.2f}km)",
                time=datetime.now().strftime("%H:%M:%S")
            ))
            
    return alerts

def check_overspeed(train: Train, block: Block) -> Alert:
    if train.speed > block.speed_limit:
        excess = train.speed - block.speed_limit
        severity = AlertType.MAJOR if excess > 20 else AlertType.MINOR
        
        return Alert(
            id=int(datetime.now().timestamp()),
            type=severity,
            message=f"Overspeed: {train.name} at {train.speed}km/h (Limit: {block.speed_limit})",
            time=datetime.now().strftime("%H:%M:%S")
        )
    return None

def check_ml_conflicts(trains: List[Train], ml_service) -> List[Alert]:
    alerts = []
    if not ml_service:
        return alerts
        
    # Check pairwise purely based on ML probability
    # Mock usage: We check if "gap" is narrowing fast or similar based on whatever ML model expects
    # Model expects: track_id, time_gap, opposite_dir
    # We iterate pairs
    sorted_trains = sorted(trains, key=lambda t: t.distance)
    for i in range(len(sorted_trains) - 1):
        t1 = sorted_trains[i]
        t2 = sorted_trains[i+1]
        
        # Determine features
        track_id = 1 # simplified
        gap = t2.distance - t1.distance
        # time_gap approx = gap / speed
        avg_speed = (t1.speed + t2.speed) / 2 or 1
        time_gap = gap / avg_speed
        
        try:
            prob = ml_service.predict_conflict(track_id, time_gap, 0) # 0 = same dir
            
            if prob > 0.6:
                severity = AlertType.CRITICAL if prob > 0.8 else AlertType.MAJOR
                alerts.append(Alert(
                    id=int(datetime.now().timestamp() + 100 + i),
                    type=severity,
                    message=f"AI Prediction: High conflict probability ({int(prob*100)}%) between {t1.name} and {t2.name}",
                    time=datetime.now().strftime("%H:%M:%S")
                ))
        except Exception as e:
            print(f"ML Conflict Check Failed: {e}")
            
    return alerts
