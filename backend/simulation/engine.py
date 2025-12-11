import asyncio
import random
from typing import List, Dict
from datetime import datetime
from .models import Train, Block, Alert, Suggestion, TrainStatus
from .conflict_detector import check_rear_end, check_overspeed
from .suggestions import generate_suggestions

# Simplified route map for interpolation (SC -> KZJ approx 130km)
# Station Lat/Lngs used to interpolate
ROUTE_POINTS = [
    (17.4334, 78.5044, 0),    # SC - 0km
    (17.4497, 78.5262, 5),    # MJF
    (17.4721, 78.5910, 12),   # CHZ
    (17.4589, 78.6823, 22),   # GT
    (17.4744, 78.7902, 35),   # BN
    (17.5134, 78.8920, 50),   # BG
    (17.6534, 79.0520, 75),   # ALER
    (17.7244, 79.1620, 95),   # ZN
    (17.9784, 79.4890, 137),  # KZJ
]

class SimulationEngine:
    def __init__(self, sio, db_service=None):
        self.sio = sio
        self.db_service = db_service
        self.trains: Dict[str, Train] = {}
        self.blocks: Dict[str, Block] = {}
        self.alerts: List[Alert] = []
        self.suggestions: List[Suggestion] = []
        self.running = False
        
        # Initialize mock data
        self._init_data()

    def _init_data(self):
        # Sample Trains
        self.trains["12723"] = Train(
            id="12723", name="Telangana Exp", speed=80.0, distance=10.0, 
            lat=17.46, lng=78.56, status=TrainStatus.ON_TIME
        )
        self.trains["17010"] = Train(
            id="17010", name="Intercity Exp", speed=60.0, distance=5.0, 
            lat=17.45, lng=78.53, status=TrainStatus.DELAYED
        )
        
        # Sample Blocks
        self.blocks["BLK-SC-MJF"] = Block(id="BLK-SC-MJF", section="SC-MJF", start_km=0, end_km=5, status="occupied", active_train_id="17010")
        self.blocks["BLK-MJF-CHZ"] = Block(id="BLK-MJF-CHZ", section="MJF-CHZ", start_km=5, end_km=12, status="occupied", active_train_id="12723")

    def _update_position(self, train: Train, dt: float):
        if train.status == TrainStatus.STOPPED:
            return

        # Distance = Speed * Time
        # Speed in km/h, dt in seconds -> km/s = speed / 3600
        dist_change = (train.speed / 3600.0) * dt # dt is roughly 1s usually
        train.distance += dist_change
        
        # Reset if end of line (Loop simulation)
        MAX_KM = 137
        if train.distance > MAX_KM:
            train.distance = 0
            
        # Interpolate Lat/Lng based on distance
        # Find segment
        for i in range(len(ROUTE_POINTS) - 1):
            p1 = ROUTE_POINTS[i]
            p2 = ROUTE_POINTS[i+1]
            if p1[2] <= train.distance <= p2[2]:
                # Interpolate
                segment_len = p2[2] - p1[2]
                progress = (train.distance - p1[2]) / segment_len
                train.lat = p1[0] + (p2[0] - p1[0]) * progress
                train.lng = p1[1] + (p2[1] - p1[1]) * progress
                break

    async def run(self):
        print("Simulation Engine Started")
        self.running = True
        while self.running:
            start_time = datetime.now()
            
            # 1. Move Trains
            train_list = list(self.trains.values())
            for train in train_list:
                self._update_position(train, 1.0) # 1 second tick
                
                # Random speed fluctuation
                train.speed = max(0, min(120, train.speed + random.uniform(-2, 2)))
                
                # Log event occasionally (e.g., simplified for demo: log every tick is too much, so maybe random or just assume logged)
                # In real scenario: Log on block change or significant speed change.
                # For demo, let's log continuously? No, too much DB ID.
                # Let's log only if speed changes significantly or block changes.
                pass

            # 2. Detect Conflicts
            current_alerts = check_rear_end(train_list)
            # Check overspeed for each
            for train in train_list:
                # Mock block lookup
                alert = check_overspeed(train, Block(id="temp", section="temp", start_km=0, end_km=0, status="free", speed_limit=100))
                if alert:
                    current_alerts.append(alert)
            self.alerts = current_alerts

            # 3. Generate Suggestions
            self.suggestions = generate_suggestions(train_list, self.alerts)

            # 4. Broadcast State
            state = {
                "trains": [t.dict() for t in train_list],
                "alerts": [a.dict() for a in self.alerts],
                "suggestions": [s.dict() for s in self.suggestions]
            }
            if self.sio:
                await self.sio.emit('state_update', state)

            # Wait for next tick
            await asyncio.sleep(1)

    def stop(self):
        self.running = False
