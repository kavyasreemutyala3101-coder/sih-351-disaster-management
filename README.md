# NEXUS-FLOOD

> **AI-Powered Urban Flood Nowcasting & Multi-Hazard Earth Intelligence Platform**  
> *Tagline: "See the Rain. Understand the Drain. Predict the Flood."*

Developed for **Smart India Hackathon 2026** (Problem Statement: *Urban Flood Nowcasting System - Drainage & Rainfall Coupling*, Team ID: **TEAM-351**, Team Name: **Cloud Nine Encoders**).

---

## 🌟 Overview

Standard weather apps tell you that it is raining. **NEXUS-FLOOD** understands what the rain is doing to the city's drainage network.

By coupling live satellite precipitation, radar data, IoT sensors, CPHEEO drainage capacities, silt blockage %, soil moisture, and GIS terrain elevation ($Q = C \times I \times A$), NEXUS-FLOOD predicts:
1. **WHERE** flooding is likely to occur (street-level grid cells).
2. **HOW SEVERE** it will become (water depth in meters & risk level).
3. **HOW SOON** it could happen (estimated onset lead time in minutes).
4. **WHY** the AI predicts that risk (Explainable AI SHAP factor attribution).
5. **WHAT ACTION** should be taken (Municipal Priority Response Queue & Citizen Diversions).

---

## 🛠️ Technology Stack

- **Backend**: Python 3.14 + FastAPI + Uvicorn + WebSockets
- **Machine Learning**: XGBoost Regressor + Random Forest Regressor + Scikit-Learn
- **Hydrology Engine**: Rational Method & SWMM-inspired surface runoff coupling
- **Frontend**: Vite + React 18 + Three.js + Leaflet.js + Chart.js
- **Styling**: Vanilla CSS3 Glassmorphism Dark Control-Room Aesthetic
- **Database**: SQLite3 (with spatial grid cell capabilities)
- **Live APIs**: Open-Meteo Weather API + USGS Real-Time Earthquakes

---

## 🚀 Quick Start Guide

### 1. Backend & ML Setup
```bash
# Install Python requirements
pip install -r requirements.txt

# Train ML Models (XGBoost & Random Forest)
python ml/train_model.py

# Initialize SQLite Database & Seed Data
python backend/database.py

# Start Backend FastAPI Server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🛰️ API Endpoints

- `GET /api/health` — System status & ML model check
- `GET /api/satellite/live` — Live Open-Meteo satellite weather telemetry
- `POST /api/predict/satellite` — Satellite-driven AI flood & landslide prediction
- `GET /api/flood-risk` — Grid cell flood risk nowcast & timeline
- `POST /api/predict` — Dynamic hydrometric ML prediction
- `POST /api/simulate` — What-If scenario simulation
- `GET /api/drains` — Drainage Digital Twin network graph
- `GET /api/disasters` — Regional multi-hazard events
- `GET /api/alerts` — Municipal alerts & Priority Response Queue
- `POST /api/assistant/ask` — Conversational NEXUS AI Assistant
- `WS /ws/live` — Live WebSocket telemetry stream

---

## 🏆 Judge Presentation Pitch

> *"Traditional systems tell you it's raining. NEXUS-FLOOD couples rainfall with live drainage stress to give minutes-to-hours lead time on WHERE, HOW SEVERE, HOW SOON, WHY, and WHAT TO DO. From reactive response to proactive flood nowcasting."*
