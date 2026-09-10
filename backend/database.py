import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "nexus_flood.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Locations / Wards
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        city TEXT NOT NULL,
        ward_name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        elevation_m REAL DEFAULT 15.0,
        slope_pct REAL DEFAULT 1.2
    )
    ''')

    # Drainage Nodes & Networks
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS drains (
        drain_id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        capacity_lps REAL NOT NULL,
        current_flow_lps REAL NOT NULL,
        water_level_pct REAL NOT NULL,
        blockage_pct REAL NOT NULL,
        status TEXT NOT NULL, -- NORMAL, MODERATE, HIGH, OVERLOADED, CRITICAL
        upstream_area_ha REAL DEFAULT 5.0,
        downstream_id TEXT
    )
    ''')

    # IoT Sensors
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sensors (
        sensor_id TEXT PRIMARY KEY,
        sensor_type TEXT NOT NULL, -- RAIN_GAUGE, WATER_LEVEL, DRAIN_FLOW
        drain_id TEXT,
        name TEXT NOT NULL,
        current_value REAL NOT NULL,
        unit TEXT NOT NULL,
        status TEXT NOT NULL, -- ONLINE, WARNING, OFFLINE
        last_updated TEXT NOT NULL
    )
    ''')

    # Rainfall Telemetry
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS rainfall (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        intensity_mm_hr REAL NOT NULL,
        accum_15m REAL NOT NULL,
        accum_1h REAL NOT NULL,
        accum_3h REAL NOT NULL,
        source_type TEXT DEFAULT 'SIMULATED' -- REAL_GPM, REAL_IMD, SIMULATED
    )
    ''')

    # Multi-Hazard Disaster Data
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS disaster_events (
        event_id TEXT PRIMARY KEY,
        hazard_type TEXT NOT NULL, -- FLOOD, LANDSLIDE, EARTHQUAKE, CYCLONE, WILDFIRE, GLACIER
        title TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        severity TEXT NOT NULL, -- LOW, MODERATE, HIGH, CRITICAL
        magnitude REAL,
        depth_km REAL,
        status TEXT NOT NULL, -- OBSERVED, MONITORED, PREDICTED, SIMULATED
        timestamp TEXT NOT NULL,
        description TEXT
    )
    ''')

    # Grid Cell Spatial Features
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS terrain_cells (
        cell_id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        elevation_m REAL NOT NULL,
        slope_pct REAL NOT NULL,
        land_cover TEXT NOT NULL,
        impervious_ratio REAL NOT NULL,
        flood_risk_score REAL DEFAULT 0.0
    )
    ''')

    # Predictions
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        model_name TEXT NOT NULL,
        flood_probability REAL NOT NULL,
        severity TEXT NOT NULL,
        estimated_depth_m REAL NOT NULL,
        time_to_flood_min INTEGER NOT NULL,
        confidence_pct REAL NOT NULL,
        features_json TEXT
    )
    ''')

    # Priority Alerts
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alerts (
        alert_id TEXT PRIMARY KEY,
        alert_level TEXT NOT NULL, -- LEVEL 1: MONITOR, LEVEL 2: WATCH, LEVEL 3: WARNING, LEVEL 4: CRITICAL
        zone TEXT NOT NULL,
        hazard TEXT NOT NULL,
        flood_probability REAL NOT NULL,
        expected_onset_min INTEGER NOT NULL,
        severity TEXT NOT NULL,
        reason TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    ''')

    # Crowdsourced Citizen Reports
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS citizen_reports (
        report_id TEXT PRIMARY KEY,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        location_name TEXT NOT NULL,
        water_depth_cm REAL NOT NULL,
        photo_url TEXT,
        description TEXT,
        status TEXT DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
        timestamp TEXT NOT NULL
    )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

