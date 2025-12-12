import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import socketio
from contextlib import asynccontextmanager

from simulation.engine import SimulationEngine
from database.service import DatabaseService
from ml_service import MLService
from datetime import datetime
from api.what_if import router as what_if_router
from api.analytics import router as analytics_router
from api.simulation import router as simulation_router

# Socket.IO setup (AsyncServer)
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Global Engine Instance
simulation_engine = None
db_service = None
ml_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global simulation_engine, db_service, ml_service
    
    # DB Init
    db_service = DatabaseService(db)
    # ML Init
    ml_service = MLService()
    
    print("Initializing Simulation Engine...")
    simulation_engine = SimulationEngine(sio, db_service, ml_service)
    app.state.simulation_engine = simulation_engine # Expose to API routers
    task = asyncio.create_task(simulation_engine.run())
    yield
    # Shutdown
    print("Shutting down Simulation Engine...")
    simulation_engine.stop()
    await task

app = FastAPI(lifespan=lifespan)
socket_app = socketio.ASGIApp(sio, app)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)
db = client.rail_nova

@app.get("/")
async def root():
    return {"message": "Rail-Nova Backend Operational"}

app.include_router(what_if_router)
app.include_router(analytics_router)
app.include_router(simulation_router)

# API Endpoints
# ML Endpoints
@app.post("/ml/predict/eta")
async def predict_eta(data: dict):
    if ml_service:
        return {"eta": ml_service.predict_eta(data['speed'], data['dist'], data['delay'], data['hour'])}
    return {"error": "ML Service Unavailable"}

@app.post("/ml/predict/delay")
async def predict_delay(data: dict):
    if ml_service:
        return {"predicted_delay": ml_service.predict_delay(data['weather'], data['priority'], data['current_delay'])}
    return {"error": "ML Service Unavailable"}

@app.post("/ml/predict/conflict")
async def predict_conflict(data: dict):
    if ml_service:
        return {"conflict_prob": ml_service.predict_conflict(data['track_id'], data['time_gap'], data['opposite_dir'])}
    return {"error": "ML Service Unavailable"}

@app.post("/ml/predict/congestion")
async def predict_congestion(data: dict):
    if ml_service:
        hours = data.get('hours', 24)
        return {"forecast": ml_service.predict_congestion(hours)}
    return {"error": "ML Service Unavailable"}

@app.post("/ml/explain/delay")
async def explain_delay(data: dict):
    if ml_service:
        return {"explanation": ml_service.explain_delay(data['weather'], data['priority'], data['current_delay'])}
    return {"error": "ML Service Unavailable"}

@app.post("/ml/explain/conflict")
async def explain_conflict(data: dict):
    if ml_service:
        return {"explanation": ml_service.explain_conflict(data['track_id'], data['time_gap'], data['opposite_dir'])}
    return {"error": "ML Service Unavailable"}

@app.get("/history/replay")
async def get_history(from_time: str, to_time: str):
    if db_service:
        try:
            start = datetime.fromisoformat(from_time)
            end = datetime.fromisoformat(to_time)
            return await db_service.get_replay_data(start, end)
        except ValueError:
            return {"error": "Invalid date format. Use ISO 8601"}
    return []

@app.get("/trains/live")
async def get_live_trains():
    if simulation_engine:
        return [t.dict() for t in simulation_engine.trains.values()]
    return []

@app.get("/blocks/live")
async def get_live_blocks():
    if simulation_engine:
        return [b.dict() for b in simulation_engine.blocks.values()]
    return []

@app.get("/suggestions/latest")
async def get_suggestions():
    if simulation_engine:
        return [s.dict() for s in simulation_engine.suggestions]
    return []

@app.post("/scenario/apply")
async def apply_scenario(data: dict):
    # Placeholder for scenario injection logic
    return {"status": "applied", "scenario": data}

# WebSocket Events
@sio.event
async def connect(sid, environ):
    print("Client connected:", sid)
    # Send initial state immediately
    if simulation_engine:
        state = {
            "trains": [t.dict() for t in simulation_engine.trains.values()],
            "alerts": [a.dict() for a in simulation_engine.alerts],
            "suggestions": [s.dict() for s in simulation_engine.suggestions]
        }
        await sio.emit('state_update', state, to=sid)

@sio.event
async def disconnect(sid):
    print("Client disconnected:", sid)

