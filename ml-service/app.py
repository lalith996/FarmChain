"""
Flask ML Service for Crop Yield Prediction and Crop Recommendation
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load models
MODEL_DIR = 'models'

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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'FarmChain ML Service',
        'models_loaded': {
            'yield_prediction': True,
            'crop_recommendation': True
        }
    })

@app.route('/api/ml/predict-yield', methods=['POST'])
def predict_yield():
    """
    Predict crop yield based on input parameters
    
    Expected input:
    {
        "Area": "string",
        "Item": "string",
        "Year": number,
        "average_rain_fall_mm_per_year": number,
        "pesticides_tonnes": number,
        "avg_temp": number
    }
    """
    try:
        data = request.json
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Create DataFrame with features
        input_df = pd.DataFrame([data])
        
        # Ensure all required features are present
        missing_features = set(yield_features) - set(input_df.columns)
        if missing_features:
            return jsonify({
                'error': f'Missing required features: {list(missing_features)}'
            }), 400
        
        # Reorder columns to match training
        input_df = input_df[yield_features]
        
        # Encode categorical variables
        for column, encoder in yield_label_encoders.items():
            if column in input_df.columns:
                try:
                    input_df[column] = encoder.transform(input_df[column])
                except ValueError:
                    # Handle unknown categories
                    input_df[column] = 0
        
        # Scale features
        input_scaled = yield_scaler.transform(input_df)
        
        # Make prediction
        prediction = yield_model.predict(input_scaled)[0]
        
        # Get confidence interval (approximate)
        confidence = 0.85  # Based on model R² score
        
        return jsonify({
            'success': True,
            'prediction': {
                'yield': float(prediction),
                'unit': 'hg/ha',
                'confidence': confidence,
                'interpretation': get_yield_interpretation(prediction)
            },
            'input': data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ml/recommend-crop', methods=['POST'])
def recommend_crop():
    """
    Recommend best crop based on soil and climate conditions
    
    Expected input:
    {
        "N": number,  // Nitrogen content
        "P": number,  // Phosphorus content
        "K": number,  // Potassium content
        "temperature": number,
        "humidity": number,
        "ph": number,
        "rainfall": number
    }
    """
    try:
        data = request.json
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Create DataFrame
        input_df = pd.DataFrame([data])
        
        # Ensure all required features are present
        missing_features = set(crop_features) - set(input_df.columns)
        if missing_features:
            return jsonify({
                'error': f'Missing required features: {list(missing_features)}'
            }), 400
        
        # Reorder columns to match training
        input_df = input_df[crop_features]
        
        # Scale features
        input_scaled = crop_scaler.transform(input_df)
        
        # Make prediction
        prediction = crop_model.predict(input_scaled)[0]
        
        # Get prediction probabilities
        if hasattr(crop_model, 'predict_proba'):
            probabilities = crop_model.predict_proba(input_scaled)[0]
            
            # Get top 3 recommendations
            top_indices = np.argsort(probabilities)[-3:][::-1]
            recommendations = [
                {
                    'crop': crop_labels[idx],
                    'confidence': float(probabilities[idx]),
                    'suitability': get_suitability_level(probabilities[idx])
                }
                for idx in top_indices
            ]
        else:
            recommendations = [{
                'crop': prediction,
                'confidence': 0.85,
                'suitability': 'High'
            }]
        
        return jsonify({
            'success': True,
            'recommended_crop': prediction,
            'recommendations': recommendations,
            'soil_analysis': analyze_soil_conditions(data),
            'input': data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ml/batch-recommend', methods=['POST'])
def batch_recommend():
    """
    Get crop recommendations for multiple soil samples
    """
    try:
        data = request.json
        samples = data.get('samples', [])
        
        if not samples:
            return jsonify({'error': 'No samples provided'}), 400
        
        results = []
        for sample in samples:
            input_df = pd.DataFrame([sample])[crop_features]
            input_scaled = crop_scaler.transform(input_df)
            prediction = crop_model.predict(input_scaled)[0]
            
            results.append({
                'input': sample,
                'recommended_crop': prediction
            })
        
        return jsonify({
            'success': True,
            'results': results,
            'total_samples': len(samples)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_yield_interpretation(yield_value):
    """Interpret yield prediction"""
    if yield_value > 50000:
        return "Excellent yield expected"
    elif yield_value > 30000:
        return "Good yield expected"
    elif yield_value > 15000:
        return "Average yield expected"
    else:
        return "Below average yield expected"

def get_suitability_level(confidence):
    """Get suitability level based on confidence"""
    if confidence > 0.8:
        return "Highly Suitable"
    elif confidence > 0.6:
        return "Suitable"
    elif confidence > 0.4:
        return "Moderately Suitable"
    else:
        return "Less Suitable"

def analyze_soil_conditions(data):
    """Analyze soil conditions and provide insights"""
    analysis = {
        'nitrogen': 'Optimal' if 20 <= data.get('N', 0) <= 100 else 'Needs adjustment',
        'phosphorus': 'Optimal' if 10 <= data.get('P', 0) <= 80 else 'Needs adjustment',
        'potassium': 'Optimal' if 10 <= data.get('K', 0) <= 60 else 'Needs adjustment',
        'ph': 'Optimal' if 5.5 <= data.get('ph', 0) <= 7.5 else 'Needs adjustment',
        'overall': 'Good'
    }
    
    # Determine overall condition
    adjustments_needed = sum(1 for v in analysis.values() if v == 'Needs adjustment')
    if adjustments_needed >= 3:
        analysis['overall'] = 'Poor - Multiple adjustments needed'
    elif adjustments_needed >= 2:
        analysis['overall'] = 'Fair - Some adjustments needed'
    
    return analysis

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
