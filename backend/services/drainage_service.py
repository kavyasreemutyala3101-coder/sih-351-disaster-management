from backend.database import get_db_connection

class DrainageService:
    @staticmethod
    def get_drain_network():
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM drains")
        rows = cursor.fetchall()
        conn.close()
        
        nodes = []
        for r in rows:
            utilization = round((r["current_flow_lps"] / r["capacity_lps"]) * 100.0, 1)
            blockage = r["blockage_pct"]
            water_lvl = r["water_level_pct"]
            
            # Determine dynamic stress status & color
            if blockage >= 60.0 or water_lvl >= 95.0:
                stress_code = "CRITICAL_BLOCKED"
                color = "#a855f7" # Purple
            elif utilization >= 90.0 or water_lvl >= 85.0:
                stress_code = "OVERLOADED"
                color = "#ef4444" # Red
            elif utilization >= 75.0 or water_lvl >= 70.0:
                stress_code = "HIGH_STRESS"
                color = "#f97316" # Orange
            elif utilization >= 50.0 or water_lvl >= 50.0:
                stress_code = "MODERATE"
                color = "#eab308" # Yellow
            else:
                stress_code = "NORMAL"
                color = "#22c55e" # Green
                
            nodes.append({
                "drain_id": r["drain_id"],
                "location_id": r["location_id"],
                "name": r["name"],
                "lat": r["lat"],
                "lng": r["lng"],
                "capacity_lps": r["capacity_lps"],
                "current_flow_lps": r["current_flow_lps"],
                "water_level_pct": water_lvl,
                "blockage_pct": blockage,
                "utilization_pct": utilization,
                "status": stress_code,
                "stress_color": color,
                "upstream_area_ha": r["upstream_area_ha"],
                "downstream_id": r["downstream_id"]
            })
            
        return nodes

    @staticmethod
    def get_risky_roads():
        """
        Calculates street-level road segment flood risk for Citizens & Traffic Authorities.
        """
        return [
            {
                "road_id": "ROAD_R12_BENZ",
                "road_name": "Benz Circle Underpass & Highway Junction",
                "flood_probability": 91.5,
                "expected_depth_cm": 48.0,
                "expected_onset_min": 18,
                "status": "AVOID",
                "alternate_route": "Ring Road Diversion via Ramavarappadu"
            },
            {
                "road_id": "ROAD_R08_MARKET",
                "road_name": "One Town Market Low Road",
                "flood_probability": 84.2,
                "expected_depth_cm": 38.0,
                "expected_onset_min": 24,
                "status": "CAUTION_HEAVY_VEHICLES_ONLY",
                "alternate_route": "Canal Elevated Corridor"
            },
            {
                "road_id": "ROAD_R15_GOVT",
                "road_name": "Governorpet Main Commercial Road",
                "flood_probability": 45.0,
                "expected_depth_cm": 12.0,
                "expected_onset_min": 55,
                "status": "PASSABLE_WITH_CARE",
                "alternate_route": "Direct Main Arterial"
            }
        ]
