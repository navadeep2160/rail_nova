from fastapi import APIRouter, Request
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

# Pydantic Models for Response
class TrainUpdate(BaseModel):
    train_id: str
    lat: float
    lng: float
    speed: float
    delay: int
    status: str

@router.get("/updates", response_model=List[TrainUpdate])
async def get_simulation_updates(request: Request):
    """
    Get real-time updates of all trains in the simulation.
    Poll this every 2 seconds.
    """
    engine = request.app.state.simulation_engine
    if not engine:
         return []
    
    updates = []
    for train in engine.trains.values():
        t_update = TrainUpdate(
            train_id=train.id,
            lat=train.lat,
            lng=train.lng,
            speed=train.speed,
            delay=0, # Engine needs to track delay minutes, defaulting to 0 for now or fetch from specific field
            status=train.status.value if hasattr(train.status, 'value') else str(train.status)
        )
        updates.append(t_update)
    
    return updates

@router.post("/config/weather")
async def update_weather(request: Request, condition: str):
    """
    Update weather condition: clear, rain, fog, storm
    """
    engine = request.app.state.simulation_engine
    if engine:
        engine.set_weather(condition)
        return {"status": "updated", "weather": condition}
    return {"error": "Engine not running"}
