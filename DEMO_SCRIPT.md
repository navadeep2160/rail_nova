# Rail-Nova Demo Script (2 Minutes)

## Scenario 1: Platform Conflict & Resolution
**Goal:** Demonstrate Conflict Detection and AI suggestions.
1.  **View**: Start at **Live Control**.
2.  **Action**: Wait for 17010 and 12723 to approach SC-MJF block.
3.  **Observation**: 
    -   See Red Badge appear in **Alerts Panel** ("Collision Risk").
    -   See **AI Copilot** pop up: "Action: EMERGENCY STOP".
4.  **Action**: Click "Execute" in AI Assistant.
5.  **Result**: 17010 slows down (simulated), alert clears.

## Scenario 2: Freight Congestion Analysis
**Goal:** Show Analytics capabilities.
1.  **View**: Navigate to **Analytics** (Sidebar).
2.  **Action**: Scroll through the dashboards.
3.  **Narrative**: "Our ML models analyze historical patterns. Here we see Block SC-MJF is 85% congested."
4.  **Action**: Click **Export JSON**.
5.  **Result**: Download analytics report for offline processing.

## Scenario 3: Weather Impact & "What-If"
**Goal:** Show What-If Simulation Engine.
1.  **View**: Navigate to **What-If Engine**.
2.  **Action**: 
    -   Set **Weather** to "Storm" (Heavy Rain).
    -   Select **Close Block** for `BLK-MJF-CHZ`.
3.  **Action**: Click **Run Simulation**.
4.  **Observation**:
    -   **Predicted Delays** chart spikes up.
    -   Visual map shows halted trains at MJF.
5.  **Narrative**: "The engine predicts cascade delays of 45 minutes due to the storm and maintenance."
