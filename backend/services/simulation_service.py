from backend.services.hydrology_service import HydrologyService
from backend.services.ml_service import ml_service_instance
from backend.services.time_to_flood_service import TimeToFloodService
from backend.services.explainability_service import ExplainabilityService

class SimulationService:
    """
    Handles What-If simulation recalculations & 1-Click Flood Demo Scenario steps.
    """
    
    @staticmethod
    def run_what_if_simulation(
        rainfall_intensity: float,
        rainfall_duration_hrs: float,
        blockage_pct: float,
        drainage_capacity_lps: float,
        elevation_m: float = 14.0,
        slope_pct: float = 1.0,
        model_name: str = "XGBoost"
    ) -> dict:
        rainfall_1hr = rainfall_intensity
        rainfall_3hr = rainfall_intensity * min(2.5, rainfall_duration_hrs)
        rainfall_accum = rainfall_intensity * rainfall_duration_hrs
        
        hydrology = HydrologyService.calculate_runoff_and_utilization(
            rainfall_intensity_mm_hr=rainfall_intensity,
            rainfall_1hr_mm=rainfall_1hr,
            drainage_capacity_lps=drainage_capacity_lps,
            blockage_pct=blockage_pct,
            elevation_m=elevation_m,
            slope_pct=slope_pct
        )
        
        effective_cap = hydrology["effective_capacity_lps"]
        utilization = hydrology["utilization_pct"]
        
        features = {
            'rainfall_intensity': rainfall_intensity,
            'rainfall_15min': rainfall_intensity * 0.25,
            'rainfall_30min': rainfall_intensity * 0.5,
            'rainfall_1hr': rainfall_1hr,
            'rainfall_3hr': rainfall_3hr,
            'rainfall_accumulation': rainfall_accum,
            'drainage_capacity': drainage_capacity_lps,
            'blockage_percentage': blockage_pct,
            'effective_capacity': effective_cap,
            'elevation': elevation_m,
            'slope': slope_pct,
            'impervious_surface_ratio': 0.82,
            'soil_moisture_indicator': min(0.95, 0.4 + (rainfall_accum / 100.0)),
            'historical_flood_frequency': 2,
            'drainage_utilization': utilization
        }
        
        pred = ml_service_instance.predict(features, model_type=model_name)
        time_est = TimeToFloodService.estimate_time_to_flood(
            current_water_level_pct=min(98.0, utilization * 0.9),
            drainage_utilization_pct=utilization,
            rainfall_intensity_mm_hr=rainfall_intensity,
            blockage_pct=blockage_pct,
            elevation_m=elevation_m
        )
        
        xai = ExplainabilityService.explain_prediction(
            flood_probability=pred["flood_probability"],
            rainfall_intensity=rainfall_intensity,
            drainage_utilization=utilization,
            blockage_pct=blockage_pct,
            elevation_m=elevation_m,
            soil_moisture=features['soil_moisture_indicator'],
            impervious_ratio=0.82
        )
        
        # Calculate affected area expansion estimate
        affected_area_km2 = round(max(0.1, (pred["flood_probability"] / 100.0) * 4.2), 2)
        
        return {
            "scenario": {
                "rainfall_intensity_mm_hr": rainfall_intensity,
                "duration_hrs": rainfall_duration_hrs,
                "blockage_pct": blockage_pct,
                "drainage_capacity_lps": drainage_capacity_lps,
                "elevation_m": elevation_m
            },
            "hydrology": hydrology,
            "prediction": pred,
            "time_to_flood": time_est,
            "explanation": xai,
            "affected_area_km2": affected_area_km2,
            "data_source": "SIMULATED_WHAT_IF_ENGINE"
        }

    @staticmethod
    def get_demo_scenario_steps() -> list:
        """
        Returns the timeline steps for the 1-Click 'START FLOOD SCENARIO' Judge Presentation.
        Step 1: Normal rain (30 mm/hr, 52% util, LOW risk)
        Step 2: Moderate rain (45 mm/hr, 68% util, MODERATE risk)
        Step 3: Heavy rain (60 mm/hr, 81% util, HIGH risk)
        Step 4: Extreme rain (75 mm/hr, 94% util, CRITICAL risk + Alert)
        """
        return [
            {
                "step": 1,
                "time_label": "T-45 min",
                "rain_mm_hr": 30.0,
                "drain_util_pct": 52.0,
                "water_level_pct": 45.0,
                "flood_prob_pct": 18.5,
                "water_depth_m": 0.0,
                "time_to_flood_min": 999,
                "severity": "LOW",
                "badge": "NORMAL_CONDITIONS",
                "alert_level": "LEVEL 1: MONITOR"
            },
            {
                "step": 2,
                "time_label": "T-30 min",
                "rain_mm_hr": 45.0,
                "drain_util_pct": 68.0,
                "water_level_pct": 62.0,
                "flood_prob_pct": 48.0,
                "water_depth_m": 0.08,
                "time_to_flood_min": 55,
                "severity": "MODERATE",
                "badge": "RAINFALL_BUILDUP",
                "alert_level": "LEVEL 2: WATCH"
            },
            {
                "step": 3,
                "time_label": "T-15 min",
                "rain_mm_hr": 60.0,
                "drain_util_pct": 81.0,
                "water_level_pct": 82.0,
                "flood_prob_pct": 76.4,
                "water_depth_m": 0.28,
                "time_to_flood_min": 32,
                "severity": "HIGH",
                "badge": "DRAIN_STRESS_WARNING",
                "alert_level": "LEVEL 3: WARNING"
            },
            {
                "step": 4,
                "time_label": "NOW (T+0)",
                "rain_mm_hr": 75.0,
                "drain_util_pct": 94.2,
                "water_level_pct": 94.0,
                "flood_prob_pct": 91.8,
                "water_depth_m": 0.48,
                "time_to_flood_min": 18,
                "severity": "CRITICAL",
                "badge": "FLOOD_ONSET_IMMINENT",
                "alert_level": "LEVEL 4: CRITICAL"
            }
        ]
