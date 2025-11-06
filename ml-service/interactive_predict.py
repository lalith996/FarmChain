"""
Interactive ML Prediction Script
Use trained models interactively from command line
"""
import joblib
import numpy as np
import pandas as pd
import os

# Load models
MODEL_DIR = 'models'

yield_model = joblib.load(os.path.join(MODEL_DIR, 'yield_prediction_model.pkl'))
yield_scaler = joblib.load(os.path.join(MODEL_DIR, 'yield_scaler.pkl'))
yield_label_encoders = joblib.load(os.path.join(MODEL_DIR, 'yield_label_encoders.pkl'))
yield_features = joblib.load(os.path.join(MODEL_DIR, 'yield_feature_names.pkl'))

crop_model = joblib.load(os.path.join(MODEL_DIR, 'crop_recommendation_model.pkl'))
crop_scaler = joblib.load(os.path.join(MODEL_DIR, 'crop_recommendation_scaler.pkl'))
crop_features = joblib.load(os.path.join(MODEL_DIR, 'crop_recommendation_features.pkl'))
crop_labels = joblib.load(os.path.join(MODEL_DIR, 'crop_labels.pkl'))

def interactive_yield_prediction():
    """Interactive yield prediction"""
    print("\n" + "="*60)
    print("CROP YIELD PREDICTION")
    print("="*60)
    
    area = input("Enter Area/Country (e.g., India, USA): ").strip()
    crop = input("Enter Crop Name (e.g., Rice, Wheat): ").strip()
    year = int(input("Enter Year (e.g., 2024): ").strip())
    rainfall = float(input("Enter Average Rainfall (mm/year): ").strip())
    pesticides = float(input("Enter Pesticides Used (tonnes): ").strip())
    temperature = float(input("Enter Average Temperature (°C): ").strip())
    
    # Create input
    data = {
        'Area': area,
        'Item': crop,
        'Year': year,
        'average_rain_fall_mm_per_year': rainfall,
        'pesticides_tonnes': pesticides,
        'avg_temp': temperature
    }
    
    input_df = pd.DataFrame([data])[yield_features]
    
    # Encode and scale
    for column, encoder in yield_label_encoders.items():
        if column in input_df.columns:
            try:
                input_df[column] = encoder.transform(input_df[column])
            except ValueError:
                input_df[column] = 0
    
    input_scaled = yield_scaler.transform(input_df)
    prediction = yield_model.predict(input_scaled)[0]
    
    print("\n" + "="*60)
    print("PREDICTION RESULT")
    print("="*60)
    print(f"Predicted Yield: {prediction:.2f} hg/ha")
    print(f"Approximately: {prediction/10000:.2f} tonnes/hectare")
    
    if prediction > 50000:
        print("Interpretation: Excellent yield expected ✓")
    elif prediction > 30000:
        print("Interpretation: Good yield expected ✓")
    elif prediction > 15000:
        print("Interpretation: Average yield expected")
    else:
        print("Interpretation: Below average yield expected")
    print("="*60)

def interactive_crop_recommendation():
    """Interactive crop recommendation"""
    print("\n" + "="*60)
    print("CROP RECOMMENDATION")
    print("="*60)
    
    print("\nEnter Soil Nutrient Levels:")
    N = float(input("  Nitrogen (N) ratio: ").strip())
    P = float(input("  Phosphorus (P) ratio: ").strip())
    K = float(input("  Potassium (K) ratio: ").strip())
    
    print("\nEnter Climate Conditions:")
    temperature = float(input("  Temperature (°C): ").strip())
    humidity = float(input("  Humidity (%): ").strip())
    rainfall = float(input("  Rainfall (mm): ").strip())
    
    print("\nEnter Soil Properties:")
    ph = float(input("  pH value: ").strip())
    
    # Create input
    data = {
        'N': N, 'P': P, 'K': K,
        'temperature': temperature,
        'humidity': humidity,
        'ph': ph,
        'rainfall': rainfall
    }
    
    input_df = pd.DataFrame([data])[crop_features]
    input_scaled = crop_scaler.transform(input_df)
    prediction = crop_model.predict(input_scaled)[0]
    
    print("\n" + "="*60)
    print("RECOMMENDATION RESULT")
    print("="*60)
    print(f"✓ Best Recommended Crop: {prediction}")
    
    # Get top 3 recommendations
    if hasattr(crop_model, 'predict_proba'):
        probabilities = crop_model.predict_proba(input_scaled)[0]
        top_indices = np.argsort(probabilities)[-3:][::-1]
        
        print("\nTop 3 Recommendations:")
        for i, idx in enumerate(top_indices, 1):
            confidence = probabilities[idx] * 100
            print(f"  {i}. {crop_labels[idx]} - {confidence:.1f}% confidence")
    
    # Soil analysis
    print("\nSoil Analysis:")
    print(f"  Nitrogen: {'✓ Optimal' if 20 <= N <= 100 else '⚠ Needs adjustment'}")
    print(f"  Phosphorus: {'✓ Optimal' if 10 <= P <= 80 else '⚠ Needs adjustment'}")
    print(f"  Potassium: {'✓ Optimal' if 10 <= K <= 60 else '⚠ Needs adjustment'}")
    print(f"  pH: {'✓ Optimal' if 5.5 <= ph <= 7.5 else '⚠ Needs adjustment'}")
    print("="*60)

def main():
    """Main interactive menu"""
    while True:
        print("\n" + "="*60)
        print("FarmChain ML Models - Interactive Mode")
        print("="*60)
        print("\nChoose an option:")
        print("  1. Predict Crop Yield")
        print("  2. Get Crop Recommendation")
        print("  3. Exit")
        print("="*60)
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == '1':
            interactive_yield_prediction()
        elif choice == '2':
            interactive_crop_recommendation()
        elif choice == '3':
            print("\nThank you for using FarmChain ML Models!")
            break
        else:
            print("\n⚠ Invalid choice. Please enter 1, 2, or 3.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("Loading ML Models...")
    print("="*60)
    print("✓ Models loaded successfully!\n")
    
    main()
