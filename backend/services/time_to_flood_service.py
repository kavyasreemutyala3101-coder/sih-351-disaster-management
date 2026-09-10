class TimeToFloodService:
    """
    Calculates time-to-flood onset in minutes based on drainage water level,
    filling rate, and rainfall intensity.
    
    Formula:
    remaining_capacity = critical_threshold (1.0) - current_water_level
    filling_rate = (inflow_lps - effective_capacity_lps) / channel_volume
    time_to_threshold = remaining_capacity / filling_rate
    """
    
    @staticmethod
    def estimate_time_to_flood(
        current_water_level_pct: float,
        drainage_utilization_pct: float,
        rainfall_intensity_mm_hr: float,
        blockage_pct: float,
        elevation_m: float
    ) -> dict:
        current_level_norm = current_water_level_pct / 100.0
        critical_level_norm = 0.90 # Flooding onset starts when drain is at 90%+
        
        remaining_capacity = max(0.01, critical_level_norm - current_level_norm)
        
        # Calculate filling rate per minute (% / min)
        # Base filling rate driven by rainfall intensity and utilization
        if drainage_utilization_pct > 70.0:
            excess_factor = (drainage_utilization_pct - 70.0) / 30.0
            filling_rate_per_min = (0.015 * excess_factor) + (0.0005 * rainfall_intensity_mm_hr) + (0.0002 * blockage_pct)
        else:
            # Draining or stable
            filling_rate_per_min = -0.005 # water level decreasing
            
        if current_water_level_pct >= 90.0:
            time_to_flood_min = 0 # Currently flooding or imminent
            status = "FLOODING_IMMINENT_OR_ACTIVE"
        elif filling_rate_per_min <= 0:
            time_to_flood_min = 999 # Safe / No flooding expected in foreseeable horizon
            status = "STABLE_DRAINING"
        else:
            time_to_flood_min = int(round(remaining_capacity / filling_rate_per_min))
            time_to_flood_min = max(5, min(180, time_to_flood_min))
            status = "ESTIMATED_ONSET"

        # Elevation buffer modifier (low-lying areas fill faster)
        if time_to_flood_min not in [0, 999] and elevation_m < 15.0:
            elevation_discount = max(0.65, elevation_m / 20.0)
            time_to_flood_min = int(round(time_to_flood_min * elevation_discount))

        formatted_msg = (
            "Flooding currently active/imminent." if time_to_flood_min == 0
            else "No immediate flooding expected under current drainage conditions." if time_to_flood_min == 999
            else f"Flooding expected in approximately {time_to_flood_min} minutes."
        )

        return {
            "time_to_flood_min": time_to_flood_min,
            "status": status,
            "formatted_text": formatted_msg,
            "current_water_level_pct": current_water_level_pct,
            "filling_rate_pct_per_min": round(float(filling_rate_per_min * 100.0), 3),
            "disclaimer": "Calculated estimate based on hydraulic fill rate and rainfall accumulation velocity."
        }
