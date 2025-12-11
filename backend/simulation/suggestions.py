from typing import List
from .models import Train, Suggestion, Alert, AlertType
import uuid

def generate_suggestions(trains: List[Train], alerts: List[Alert]) -> List[Suggestion]:
    suggestions = []
    
    for alert in alerts:
        # CRITICAL / MAJOR handling
        if alert.type in [AlertType.CRITICAL, AlertType.MAJOR]:
            if "Collision" in alert.message:
                suggestions.append(Suggestion(
                    id=str(uuid.uuid4()),
                    train_id="affected_train", # idealized, normally we parse IDs
                    action="EMERGENCY STOP",
                    reason="Imminent collision risk detected by ML/Safety protocols.",
                    confidence=0.99,
                    predicted_effect="Prevents accident. Delay +10 mins.",
                    actions=["Emergency Stop", "Slow to 10km/h"]
                ))
            elif "Overspeed" in alert.message:
                suggestions.append(Suggestion(
                    id=str(uuid.uuid4()),
                    train_id="overspeed_train",
                    action="APPLY BRAKES",
                    reason="Train exceeds safety limits for this block.",
                    confidence=0.98,
                    predicted_effect="Speed normalized. Minor delay.",
                    actions=["Apply Brakes", "Coast"]
                ))
            elif "conflict probability" in alert.message:
                suggestions.append(Suggestion(
                    id=str(uuid.uuid4()),
                    train_id="conflict_pair",
                    action="REROUTE TO LOOP",
                    reason=f"ML Model predicts high conflict probability ({'85%+' if 'High' in alert.message else '60%+'}).",
                    confidence=0.85,
                    predicted_effect="Avoids congestion. ETA impact: +5 mins.",
                    actions=["Reroute via Loop A", "Hold at Previous Station"]
                ))

    # General Optimization Suggestions
    for train in trains:
        if train.status == "delayed" and train.speed < 40 and train.speed > 0:
             suggestions.append(Suggestion(
                id=str(uuid.uuid4()),
                train_id=train.id,
                action="PRIORITY PASS",
                reason=f"Train {train.name} accumulating delay.",
                confidence=0.75,
                predicted_effect="Recovers 5 mins of schedule.",
                actions=["Grant Signal Priority", "Skip minor stop"]
            ))
            
    return suggestions
