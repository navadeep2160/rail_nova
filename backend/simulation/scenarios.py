from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from .models import Train, Block, Alert

class WeatherCondition(str, Enum):
    CLEAR = "clear"
    RAIN = "rain"
    FOG = "fog"
    STORM = "storm"

class ScenarioModifier(BaseModel):
    train_delays: Dict[str, float] = Field(default_factory=dict, description="Train ID -> Added Delay in Minutes")
    block_maintenance: List[str] = Field(default_factory=list, description="List of Block IDs closed for maintenance")
    speed_limits: Dict[str, int] = Field(default_factory=dict, description="Block ID -> New Speed Limit")
    priorities: Dict[str, int] = Field(default_factory=dict, description="Train ID -> New Priority (1-5)")
    reroute_trains: List[str] = Field(default_factory=list, description="List of Train IDs to reroute via Loop Lines")
    weather: WeatherCondition = WeatherCondition.CLEAR

class ScenarioConfig(BaseModel):
    name: str = "New Scenario"
    modifiers: ScenarioModifier
    layout_name: str = "default"
    simulation_horizon_minutes: int = 60

class SimulationResult(BaseModel):
    scenario_id: str
    final_trains: List[Train]
    predicted_conflicts: List[Alert]
    block_utilization: Dict[str, float] = Field(description="Block ID -> % time occupied")
    max_delays: Dict[str, float] = Field(description="Train ID -> Max delay encountered")
    metrics: Dict[str, float] = Field(description="KPIs like avg_delay, throughput")
