from fastapi import APIRouter
from typing import Dict, List
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/export")
async def export_analytics():
    # Mock data generation for Grafana/Dashboard
    
    # 1. Congestion (Block Utilization)
    congestion = {
        "BLK-SC-MJF": random.randint(40, 90),
        "BLK-MJF-CHZ": random.randint(20, 60),
        "BLK-CHZ-GT": random.randint(10, 40),
        "BLK-GT-BN": random.randint(50, 80)
    }
    
    # 2. Delay Trend (Linear mock)
    # Generate last 24 hours mock delays
    delay_trend = []
    now = datetime.now()
    for i in range(24):
        t = now - timedelta(hours=23-i)
        delay_trend.append({
            "time": t.strftime("%H:00"),
            "avg_delay_min": random.randint(5, 25)
        })
        
    # 3. Throughput
    throughput = random.randint(12, 18) # Trains per hour
    
    # 4. Conflict Heatmap (Lat/Lng buckets)
    # Simplified: List of conflict hotspots
    conflict_heatmap = [
        {"lat": 17.4334, "lng": 78.5044, "count": random.randint(1,5)}, # SC
        {"lat": 17.9784, "lng": 79.4890, "count": random.randint(0,2)}, # KZJ
    ]
    
    # 5. Avg Speed
    avg_speed = {
        "BLK-SC-MJF": random.randint(30, 60),
        "BLK-GT-BN": random.randint(70, 110)
    }

    return {
        "block_congestion": congestion,
        "delay_trend": delay_trend,
        "hourly_throughput": throughput,
        "conflict_heatmap": conflict_heatmap,
        "avg_speed_per_block": avg_speed,
        "generated_at": datetime.now().isoformat()
    }
