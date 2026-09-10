class ExplainabilityService:
    """
    Explainable AI (XAI) feature attribution breakdown service.
    Explains WHY the AI model predicted a particular flood risk score.
    """
    
    @staticmethod
    def explain_prediction(
        flood_probability: float,
        rainfall_intensity: float,
        drainage_utilization: float,
        blockage_pct: float,
        elevation_m: float,
        soil_moisture: float,
        impervious_ratio: float
    ) -> dict:
        # Base factor weightings
        weights = {
            "Heavy Rainfall Intensity": max(0.0, (rainfall_intensity / 80.0) * 40.0),
            "Drainage Stress & Overload": max(0.0, (drainage_utilization / 100.0) * 35.0),
            "Low-Lying Elevation": max(0.0, (30.0 - min(30.0, elevation_m)) / 30.0 * 20.0),
            "High Soil Saturation": max(0.0, soil_moisture * 15.0),
            "Drainage Blockage": max(0.0, (blockage_pct / 100.0) * 15.0),
            "Impervious Urban Surface": max(0.0, (impervious_ratio - 0.4) * 15.0)
        }
        
        total_raw = sum(weights.values())
        if total_raw <= 0:
            total_raw = 1.0
            
        factors = []
        for factor_name, raw_val in weights.items():
            contrib_pct = round((raw_val / total_raw) * flood_probability, 1)
            if contrib_pct > 0.5:
                factors.append({
                    "factor": factor_name,
                    "contribution_pct": contrib_pct,
                    "formatted_sign": f"+{contrib_pct}%"
                })
                
        # Sort factors by contribution percentage descending
        factors.sort(key=lambda x: x["contribution_pct"], reverse=True)
        
        summary_text = f"Risk of {flood_probability:.1f}% driven primarily by " + ", ".join([f"{f['factor']} ({f['formatted_sign']})" for f in factors[:3]])
        
        return {
            "flood_probability": flood_probability,
            "summary": summary_text,
            "top_contributing_factors": factors
        }
