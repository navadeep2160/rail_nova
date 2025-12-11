from typing import List, Tuple
from .models import Train, Block, Alert, AlertType
from datetime import datetime

def check_head_on(trains: List[Train]) -> List[Alert]:
    alerts = []
    # Simplified logic: In this prototype, we assume single track (SC-KZJ main up/down simplified to 1 line for head-on check demo)
    # Real logic would check track_id.
    # Here we simulate by checking if two trains are on collision course close to each other
    # For phase 2 demo, we'll return empty as we are mostly simulating one-way traffic flow initially.
    return alerts

def check_rear_end(trains: List[Train], safe_distance_km: float = 2.0) -> List[Alert]:
    alerts = []
    # Sort trains by distance
    sorted_trains = sorted(trains, key=lambda t: t.distance)
    
    for i in range(len(sorted_trains) - 1):
        t1 = sorted_trains[i]
        t2 = sorted_trains[i+1]
        
        distance_gap = t2.distance - t1.distance
        
        if distance_gap < safe_distance_km and distance_gap > 0:
            alerts.append(Alert(
                id=int(datetime.now().timestamp()), # basic ID generation
                type=AlertType.CRITICAL,
                message=f"Collision Risk: {t1.name} and {t2.name} are too close ({distance_gap:.2f}km)",
                time=datetime.now().strftime("%H:%M:%S")
            ))
            
    return alerts

def check_overspeed(train: Train, block: Block) -> Alert:
    if train.speed > block.speed_limit:
        return Alert(
            id=int(datetime.now().timestamp()),
            type=AlertType.WARNING,
            message=f"Overspeed: {train.name} at {train.speed}km/h (Limit: {block.speed_limit})",
            time=datetime.now().strftime("%H:%M:%S")
        )
    return None
