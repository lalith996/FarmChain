"""
Quick test script for ML API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:5001"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("Testing Health Endpoint")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_yield_prediction():
    """Test yield prediction endpoint"""
    print("\n" + "="*60)
    print("Testing Yield Prediction")
    print("="*60)
    
    data = {
        "Area": "India",
        "Item": "Rice",
        "Year": 2024,
        "average_rain_fall_mm_per_year": 1200,
        "pesticides_tonnes": 50,
        "avg_temp": 25.5
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/api/ml/predict-yield",
        json=data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_crop_recommendation():
    """Test crop recommendation endpoint"""
    print("\n" + "="*60)
    print("Testing Crop Recommendation")
    print("="*60)
    
    data = {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 20.87,
        "humidity": 82.00,
        "ph": 6.50,
        "rainfall": 202.93
    }
    
    print(f"Input: {json.dumps(data, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/api/ml/recommend-crop",
        json=data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_batch_recommendation():
    """Test batch recommendation endpoint"""
    print("\n" + "="*60)
    print("Testing Batch Recommendation")
    print("="*60)
    
    data = {
        "samples": [
            {
                "N": 90, "P": 42, "K": 43,
                "temperature": 20.87, "humidity": 82.00,
                "ph": 6.50, "rainfall": 202.93
            },
            {
                "N": 85, "P": 58, "K": 41,
                "temperature": 21.77, "humidity": 80.31,
                "ph": 7.03, "rainfall": 226.65
            }
        ]
    }
    
    print(f"Input: {len(data['samples'])} samples")
    
    response = requests.post(
        f"{BASE_URL}/api/ml/batch-recommend",
        json=data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

if __name__ == "__main__":
    print("\n" + "="*60)
    print("FarmChain ML Service API Tests")
    print("="*60)
    
    results = {
        "Health Check": test_health(),
        "Yield Prediction": test_yield_prediction(),
        "Crop Recommendation": test_crop_recommendation(),
        "Batch Recommendation": test_batch_recommendation()
    }
    
    print("\n" + "="*60)
    print("Test Results Summary")
    print("="*60)
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "="*60)
    if all_passed:
        print("✓ All tests passed!")
    else:
        print("✗ Some tests failed")
    print("="*60 + "\n")
