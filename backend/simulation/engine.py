import asyncio
import random
from typing import List, Dict
from datetime import datetime
from simulation.models import Train, Block, Alert, Suggestion, TrainStatus
from simulation.conflict_detector import check_rear_end, check_overspeed, check_ml_conflicts
from simulation.suggestions import generate_suggestions

# ... (rest of imports)

class SimulationEngine:
    def __init__(self, sio, db_service=None, ml_service=None):
        self.sio = sio
        self.db_service = db_service
        self.ml_service = ml_service
        self.trains: Dict[str, Train] = {
            "12723": Train(id="12723", name="Telangana Exp", speed=85.0, distance=10.0, lat=17.45, lng=78.55, status=TrainStatus.ON_TIME), # Eastbound
            "20701": Train(id="20701", name="Vande Bharat", speed=110.0, distance=5.0, lat=17.44, lng=78.51, status=TrainStatus.ON_TIME), # Eastbound (Fast)
            "17010": Train(id="17010", name="Intercity Exp", speed=60.0, distance=50.0, lat=17.65, lng=78.90, status=TrainStatus.DELAYED), # Westbound
            "11019": Train(id="11019", name="Konark Exp", speed=75.0, distance=80.0, lat=17.72, lng=79.15, status=TrainStatus.ON_TIME), # Westbound
            "GOODS-1": Train(id="GOODS-1", name="Freight I-20", speed=45.0, distance=30.0, lat=17.48, lng=78.65, status=TrainStatus.ON_TIME), # Eastbound (Slow)
            
            # Synthetic Data (Added based on User Request)
            "12760": Train(id="12760", name="Charminar Exp", speed=70.0, distance=15.0, lat=17.46, lng=78.58, status=TrainStatus.DELAYED), # Eastbound
            "17230": Train(id="17230", name="Sabari Exp", speed=80.0, distance=60.0, lat=17.68, lng=79.00, status=TrainStatus.ON_TIME), # Westbound
            "12604": Train(id="12604", name="Chennai Exp", speed=95.0, distance=25.0, lat=17.49, lng=78.70, status=TrainStatus.ON_TIME), # Eastbound
            "GOODS-2": Train(id="GOODS-2", name="Coal Heavy", speed=40.0, distance=70.0, lat=17.70, lng=79.10, status=TrainStatus.ON_TIME), # Westbound
            "47155": Train(id="47155", name="Local MMTS", speed=55.0, distance=8.0, lat=17.445, lng=78.53, status=TrainStatus.ON_TIME), # Eastbound
            "12862": Train(id="12862", name="Visakha Exp", speed=85.0, distance=40.0, lat=17.55, lng=78.85, status=TrainStatus.ON_TIME), # Eastbound
            "17659": Train(id="17659", name="Kakatiya Pass", speed=50.0, distance=12.0, lat=17.455, lng=78.56, status=TrainStatus.ON_TIME), # Eastbound
        }
        self.blocks: Dict[str, Block] = {} 
        self.alerts: List[Alert] = []
        self.suggestions: List[Suggestion] = []
        self.running = False

    async def run(self):
        self.running = True
        self.weather_condition = "clear" 
        
        while self.running:
             # 1. Update Positions (Simple Simulation)
            train_list = list(self.trains.values())
            
            # Weather Effect Multiplier
            weather_factor = 1.0
            if self.weather_condition == "rain":
                weather_factor = 0.8
            elif self.weather_condition == "fog":
                weather_factor = 0.7
            elif self.weather_condition == "storm":
                weather_factor = 0.5

            for train in train_list:
                # Calculate effective speed
                # If DELAYED/STOPPED, effective speed is 0
                if train.status in [TrainStatus.DELAYED, TrainStatus.STOPPED]:
                    effective_speed = 0.0
                else:
                    effective_speed = train.speed * weather_factor
                
                if effective_speed > 0:
                    # Move 0.001 deg lat/lng per tick approx (scaled by speed)
                    # 100 km/h approx -> 0.001 deg/sec
                    displacement = 0.0005 * (effective_speed / 100)
                    
                    # Directional Logic based on Train ID/Name (Mock)
                    # Odd IDs / Goods -> Eastbound (+lng)
                    # Even IDs -> Westbound (-lng) (Railway convention is usually Up/Down but mapping to ID works for demo)
                    
                    is_westbound = train.id in ["17010", "11019", "17230", "GOODS-2"] # Explicitly defined westbound trains
                    
                    if is_westbound:
                        train.lng -= displacement
                        # Naive Lat adjustment to follow line SC->KZJ (approx slope 0.5)
                        train.lat -= (displacement * 0.4) 
                    else:
                        train.lng += displacement
                        train.lat += (displacement * 0.4)
                    
                    # Reset if out of bounds (Loop Simulation)
                    if train.lng > 79.5: train.lng = 78.5; train.lat = 17.43
                    if train.lng < 78.5: train.lng = 79.5; train.lat = 17.97

                    # Update internal distance metric
                    train.distance += (effective_speed / 3600) # km per sec
            
            # 2. Detect Conflicts
            # Only check for new alerts if we don't have existing critical ones to avoid spam
            # Or better, just overwrite self.alerts but frontend needs to handle unique keys
            current_alerts = check_rear_end(train_list)
            
            # Check overspeed for each
            for train in train_list:
                limit = 100 * weather_factor # Limit also drops with weather
                alert = check_overspeed(train, Block(id="temp", section="temp", start_km=0, end_km=0, status="free", speed_limit=int(limit)))
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
                "suggestions": [s.dict() for s in self.suggestions],
                "weather": self.weather_condition
            }
            if self.sio:
                await self.sio.emit('state_update', state)

            # Wait for next tick
            await asyncio.sleep(1)

    def set_weather(self, condition: str):
        self.weather_condition = condition

    def inject_delay(self, train_id: str, minutes: int):
        if train_id in self.trains:
            train = self.trains[train_id]
            # Stop the train to simulate delay/holding
            train.status = TrainStatus.DELAYED
            train.speed = 0.0 
            print(f"Injected {minutes}m delay for {train_id} (Train Stopped)")

    def stop(self):
        self.running = False
