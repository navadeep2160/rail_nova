from fastapi import FastAPI, WebSocket
from motor.motor_asyncio import AsyncIOMotorClient
import socketio

app = FastAPI()

# MongoDB setup
MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)
db = client.rail_nova

# Socket.IO setup (AsyncServer)
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

@app.get("/")
async def root():
    return {"message": "Rail-Nova Backend Operational"}

@sio.event
async def connect(sid, environ):
    print("connect ", sid)

@sio.event
async def disconnect(sid):
    print("disconnect ", sid)
