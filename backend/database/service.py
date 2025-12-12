from motor.motor_asyncio import AsyncIOMotorDatabase
from database.models import TrainEvent, ConflictLog, AISuggestionLog
from typing import List
from datetime import datetime

class DatabaseService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.train_events = db.train_events
        self.conflict_logs = db.conflict_logs
        self.suggestions = db.ai_suggestions

    async def log_train_event(self, event: TrainEvent):
        await self.train_events.insert_one(event.dict())

    async def log_conflict(self, conflict: ConflictLog):
        await self.conflict_logs.insert_one(conflict.dict())

    async def log_suggestion(self, suggestion: AISuggestionLog):
        await self.suggestions.insert_one(suggestion.dict())
        
    async def get_replay_data(self, start_time: datetime, end_time: datetime):
        # Fetch events within range
        events = await self.train_events.find({
            "time": {"$gte": start_time, "$lte": end_time}
        }).to_list(length=2000)
        
        # Convert _id to string for JSON serialization if needed
        for e in events:
            e["_id"] = str(e["_id"])
            
        return events
