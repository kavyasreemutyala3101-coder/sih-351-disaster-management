import numpy as np

class HydrologyService:
    """
    Rational Method & SWMM-inspired surface runoff & drainage coupling service.
    Q = C * I * A
    utilization = Q_inflow / Q_capacity
    """
    
    @staticmethod
    def calculate_runoff_and_utilization(
        rainfall_intensity_mm_hr: float,
        rainfall_1hr_mm: float,
        drainage_capacity_lps: float,
        blockage_pct: float,
        elevation_m: float,
        slope_pct: float,
        impervious_ratio: float = 0.75,
        soil_moisture_indicator: float = 0.50
    ) -> dict:
        # Runoff coefficient (C)
        runoff_coeff = 0.25 + (0.65 * impervious_ratio) + (0.10 * soil_moisture_indicator)
        runoff_coeff = min(0.98, max(0.15, runoff_coeff))
        
        # Effective Drainage Capacity after blockage reduction
        effective_capacity_lps = drainage_capacity_lps * max(0.05, 1.0 - (blockage_pct / 100.0) * 0.90)
        
        # Inflow conversion (simplified catchment area A = 5 hectares)
        catchment_area_ha = 5.0
        # Q (liters per second) = C * (I mm/hr) * (A m2) / 3600
        inflow_lps = runoff_coeff * rainfall_intensity_mm_hr * (catchment_area_ha * 10000.0) / 3600.0
        
        # Utilization percentage
        utilization_pct = (inflow_lps / max(effective_capacity_lps, 1.0)) * 100.0
        
        # Overflow & Ponding accumulation (meters)
        if utilization_pct > 100.0:
            excess_lps = inflow_lps - effective_capacity_lps
            # accumulation factor over catchment
            low_lying_mult = max(0.1, (30.0 - elevation_m) / 20.0)
            flat_slope_mult = max(0.2, (4.0 - slope_pct) / 4.0)
            water_depth_m = (excess_lps * 0.0003 * low_lying_mult * flat_slope_mult) + ((utilization_pct - 100.0) * 0.002)
            water_depth_m = float(np.clip(water_depth_m, 0.0, 3.0))
        else:
            water_depth_m = 0.0
            
        return {
            "runoff_coeff": round(float(runoff_coeff), 3),
            "inflow_lps": round(float(inflow_lps), 1),
            "effective_capacity_lps": round(float(effective_capacity_lps), 1),
            "utilization_pct": round(float(utilization_pct), 1),
            "water_depth_m": round(float(water_depth_m), 3),
            "hydrology_engine": "SWMM_Rational_Coupling_V1"
        }
