from typing import List
from .models import Train, Suggestion, Alert
import uuid

def generate_suggestions(trains: List[Train], alerts: List[Alert]) -> List[Suggestion]:
    suggestions = []
    
    for alert in alerts:
        if "Collision Risk" in alert.message:
            # Parse train names/ids from message (simplified for prototype)
            # real implementation would pass strict objects
            suggestions.append(Suggestion(
                id=str(uuid.uuid4()),
                train_id="affected_train", 
                action="STOP",
                reason="Immediate collision risk detected",
                confidence=0.98
            ))
        elif "Overspeed" in alert.message:
             suggestions.append(Suggestion(
                id=str(uuid.uuid4()),
                train_id="overspeeding_train",
                action="REDUCE SPEED",
                reason="Speed exceeds block limit",
                confidence=0.95
            ))
            
    # Priority logic
    for train in trains:
        if train.status == "delayed" and train.speed < 40:
             suggestions.append(Suggestion(
                id=str(uuid.uuid4()),
                train_id=train.id,
                action="PRIORITY CLEARANCE",
                reason=f"Train {train.name} is significant delayed",
                confidence=0.75
            ))
            
    return suggestions
