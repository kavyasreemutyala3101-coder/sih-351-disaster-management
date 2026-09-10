import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
import xgboost as xgb

def generate_synthetic_hydrology_data(n_samples=5000, random_seed=42):
    np.random.seed(random_seed)
    
    # Feature generation based on CPHEEO & SWMM coupling variables
    rainfall_intensity = np.random.exponential(scale=25.0, size=n_samples) # mm/hr
    rainfall_intensity = np.clip(rainfall_intensity, 0.0, 150.0)
    
    rainfall_15min = rainfall_intensity * np.random.uniform(0.2, 0.3, size=n_samples)
    rainfall_30min = rainfall_intensity * np.random.uniform(0.45, 0.6, size=n_samples)
    rainfall_1hr = rainfall_intensity * np.random.uniform(0.85, 1.1, size=n_samples)
    rainfall_3hr = rainfall_1hr * np.random.uniform(1.8, 2.5, size=n_samples)
    rainfall_accumulation = rainfall_3hr * np.random.uniform(1.2, 1.8, size=n_samples)
    
    # Drainage characteristics
    drainage_capacity = np.random.uniform(15.0, 80.0, size=n_samples) # mm/hr equiv capacity
    blockage_percentage = np.random.uniform(0.0, 85.0, size=n_samples) # %
    effective_capacity = drainage_capacity * (1.0 - (blockage_percentage / 100.0) * 0.85)
    
    # Terrain & Land cover
    elevation = np.random.uniform(1.5, 45.0, size=n_samples) # meters above sea level
    slope = np.random.uniform(0.1, 8.0, size=n_samples) # %
    impervious_surface_ratio = np.random.uniform(0.35, 0.95, size=n_samples) # 0 to 1
    soil_moisture_indicator = np.random.uniform(0.1, 0.95, size=n_samples) # saturation degree
    historical_flood_frequency = np.random.poisson(lam=1.5, size=n_samples) # count per year
    
    # Hydrological calculations (Rational Method Q = C * I * A)
    runoff_coefficient = 0.2 + (0.7 * impervious_surface_ratio) + (0.1 * soil_moisture_indicator)
    runoff_inflow = runoff_coefficient * rainfall_1hr
    
    # Utilization & Ponding depth
    drainage_utilization = (runoff_inflow / np.maximum(effective_capacity, 1.0)) * 100.0
    
    # Water depth physics simulation (meters)
    overflow = np.maximum(0.0, runoff_inflow - effective_capacity)
    low_lying_factor = np.maximum(0.1, (25.0 - elevation) / 25.0)
    flat_slope_factor = np.maximum(0.2, (5.0 - slope) / 5.0)
    
    water_depth = (overflow * 0.015 * low_lying_factor * flat_slope_factor) + (drainage_utilization > 100) * (drainage_utilization - 100) * 0.005
    water_depth = np.clip(water_depth + np.random.normal(0, 0.02, size=n_samples), 0.0, 2.5) # max 2.5 meters
    
    # Flood Probability (0-100%)
    logits = (
        0.04 * rainfall_1hr +
        0.03 * drainage_utilization +
        0.02 * blockage_percentage -
        0.08 * elevation -
        0.15 * slope +
        1.5 * impervious_surface_ratio +
        0.5 * historical_flood_frequency -
        1.0
    )
    flood_prob = 1.0 / (1.0 + np.exp(-logits))
    flood_prob_pct = np.clip(flood_prob * 100.0, 0.0, 100.0)
    
    # Severity classification
    # 0: LOW (<30%), 1: MODERATE (30-60%), 2: HIGH (60-85%), 3: CRITICAL (>85%)
    severity_labels = []
    for p, d in zip(flood_prob_pct, water_depth):
        if p < 30.0 and d < 0.1:
            severity_labels.append(0)
        elif p < 60.0 and d < 0.3:
            severity_labels.append(1)
        elif p < 85.0 and d < 0.6:
            severity_labels.append(2)
        else:
            severity_labels.append(3)
            
    df = pd.DataFrame({
        'rainfall_intensity': rainfall_intensity,
        'rainfall_15min': rainfall_15min,
        'rainfall_30min': rainfall_30min,
        'rainfall_1hr': rainfall_1hr,
        'rainfall_3hr': rainfall_3hr,
        'rainfall_accumulation': rainfall_accumulation,
        'drainage_capacity': drainage_capacity,
        'blockage_percentage': blockage_percentage,
        'effective_capacity': effective_capacity,
        'elevation': elevation,
        'slope': slope,
        'impervious_surface_ratio': impervious_surface_ratio,
        'soil_moisture_indicator': soil_moisture_indicator,
        'historical_flood_frequency': historical_flood_frequency,
        'drainage_utilization': drainage_utilization,
        'target_flood_prob': flood_prob_pct,
        'target_water_depth': water_depth,
        'target_severity': severity_labels
    })
    
    return df

def train_and_save_models():
    print("Generating synthetic hydrological dataset...")
    df = generate_synthetic_hydrology_data()
    
    feature_cols = [
        'rainfall_intensity', 'rainfall_15min', 'rainfall_30min', 'rainfall_1hr',
        'rainfall_3hr', 'rainfall_accumulation', 'drainage_capacity', 'blockage_percentage',
        'effective_capacity', 'elevation', 'slope', 'impervious_surface_ratio',
        'soil_moisture_indicator', 'historical_flood_frequency', 'drainage_utilization'
    ]
    
    X = df[feature_cols]
    y_prob = df['target_flood_prob']
    y_depth = df['target_water_depth']
    y_sev = df['target_severity']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print("Training XGBoost Regressor (Probability & Depth)...")
    xgb_prob = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42)
    xgb_prob.fit(X_scaled, y_prob)
    
    xgb_depth = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42)
    xgb_depth.fit(X_scaled, y_depth)
    
    print("Training Random Forest Models...")
    rf_prob = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    rf_prob.fit(X_scaled, y_prob)
    
    rf_depth = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    rf_depth.fit(X_scaled, y_depth)
    
    output_dir = os.path.join(os.path.dirname(__file__), "..", "backend", "models")
    os.makedirs(output_dir, exist_ok=True)
    
    joblib.dump(scaler, os.path.join(output_dir, "scaler.joblib"))
    joblib.dump(xgb_prob, os.path.join(output_dir, "xgb_prob.joblib"))
    joblib.dump(xgb_depth, os.path.join(output_dir, "xgb_depth.joblib"))
    joblib.dump(rf_prob, os.path.join(output_dir, "rf_prob.joblib"))
    joblib.dump(rf_depth, os.path.join(output_dir, "rf_depth.joblib"))
    
    print(f"Models successfully trained & saved to: {os.path.abspath(output_dir)}")
    
    # Save dataset stats for model feedback evaluation
    metrics = {
        'xgb_r2_prob': float(r2_score(y_prob, xgb_prob.predict(X_scaled))),
        'xgb_rmse_depth': float(np.sqrt(mean_squared_error(y_depth, xgb_depth.predict(X_scaled)))),
        'rf_r2_prob': float(r2_score(y_prob, rf_prob.predict(X_scaled))),
        'rf_rmse_depth': float(np.sqrt(mean_squared_error(y_depth, rf_depth.predict(X_scaled)))),
        'sample_count': len(df)
    }
    joblib.dump(metrics, os.path.join(output_dir, "metrics.joblib"))
    print("Training Evaluation Metrics:", metrics)

if __name__ == "__main__":
    train_and_save_models()
