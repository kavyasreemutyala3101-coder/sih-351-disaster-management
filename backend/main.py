import asyncio
import json
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.database import init_db, seed_initial_data
from backend.routes.api import router as api_router
from backend.services.drainage_service import DrainageService

app = FastAPI(
    title="NEXUS-FLOOD Platform",
    description="AI-Powered Urban Flood Nowcasting & Multi-Hazard Earth Intelligence Platform (SIH 2026)",
    version="1.0.0"
)

# Enable CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)

# Mount frontend dist static files if built
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    seed_initial_data()
    print("NEXUS-FLOOD Backend initialized.")

# WebSocket Connection Manager for Live Dashboard Telemetry
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send live telemetry frame every 3 seconds
            await asyncio.sleep(3.0)
            
            drains = DrainageService.get_drain_network()
            live_rain = round(75.0 + random.uniform(-3.0, 3.0), 1)
            
            telemetry = {
                "type": "TELEMETRY_UPDATE",
                "timestamp": asyncio.get_event_loop().time(),
                "rainfall_intensity_mm_hr": live_rain,
                "overall_flood_probability": round(91.8 + random.uniform(-1.0, 1.0), 1),
                "estimated_onset_min": 18,
                "drains": drains,
                "data_badge": "LIVE_WEBSOCKET_STREAM"
            }
            await websocket.send_json(telemetry)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
