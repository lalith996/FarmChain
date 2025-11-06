"""
Train ML models for crop yield prediction and crop recommendation
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
# import xgboost as xgb  # Optional - using RandomForest instead
import joblib
import os

def train_yield_prediction_model():
    """Train crop yield prediction model using Custom_Crops_yield_Historical_Dataset.csv"""
    print("Training Crop Yield Prediction Model...")
    
    # Load dataset
    df = pd.read_csv('../Custom_Crops_yield_Historical_Dataset.csv')
    
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # Select relevant features for prediction
    feature_cols = ['Year', 'Area_ha', 'N_req_kg_per_ha', 'P_req_kg_per_ha', 
                    'K_req_kg_per_ha', 'Temperature_C', 'Humidity_%', 'pH', 
                    'Rainfall_mm', 'Crop', 'State Name']
    
    # Target variable
    target_col = 'Yield_kg_per_ha'
    
    # Drop rows with missing values
    df = df.dropna(subset=feature_cols + [target_col])
    
    # Feature engineering
    X = df[feature_cols].copy()
    y = df[target_col]
    
    # Encode categorical variables if any
    label_encoders = {}
    for column in X.select_dtypes(include=['object']).columns:
        le = LabelEncoder()
        X[column] = le.fit_transform(X[column])
        label_encoders[column] = le
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest (primary model)
    print("Training Random Forest Regressor...")
    rf_model = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Evaluate RF
    y_pred_rf = rf_model.predict(X_test_scaled)
    rmse_rf = np.sqrt(mean_squared_error(y_test, y_pred_rf))
    r2_rf = r2_score(y_test, y_pred_rf)
    
    print(f"Random Forest Model Performance:")
    print(f"RMSE: {rmse_rf:.4f}")
    print(f"R² Score: {r2_rf:.4f}")
    
    # Use Random Forest as best model
    best_model = rf_model
    best_model_name = "RandomForest"
    
    print(f"\nUsing Model: {best_model_name}")
    
    # Save models and preprocessors
    os.makedirs('models', exist_ok=True)
    joblib.dump(best_model, 'models/yield_prediction_model.pkl')
    joblib.dump(scaler, 'models/yield_scaler.pkl')
    joblib.dump(label_encoders, 'models/yield_label_encoders.pkl')
    joblib.dump(list(X.columns), 'models/yield_feature_names.pkl')
    
    print("Yield prediction model saved successfully!")
    return best_model, scaler, label_encoders

def train_crop_recommendation_model():
    """Train crop recommendation model using Crop_recommendation.csv"""
    print("\nTraining Crop Recommendation Model...")
    
    # Load dataset
    df = pd.read_csv('../Crop_recommendation.csv')
    
    # Features and target
    X = df.drop(['label'], axis=1)
    y = df['label']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest Classifier (primary model)
    print("Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Evaluate RF
    y_pred_rf = rf_model.predict(X_test_scaled)
    accuracy_rf = accuracy_score(y_test, y_pred_rf)
    
    print(f"Random Forest Classifier Performance:")
    print(f"Accuracy: {accuracy_rf:.4f}")
    
    # Use Random Forest as best model
    best_model = rf_model
    best_model_name = "RandomForest"
    
    print(f"\nUsing Model: {best_model_name}")
    print(f"Accuracy: {accuracy_rf:.4f}")
    
    # Get feature importance
    if hasattr(best_model, 'feature_importances_'):
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': best_model.feature_importances_
        }).sort_values('importance', ascending=False)
        print("\nTop 5 Important Features:")
        print(feature_importance.head())
    
    # Save models and preprocessors
    joblib.dump(best_model, 'models/crop_recommendation_model.pkl')
    joblib.dump(scaler, 'models/crop_recommendation_scaler.pkl')
    joblib.dump(list(X.columns), 'models/crop_recommendation_features.pkl')
    joblib.dump(list(y.unique()), 'models/crop_labels.pkl')
    
    print("Crop recommendation model saved successfully!")
    return best_model, scaler

if __name__ == "__main__":
    print("=" * 60)
    print("FarmChain ML Model Training")
    print("=" * 60)
    
    # Train both models
    yield_model, yield_scaler, yield_encoders = train_yield_prediction_model()
    crop_model, crop_scaler = train_crop_recommendation_model()
    
    print("\n" + "=" * 60)
    print("Training Complete! Models saved in 'models/' directory")
    print("=" * 60)
