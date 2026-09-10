import requests
import time
import subprocess
import os

def test_backend_direct():
    from backend.routes.api import health_check, run_prediction, PredictRequest, get_drains, get_flood_risk_map
    
    print("Testing health check...")
    h = health_check()
    print("Health:", h)
    
    print("Testing drains...")
    d = get_drains()
    print(f"Drains retrieved: {len(d['drains'])} nodes.")
    
    print("Testing ML prediction endpoint...")
    req = PredictRequest(rainfall_intensity=75.0, rainfall_1hr=75.0, drainage_capacity=950.0, blockage_percentage=40.0, elevation=14.0)
    p = run_prediction(req)
    print("Prediction Result:", p["prediction"])
    print("Hydrology:", p["hydrology"])
    print("Time to flood:", p["time_to_flood"])
    print("XAI:", p["explanation"])
    
    print("Testing flood map...")
    m = get_flood_risk_map()
    print(f"Flood risk map cells: {len(m['grid_cells'])}")
    print("All backend direct Python unit tests passed!")

if __name__ == "__main__":
    test_backend_direct()
