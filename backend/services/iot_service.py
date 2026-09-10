from datetime import datetime
from backend.database import get_db_connection

class IoTService:
    @staticmethod
    def get_all_sensors():
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sensors")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def ingest_water_level(sensor_id: str, drain_id: str, water_level_pct: float):
        conn = get_db_connection()
        cursor = conn.cursor()
        now_ts = datetime.now().isoformat()
        
        status = "WARNING" if water_level_pct > 80.0 else "ONLINE"
        
        cursor.execute('''
        INSERT OR REPLACE INTO sensors (sensor_id, sensor_type, drain_id, name, current_value, unit, status, last_updated)
        VALUES (?, 'WATER_LEVEL', ?, ?, ?, '%', ?, ?)
        ''', (sensor_id, drain_id, f"Drain Sensor {sensor_id}", water_level_pct, status, now_ts))
        
        # Update drain current water level
        cursor.execute('''
        UPDATE drains SET water_level_pct = ? WHERE drain_id = ?
        ''', (water_level_pct, drain_id))
        
        conn.commit()
        conn.close()
        return {"status": "SUCCESS", "sensor_id": sensor_id, "water_level_pct": water_level_pct, "data_type": "PHYSICAL_IOT_PAYLOAD"}

    @staticmethod
    def ingest_rainfall(sensor_id: str, intensity_mm_hr: float):
        conn = get_db_connection()
        cursor = conn.cursor()
        now_ts = datetime.now().isoformat()
        
        cursor.execute('''
        INSERT OR REPLACE INTO sensors (sensor_id, sensor_type, drain_id, name, current_value, unit, status, last_updated)
        VALUES (?, 'RAIN_GAUGE', NULL, ?, ?, 'mm/hr', 'ONLINE', ?)
        ''', (sensor_id, f"Rain Gauge {sensor_id}", intensity_mm_hr, now_ts))
        
        conn.commit()
        conn.close()
        return {"status": "SUCCESS", "sensor_id": sensor_id, "intensity_mm_hr": intensity_mm_hr, "data_type": "PHYSICAL_IOT_PAYLOAD"}
