"""
Use trained ML models directly without Flask API
Load models and make predictions standalone
"""
import joblib
import numpy as np
import pandas as pd
import os

# Load all models
MODEL_DIR = 'models'

print("="*60)
print("Loading ML Models...")
print("="*60)

# Yield Prediction Models
yield_model = joblib.load(os.path.join(MODEL_DIR, 'yield_prediction_model.pkl'))
yield_scaler = joblib.load(os.path.join(MODEL_DIR, 'yield_scaler.pkl'))
yield_label_encoders = joblib.load(os.path.join(MODEL_DIR, 'yield_label_encoders.pkl'))
yield_features = joblib.load(os.path.join(MODEL_DIR, 'yield_feature_names.pkl'))

# Crop Recommendation Models
crop_model = joblib.load(os.path.join(MODEL_DIR, 'crop_recommendation_model.pkl'))
crop_scaler = joblib.load(os.path.join(MODEL_DIR, 'crop_recommendation_scaler.pkl'))
crop_features = joblib.load(os.path.join(MODEL_DIR, 'crop_recommendation_features.pkl'))
crop_labels = joblib.load(os.path.join(MODEL_DIR, 'crop_labels.pkl'))

print("✓ All models loaded successfully!\n")


def predict_yield(area, crop, year, rainfall, pesticides, temperature):
    """
    Predict crop yield
    
    Args:
        area: Country/Region (e.g., "India", "USA")
        crop: Crop name (e.g., "Rice", "Wheat")
        year: Year (e.g., 2024)
        rainfall: Average rainfall in mm per year
        pesticides: Pesticides in tonnes
        temperature: Average temperature in Celsius
    
    Returns:
        Predicted yield in hg/ha
    """
    print("="*60)
    print("YIELD PREDICTION")
    print("="*60)
    
    # Create input data
    data = {
        'Area': area,
        'Item': crop,
        'Year': year,
        'average_rain_fall_mm_per_year': rainfall,
        'pesticides_tonnes': pesticides,
        'avg_temp': temperature
    }
    
    print(f"Input Parameters:")
    for key, value in data.items():
        print(f"  {key}: {value}")
    
    # Create DataFrame
    input_df = pd.DataFrame([data])[yield_features]
    
    # Encode categorical variables
    for column, encoder in yield_label_encoders.items():
        if column in input_df.columns:
            try:
                input_df[column] = encoder.transform(input_df[column])
            except ValueError:
                input_df[column] = 0
    
    # Scale features
    input_scaled = yield_scaler.transform(input_df)
    
    # Make prediction
    prediction = yield_model.predict(input_scaled)[0]
    
    print(f"\n✓ Predicted Yield: {prediction:.2f} hg/ha")
    print(f"  (approximately {prediction/10000:.2f} tonnes/hectare)")
    
    if prediction > 50000:
        print("  Interpretation: Excellent yield expected")
    elif prediction > 30000:
        print("  Interpretation: Good yield expected")
    elif prediction > 15000:
        print("  Interpretation: Average yield expected")
    else:
        print("  Interpretation: Below average yield expected")
    
    print("="*60 + "\n")
    return prediction


def recommend_crop(N, P, K, temperature, humidity, ph, rainfall):
    """
    Recommend best crop based on soil and climate conditions
    
    Args:
        N: Nitrogen content ratio
        P: Phosphorus content ratio
        K: Potassium content ratio
        temperature: Temperature in Celsius
        humidity: Relative humidity in %
        ph: pH value of soil
        rainfall: Rainfall in mm
    
    Returns:
        Recommended crop name and top 3 recommendations
    """
    print("="*60)
    print("CROP RECOMMENDATION")
    print("="*60)
    
    # Create input data
    data = {
        'N': N,
        'P': P,
        'K': K,
        'temperature': temperature,
        'humidity': humidity,
        'ph': ph,
        'rainfall': rainfall
    }
    
    print(f"Soil & Climate Parameters:")
    print(f"  Nitrogen (N): {N}")
    print(f"  Phosphorus (P): {P}")
    print(f"  Potassium (K): {K}")
    print(f"  Temperature: {temperature}°C")
    print(f"  Humidity: {humidity}%")
    print(f"  pH: {ph}")
    print(f"  Rainfall: {rainfall}mm")
    
    # Create DataFrame
    input_df = pd.DataFrame([data])[crop_features]
    
    # Scale features
    input_scaled = crop_scaler.transform(input_df)
    
    # Make prediction
    prediction = crop_model.predict(input_scaled)[0]
    
    # Get probabilities
    if hasattr(crop_model, 'predict_proba'):
        probabilities = crop_model.predict_proba(input_scaled)[0]
        
        # Get top 3 recommendations
        top_indices = np.argsort(probabilities)[-3:][::-1]
        
        print(f"\n✓ Recommended Crop: {prediction}")
        print(f"\nTop 3 Recommendations:")
        for i, idx in enumerate(top_indices, 1):
            confidence = probabilities[idx] * 100
            suitability = "Highly Suitable" if confidence > 80 else "Suitable" if confidence > 60 else "Moderately Suitable"
            print(f"  {i}. {crop_labels[idx]}")
            print(f"     Confidence: {confidence:.1f}%")
            print(f"     Suitability: {suitability}")
    else:
        print(f"\n✓ Recommended Crop: {prediction}")
    
    # Soil analysis
    print(f"\nSoil Analysis:")
    print(f"  Nitrogen: {'Optimal' if 20 <= N <= 100 else 'Needs adjustment'}")
    print(f"  Phosphorus: {'Optimal' if 10 <= P <= 80 else 'Needs adjustment'}")
    print(f"  Potassium: {'Optimal' if 10 <= K <= 60 else 'Needs adjustment'}")
    print(f"  pH: {'Optimal' if 5.5 <= ph <= 7.5 else 'Needs adjustment'}")
    
    print("="*60 + "\n")
    return prediction


# Example Usage
if __name__ == "__main__":
    print("\n" + "="*60)
    print("FarmChain ML Models - Direct Usage Examples")
    print("="*60 + "\n")
    
    # Example 1: Predict Rice Yield in India
    predict_yield(
        area="India",
        crop="Rice",
        year=2024,
        rainfall=1200,
        pesticides=50,
        temperature=25.5
    )
    
    # Example 2: Recommend Crop for given soil conditions
    recommend_crop(
        N=90,
        P=42,
        K=43,
        temperature=20.87,
        humidity=82.00,
        ph=6.50,
        rainfall=202.93
    )
    
    # Example 3: Another crop recommendation
    recommend_crop(
        N=85,
        P=58,
        K=41,
        temperature=21.77,
        humidity=80.31,
        ph=7.03,
        rainfall=226.65
    )
    
    print("="*60)
    print("You can now use these functions in your own scripts!")
    print("="*60)
    print("\nExample usage:")
    print("  from use_models_directly import predict_yield, recommend_crop")
    print("  ")
    print("  # Predict yield")
    print("  yield_value = predict_yield('India', 'Wheat', 2024, 800, 40, 22)")
    print("  ")
    print("  # Recommend crop")
    print("  crop = recommend_crop(80, 45, 50, 25, 75, 6.8, 150)")
    print("="*60 + "\n")
