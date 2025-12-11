# Rail-Nova: AI-Powered Train Traffic Control System

**Hackathon Submission - Phase 8**

Rail-Nova is a Digital Twin for Indian Railways, featuring Real-time Simulation, ML-driven Conflict Detection, and a "What-If" Planning Engine.

## Project Structure
- `backend/`: FastAPI server, Simulation Engine, ML Service
- `frontend/`: React + Vite Dashboard, Leaflet Map
- `ml/`: Machine Learning Models & Training Scripts
- `datasets/`: Synthetic data for training

## Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB (running locally on port 27017)

## Quick Start

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
- Open `http://localhost:5173`
- **Live Control**: View moving trains and alerts.
- **What-If Engine**: Simulate delays/weather.
- **Analytics**: View system performance.

## Key Features
- **Real-Time Simulation**: 1-second tick updates via WebSockets.
- **ML Conflict Prediction**: Probability-based alerts.
- **AI Copilot**: Automated resolution suggestions.
- **Interactive Map**: Live train tracking and block status.
