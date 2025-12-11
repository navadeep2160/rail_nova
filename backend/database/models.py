from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TrainEvent(BaseModel):
    train_no: str
    event_type: str # e.g., "MOVEMENT", "STOP", "START"
    time: datetime
    block: str
    speed: float
    delay: float

class BlockLog(BaseModel):
    block_id: str
    occupied_by: str
    time_entered: datetime
    time_left: Optional[datetime] = None

class ConflictLog(BaseModel):
    conflict_type: str
    trains: List[str]
    location: str
    time: datetime
    severity: str

class AISuggestionLog(BaseModel):
    suggestion_id: str
    trains: List[str]
    type: str # "STOP", "SLOW_DOWN"
    reason: str
    timestamp: datetime

class OverrideLog(BaseModel):
    user_action: str
    target: str
    reason: str
    timestamp: datetime
