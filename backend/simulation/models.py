from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class TrainStatus(str, Enum):
    ON_TIME = "on-time"
    DELAYED = "delayed"
    STOPPED = "stopped"

class Train(BaseModel):
    id: str
    name: str
    speed: float  # km/h
    distance: float # km from SC
    lat: float
    lng: float
    status: TrainStatus
    route_id: str = "SC-KZJ"
    next_station_id: Optional[str] = None

class BlockStatus(str, Enum):
    FREE = "free"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"

class Block(BaseModel):
    id: str
    section: str # e.g., "SC-MJF"
    start_km: float
    end_km: float
    status: BlockStatus
    active_train_id: Optional[str] = None
    speed_limit: int = 100

class AlertType(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"

class Alert(BaseModel):
    id: int
    type: AlertType
    message: str
    time: str

class Suggestion(BaseModel):
    id: str
    train_id: str
    action: str # "STOP", "SLOW_DOWN", "REROUTE"
    reason: str
    confidence: float
