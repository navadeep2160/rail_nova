import asyncio
import random
from typing import List, Dict
from datetime import datetime
from .models import Train, Block, Alert, Suggestion, TrainStatus
from .conflict_detector import check_rear_end, check_overspeed, check_ml_conflicts
from .suggestions import generate_suggestions

# ... (rest of imports)

class SimulationEngine:
    def __init__(self, sio, db_service=None, ml_service=None):
        self.sio = sio
        self.db_service = db_service
        self.ml_service = ml_service
        self.trains: Dict[str, Train] = {
            "12723": Train(id="12723", name="Telangana Exp", speed=85.0, distance=10.0, lat=17.45, lng=78.55, status=TrainStatus.ON_TIME),
            "17010": Train(id="17010", name="Intercity Exp", speed=0.0, distance=50.0, lat=17.65, lng=78.90, status=TrainStatus.STOPPED) # Stopped initially
        }
        self.blocks: Dict[str, Block] = {} # Mock blocks if needed or load from config
        self.alerts: List[Alert] = []
        self.suggestions: List[Suggestion] = []
        self.running = False

    async def run(self):
        self.running = True
        while self.running:
             # 1. Update Positions (Simple Simulation)
            train_list = list(self.trains.values())
            # Basic linear movement update if speed > 0
            for train in train_list:
                if train.speed > 0:
                    # Move 0.001 deg lat/lng per tick approx
                    train.lng += 0.0005 * (train.speed / 100)
            
            # 2. Detect Conflicts
            current_alerts = check_rear_end(train_list)
            
            # Check overspeed for each
            for train in train_list:
                # Mock block lookup (simplified for prototype)
                alert = check_overspeed(train, Block(id="temp", section="temp", start_km=0, end_km=0, status="free", speed_limit=100))
                if alert:
                    current_alerts.append(alert)
            
            # Check ML Conflicts
            if self.ml_service:
                ml_alerts = check_ml_conflicts(train_list, self.ml_service)
                current_alerts.extend(ml_alerts)
                
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
