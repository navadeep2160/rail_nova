from typing import Dict, List, Optional
import copy
import logging
from datetime import datetime, timedelta
from simulation.models import Train, Block, Alert, TrainStatus, Suggestion, AlertType
from simulation.scenarios import ScenarioConfig, ScenarioModifier, SimulationResult, WeatherCondition
from simulation.conflict_detector import check_rear_end, check_overspeed

# Shared Constants (Should be in a config file ideally)
MAX_ROUTE_KM = 137
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

class WhatIfEngine:
    def __init__(self, current_trains: Dict[str, Train], current_blocks: Dict[str, Block]):
        # DEEP COPY to ensure we don't mutate live state
        self.trains = {tid: train.copy() for tid, train in current_trains.items()}
        self.blocks = {bid: block.copy() for bid, block in current_blocks.items()}
        self.alerts: List[Alert] = []
        self.time_elapsed = 0 # seconds
        self.block_utilization_counters = {bid: 0 for bid in self.blocks}
        self.total_steps = 0
        self.max_delays = {tid: 0.0 for tid in self.trains}
        self.etas = {tid: None for tid in self.trains} # Estimated Arrival Time (datetime string)
        
        # Internal State for Logic
        self.rerouted_trains = set()
        self.train_priorities = {} # tid -> int

    def apply_scenario(self, config: ScenarioConfig):
        mods = config.modifiers
        
        # 0. Setup Priorities & Reroutes
        self.rerouted_trains = set(mods.reroute_trains)
        self.train_priorities = mods.priorities

        # 1. Apply Weather (Global Speed Impact)
        speed_factor = 1.0
        if mods.weather == WeatherCondition.RAIN:
            speed_factor = 0.85
        elif mods.weather == WeatherCondition.FOG:
            speed_factor = 0.60
        elif mods.weather == WeatherCondition.STORM:
            speed_factor = 0.40
            
        # 2. Apply Custom Delays & Priorities
        for tid, train in self.trains.items():
            # Initial delays (Reduce speed temporarily or set status)
            if tid in mods.train_delays:
                # Mock: Add 'virtual' distance penalty or just reduce initial speed drastically
                # Real implementation might shift start time. 
                # Here we just slash speed to simulate "slow start"
                train.speed = 0 # Stop it initially for "delay" minutes?
                # Complex handling simplified: we track 'startup delay' logic if needed
                # For now, let's just assume custom delay means it's STOPPED for X minutes
                # We can't easily simulate "stop for X mins" without a state machine in this loop
                # So we simply reduce speed factor heavily for this run
                train.speed *= 0.5 
            
            # Weather effect
            train.speed *= speed_factor

        # 3. Apply Block Maintenance / Speed Limits
        for bid, block in self.blocks.items():
            if bid in mods.block_maintenance:
                block.status = "maintenance" 
                block.speed_limit = 0
            elif bid in mods.speed_limits:
                block.speed_limit = mods.speed_limits[bid]

    def _get_block_for_km(self, km: float) -> Optional[Block]:
        for block in self.blocks.values():
            if block.start_km <= km <= block.end_km:
                return block
        return None

    def _interpolate_position(self, train: Train):
        for i in range(len(ROUTE_POINTS) - 1):
            p1 = ROUTE_POINTS[i]
            p2 = ROUTE_POINTS[i+1]
            if p1[2] <= train.distance <= p2[2]:
                segment_len = p2[2] - p1[2]
                progress = (train.distance - p1[2]) / segment_len
                train.lat = p1[0] + (p2[0] - p1[0]) * progress
                train.lng = p1[1] + (p2[1] - p1[1]) * progress
                break
                
    def _calculate_eta(self, train: Train, current_sim_time: datetime) -> str:
        # Simple ETA: Distance Left / Current Speed
        # If speed is 0, return "Unknown" or heavily delayed
        dist_left = MAX_ROUTE_KM - train.distance
        if dist_left <= 0:
            return current_sim_time.strftime("%H:%M:%S")
            
        if train.speed < 1:
            # If stopped, assume huge delay or use avg speed
            avg_speed = 30 # km/h fallback
            hours_left = dist_left / avg_speed
        else:
            hours_left = dist_left / train.speed
            
        eta_time = current_sim_time + timedelta(hours=hours_left)
        return eta_time.strftime("%H:%M:%S")

    def run(self, horizon_minutes: int = 60) -> SimulationResult:
        horizon_seconds = horizon_minutes * 60
        step_size = 10 
        steps = horizon_seconds // step_size
        self.total_steps = steps
        
        sim_start_time = datetime.now()
        
        # Sort trains by position (closest to destination first) for signal propagation
        # We need to process trains from FRONT to BACK to handle rear-end stopping
        
        for _ in range(steps):
            self.time_elapsed += step_size
            curr_time = sim_start_time + timedelta(seconds=self.time_elapsed)
            
            # --- DELAY PROPAGATION LOGIC ---
            # Sort trains by distance descending (Highest distance = closest to KZJ)
            sorted_trains = sorted(self.trains.values(), key=lambda t: t.distance, reverse=True)
            
            for i, train in enumerate(sorted_trains):
                if train.status == TrainStatus.STOPPED:
                    continue
                    
                # 1. Check Train Ahead (if not rerouted)
                # If I am NOT rerouted, I must respect train ahead
                # If I am rerouted (loop line), I can arguably overtake (ignore train ahead close proximity)
                
                target_speed = train.speed
                
                # Check block limit
                current_block = self._get_block_for_km(train.distance)
                if current_block:
                    if current_block.status == "maintenance" and train.id not in self.rerouted_trains:
                         target_speed = 0 # Blocked
                    else:
                        target_speed = min(target_speed, current_block.speed_limit)

                # Check Rear-End Safety (Simulated Signal)
                # Look at immediate train ahead
                if i > 0: # Because sorted desc, i-1 is AHEAD of i ?? 
                    # WAIT. Sorted Descending: 
                    # Index 0: 100km (Front)
                    # Index 1: 90km (Behind)
                    # So train ahead of 'train' is sorted_trains[i-1]
                    
                    train_ahead = sorted_trains[i-1]
                    
                    # If either is rerouted, ignore conflict (assume separate tracks)
                    if train.id not in self.rerouted_trains and train_ahead.id not in self.rerouted_trains:
                        gap = train_ahead.distance - train.distance
                        if gap < 2.0: # < 2km Danger checks
                             # RED SIGNAL
                             target_speed = 0
                        elif gap < 5.0:
                             # YELLOW SIGNAL
                             target_speed = min(target_speed, 30) # Slow approach
                
                # Update Distance
                dist_change = (target_speed / 3600.0) * step_size
                train.distance += dist_change
                
                # Metrics
                if target_speed < 1 and train.distance < MAX_ROUTE_KM:
                     self.max_delays[train.id] = self.max_delays.get(train.id, 0) + (step_size/60.0)

                # Loop Logic
                if train.distance > MAX_ROUTE_KM:
                    train.distance = MAX_ROUTE_KM # Stop at destination for this sim or loop?
                    # Let's say it stays at MAX_KM (Finished)
                    train.status = TrainStatus.STOPPED
                    train.speed = 0

                # Interpolate
                self._interpolate_position(train)
                
                # Update final ETA constantly
                self.etas[train.id] = self._calculate_eta(train, curr_time)

            # Check Conflicts (for recording)
            new_alerts = check_rear_end(list(self.trains.values()))
            # Filter rerouted conflicts
            filtered_alerts = []
            for a in new_alerts:
                # Parse checking names is hard, let's rely on conflict detector returning IDs if possible
                # But current detector returns formatted string.
                # For now, just add them.
                if not any(exist.message == a.message for exist in self.alerts):
                    self.alerts.append(a)

            # Check Utilization
            for train in self.trains.values():
                blk = self._get_block_for_km(train.distance)
                if blk:
                    self.block_utilization_counters[blk.id] += 1
        
        # Compile Results
        utilization_pct = {
            bid: (count * step_size / horizon_seconds) * 100 
            for bid, count in self.block_utilization_counters.items()
        }
        
        # Attach ETAs to trains (hacky via dynamic prop or just trust client to read it? 
        # Models.py train doesn't have ETA field.
        # We'll just return it in final structure if needed, or stick to 'final_trains'
        # Let's add 'eta' to the Train object dynamically or ignore invalid fields warning)
        # Better: The UI can calculate ETA or we pass it in 'metrics'
        
        return SimulationResult(
            scenario_id="sim_" + str(int(self.time_elapsed)),
            final_trains=list(self.trains.values()),
            predicted_conflicts=self.alerts,
            block_utilization=utilization_pct,
            max_delays=self.max_delays,
            metrics={
                "duration_simulated_min": horizon_minutes,
                # "etas": self.etas # Pydantic might complain if not in schema
            }
        )

