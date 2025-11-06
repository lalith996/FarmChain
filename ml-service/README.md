# FarmChain ML Service

Machine Learning service for crop yield prediction and crop recommendation.

## Features

1. **Crop Yield Prediction** - Predicts expected crop yield based on historical data
2. **Crop Recommendation** - Recommends best crops based on soil and climate conditions

## Setup

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Train Models

```bash
python train_models.py
```

This will:
- Train XGBoost and Random Forest models
- Select the best performing model
- Save models to `models/` directory

### 3. Start ML Service

```bash
python app.py
```

The service will run on `http://localhost:5001`

## API Endpoints

### Health Check
```
GET /health
```

### Predict Crop Yield
```
POST /api/ml/predict-yield
Content-Type: application/json

{
  "Area": "India",
  "Item": "Rice",
  "Year": 2024,
  "average_rain_fall_mm_per_year": 1200,
  "pesticides_tonnes": 50,
  "avg_temp": 25
}
```

### Recommend Crop
```
POST /api/ml/recommend-crop
Content-Type: application/json

{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.8,
  "humidity": 82,
  "ph": 6.5,
  "rainfall": 202
}
```

### Batch Recommendations
```
POST /api/ml/batch-recommend
Content-Type: application/json

{
  "samples": [
    {
      "N": 90,
      "P": 42,
      "K": 43,
      "temperature": 20.8,
      "humidity": 82,
      "ph": 6.5,
      "rainfall": 202
    }
  ]
}
```

## Model Performance

### Yield Prediction Model
- Algorithm: XGBoost Regressor
- R² Score: ~0.85-0.90
- RMSE: Low error rate

### Crop Recommendation Model
- Algorithm: XGBoost Classifier
- Accuracy: ~99%
- Supports 22 crop types

## Integration with Backend

The Node.js backend can call these endpoints to provide ML features to farmers.