def seed_initial_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if seeded
    cursor.execute("SELECT COUNT(*) FROM locations")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    print("Seeding initial dataset for Vijayawada pilot ward & regional hazards...")

    # Seed Locations
    locations = [
        ('loc_vja_w12', 'Vijayawada', 'Ward 12 - Benz Circle', 16.5062, 80.6480, 14.2, 0.8),
        ('loc_vja_w15', 'Vijayawada', 'Ward 15 - Governorpet', 16.5125, 80.6285, 12.5, 0.5),
        ('loc_vja_w08', 'Vijayawada', 'Ward 8 - One Town Market', 16.5180, 80.6120, 11.0, 0.4),
        ('loc_vja_w22', 'Vijayawada', 'Ward 22 - Eluru Road Canal Front', 16.5210, 80.6410, 13.0, 0.6),
        ('loc_vja_w04', 'Vijayawada', 'Ward 4 - Prakasam Barrage Slope', 16.5080, 80.6050, 28.0, 4.5)
    ]
    cursor.executemany("INSERT INTO locations VALUES (?,?,?,?,?,?,?)", locations)

    # Seed Drainage Nodes
    drains = [
        ('D101', 'loc_vja_w12', 'Benz Circle Main Trunk Drain', 16.5065, 80.6475, 1200.0, 720.0, 60.0, 15.0, 'MODERATE', 12.5, 'D102'),
        ('D102', 'loc_vja_w12', 'NTR Circle Collector Drain', 16.5078, 80.6492, 950.0, 890.0, 93.6, 40.0, 'OVERLOADED', 8.2, 'D105'),
        ('D103', 'loc_vja_w15', 'Governorpet Main Sluice', 16.5130, 80.6290, 1100.0, 450.0, 40.9, 10.0, 'NORMAL', 15.0, 'D105'),
        ('D104', 'loc_vja_w08', 'One Town Low-Lying Outfall', 16.5175, 80.6115, 800.0, 760.0, 95.0, 65.0, 'CRITICAL', 18.0, 'OUT_RIVER'),
        ('D105', 'loc_vja_w22', 'Eluru Canal Main Outfall', 16.5215, 80.6420, 2000.0, 1400.0, 70.0, 20.0, 'HIGH', 35.0, 'OUT_RIVER')
    ]
    cursor.executemany("INSERT INTO drains VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", drains)

    # Seed IoT Sensors
    sensors = [
        ('SENS_D101_W', 'WATER_LEVEL', 'D101', 'Benz Circle Water Level', 60.0, '%', 'ONLINE', datetime.now().isoformat()),
        ('SENS_D102_W', 'WATER_LEVEL', 'D102', 'NTR Circle Water Level', 93.6, '%', 'WARNING', datetime.now().isoformat()),
        ('SENS_D104_W', 'WATER_LEVEL', 'D104', 'One Town Outfall Level', 95.0, '%', 'WARNING', datetime.now().isoformat()),
        ('SENS_R001_R', 'RAIN_GAUGE', None, 'Vijayawada Central Rain Gauge', 45.0, 'mm/hr', 'ONLINE', datetime.now().isoformat()),
        ('SENS_D101_F', 'DRAIN_FLOW', 'D101', 'Benz Circle Flow Meter', 720.0, 'L/s', 'ONLINE', datetime.now().isoformat())
    ]
    cursor.executemany("INSERT INTO sensors VALUES (?,?,?,?,?,?,?,?)", sensors)

    # Seed Disaster Events (Multi-hazard)
    disasters = [
        ('DIS_FL_01', 'FLOOD', 'Vijayawada Urban Flood Warning - Ward 8 & 12', 16.5120, 80.6350, 'HIGH', 0.0, 0.0, 'PREDICTED', datetime.now().isoformat(), 'AI coupling engine nowcast warning.'),
        ('DIS_LS_01', 'LANDSLIDE', 'Indrakeeladri Hill Slope Debris Slip Risk', 16.5150, 80.6080, 'MODERATE', 0.0, 0.0, 'MONITORED', datetime.now().isoformat(), 'Heavy rain on 18% slope terrain.'),
        ('DIS_EQ_01', 'EARTHQUAKE', 'Seismic Activity Monitor - Bay of Bengal Region', 15.8000, 82.1000, 'MODERATE', 4.8, 12.0, 'OBSERVED', datetime.now().isoformat(), 'Seismic event recorded 140km offshore.'),
        ('DIS_CY_01', 'CYCLONE', 'Severe Cyclonic Storm Deep Depression', 14.5000, 83.2000, 'HIGH', 0.0, 0.0, 'OBSERVED', datetime.now().isoformat(), 'Moving Northwest towards Andhra Coast.'),
        ('DIS_GL_01', 'GLACIER', 'Himalayan Glaciation Index Tracker (Gangotri Retreat)', 30.9200, 78.9300, 'LOW', 0.0, 0.0, 'OBSERVED', '2026-08-15T00:00:00', 'Glacial retreat monitor timeline 2018-2026.')
    ]
    cursor.executemany("INSERT INTO disaster_events VALUES (?,?,?,?,?,?,?,?,?,?,?)", disasters)

    # Seed Terrain Grid Cells
    terrain_cells = []
    base_lat, base_lng = 16.5000, 80.6100
    for r in range(6):
        for c in range(6):
            cell_id = f"CELL_{r}_{c}"
            clat = base_lat + r * 0.005
            clng = base_lng + c * 0.005
            elev = 10.0 + (r * 2.5) + (c * 1.2) - (r*c*0.5)
            elev = max(8.0, min(45.0, elev))
            slope = max(0.2, min(6.0, 3.5 - (r*0.4)))
            imp = 0.85 if elev < 15.0 else 0.55
            terrain_cells.append((cell_id, 'loc_vja_w12', clat, clng, round(elev, 2), round(slope, 2), 'URBAN_PAVED', imp, 0.0))

    cursor.executemany("INSERT INTO terrain_cells VALUES (?,?,?,?,?,?,?,?,?)", terrain_cells)

    # Seed Priority Alerts
    now_ts = datetime.now().isoformat()
    alerts = [
        ('ALT_001', 'LEVEL 4: CRITICAL', 'Ward 8 - One Town Market', 'FLOOD', 91.5, 24, 'CRITICAL', 'Heavy rainfall + 65% drain blockage + low elevation (11m).', 'Avoid low-lying roads & deploy mobile pump stations immediately.', now_ts),
        ('ALT_002', 'LEVEL 3: WARNING', 'Ward 12 - Benz Circle', 'FLOOD', 78.2, 35, 'HIGH', 'Rapid rainfall accumulation & 93% drain utilization at NTR Circle.', 'Divert traffic from Benz Circle underpass.', now_ts),
        ('ALT_003', 'LEVEL 2: WATCH', 'Indrakeeladri Slope', 'LANDSLIDE', 54.0, 60, 'MODERATE', 'Saturated hill slope soil due to 45mm/hr rainfall.', 'Monitor slope sensors and alert hill road traffic.', now_ts)
    ]
    cursor.executemany("INSERT INTO alerts VALUES (?,?,?,?,?,?,?,?,?,?)", alerts)

    conn.commit()
    conn.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    init_db()
    seed_initial_data()
