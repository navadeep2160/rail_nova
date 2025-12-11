import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import socketio
from contextlib import asynccontextmanager
from simulation.engine import SimulationEngine

# Socket.IO setup (AsyncServer)
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Global Engine Instance
simulation_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global simulation_engine
    print("Initializing Simulation Engine...")
    simulation_engine = SimulationEngine(sio)
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

# API Endpoints
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

