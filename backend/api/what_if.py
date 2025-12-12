from fastapi import APIRouter, HTTPException, Request
from simulation.scenarios import ScenarioConfig, SimulationResult
from simulation.what_if_engine import WhatIfEngine

router = APIRouter(prefix="/api/what-if", tags=["what-if"])

@router.post("/simulate", response_model=SimulationResult)
async def run_what_if_simulation(config: ScenarioConfig, request: Request):
    simulation_engine = getattr(request.app.state, "simulation_engine", None)
    
    if not simulation_engine:
        raise HTTPException(status_code=503, detail="Simulation Engine not ready or not initialized")
        
    # 1. Create What-If Engine instance with CLONED state
    # simulation_engine.trains and simulation_engine.blocks are the live state
    what_if = WhatIfEngine(simulation_engine.trains, simulation_engine.blocks)
    
    # 2. Apply Scenario Modifiers
    what_if.apply_scenario(config)
    
    # 3. Run Simulation
    result = what_if.run(horizon_minutes=config.simulation_horizon_minutes)
    
    return result
