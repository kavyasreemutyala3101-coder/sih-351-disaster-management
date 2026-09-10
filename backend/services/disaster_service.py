from backend.database import get_db_connection

class DisasterService:
    @staticmethod
    def get_all_disasters():
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM disaster_events ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        conn.close()
        
        disasters = []
        for r in rows:
            disasters.append({
                "event_id": r["event_id"],
                "hazard_type": r["hazard_type"],
                "title": r["title"],
                "lat": r["lat"],
                "lng": r["lng"],
                "severity": r["severity"],
                "magnitude": r["magnitude"],
                "depth_km": r["depth_km"],
                "status": r["status"],
                "timestamp": r["timestamp"],
                "description": r["description"]
            })
        return disasters

    @staticmethod
    def get_glacier_timeline():
        """
        Glacier retreat observation timeline 2018 - 2026
        """
        return [
            {"year": 2018, "ice_extent_km2": 450.2, "snow_line_m": 4820, "retreat_rate_m_yr": 12.4, "status": "OBSERVED"},
            {"year": 2020, "ice_extent_km2": 441.8, "snow_line_m": 4855, "retreat_rate_m_yr": 14.1, "status": "OBSERVED"},
            {"year": 2022, "ice_extent_km2": 432.5, "snow_line_m": 4890, "retreat_rate_m_yr": 15.8, "status": "OBSERVED"},
            {"year": 2024, "ice_extent_km2": 421.0, "snow_line_m": 4930, "retreat_rate_m_yr": 17.5, "status": "OBSERVED"},
            {"year": 2026, "ice_extent_km2": 408.4, "snow_line_m": 4975, "retreat_rate_m_yr": 19.2, "status": "MONITORED_NOWCAST"}
        ]
