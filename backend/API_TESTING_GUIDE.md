# Melt Chemistry Optimization API - Testing Guide

## API Endpoint
```
POST http://localhost:8000/api/optimize/
GET  http://localhost:8000/api/optimize/  (health check)
```

## Starting the Server

```bash
# Navigate to backend folder
cd backend

# Activate virtual environment (if using venv)
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Run migrations (first time only)
python manage.py migrate

# Start server
python manage.py runserver
```

The ML models will load automatically at server startup. You should see:
```
Loading ML models...
✓ Loaded fesi model from fesi_model.pkl
✓ Loaded femn model from femn_model.pkl
✓ Loaded fecr model from fecr_model.pkl
✓ Loaded ni model from ni_model.pkl
All 4 models loaded successfully!
```

## Testing the API

### 1. Health Check (GET)
```bash
curl http://localhost:8000/api/optimize/
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Melt Chemistry Optimization API",
  "models_loaded": true
}
```

### 2. Prediction Request (POST)

#### Using curl:
```bash
curl -X POST http://localhost:8000/api/optimize/ \
  -H "Content-Type: application/json" \
  -d '{
    "initial_chemistry": {
      "C": 0.15,
      "Si": 0.25,
      "Mn": 0.80,
      "P": 0.020,
      "S": 0.015,
      "Cr": 0.10,
      "Ni": 0.05,
      "Cu": 0.12,
      "Mo": 0.02,
      "V": 0.01
    },
    "target_chemistry": {
      "C": 0.18,
      "Si": 0.30,
      "Mn": 1.00,
      "P": 0.020,
      "S": 0.015,
      "Cr": 0.15,
      "Ni": 0.08,
      "Cu": 0.12,
      "Mo": 0.02,
      "V": 0.01
    }
  }'
```

#### Using PowerShell:
```powershell
$body = @{
    initial_chemistry = @{
        C = 0.15
        Si = 0.25
        Mn = 0.80
        P = 0.020
        S = 0.015
        Cr = 0.10
        Ni = 0.05
        Cu = 0.12
        Mo = 0.02
        V = 0.01
    }
    target_chemistry = @{
        C = 0.18
        Si = 0.30
        Mn = 1.00
        P = 0.020
        S = 0.015
        Cr = 0.15
        Ni = 0.08
        Cu = 0.12
        Mo = 0.02
        V = 0.01
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/optimize/" -Method POST -Body $body -ContentType "application/json"
```

#### Using Python (requests):
```python
import requests

url = "http://localhost:8000/api/optimize/"

data = {
    "initial_chemistry": {
        "C": 0.15, "Si": 0.25, "Mn": 0.80, "P": 0.020, "S": 0.015,
        "Cr": 0.10, "Ni": 0.05, "Cu": 0.12, "Mo": 0.02, "V": 0.01
    },
    "target_chemistry": {
        "C": 0.18, "Si": 0.30, "Mn": 1.00, "P": 0.020, "S": 0.015,
        "Cr": 0.15, "Ni": 0.08, "Cu": 0.12, "Mo": 0.02, "V": 0.01
    }
}

response = requests.post(url, json=data)
print(response.json())
```

### Expected Response Format:
```json
{
  "status": "success",
  "chemistry_delta": {
    "C": 0.03,
    "Si": 0.05,
    "Mn": 0.20,
    "P": 0.0,
    "S": 0.0,
    "Cr": 0.05,
    "Ni": 0.03,
    "Cu": 0.0,
    "Mo": 0.0,
    "V": 0.0
  },
  "predictions": {
    "fesi": {
      "raw_prediction": 45.23,
      "safe_prediction": 45.23,
      "unit": "kg",
      "min_limit": 0.0,
      "max_limit": 500.0
    },
    "femn": {
      "raw_prediction": 32.15,
      "safe_prediction": 32.15,
      "unit": "kg",
      "min_limit": 0.0,
      "max_limit": 300.0
    },
    "fecr": {
      "raw_prediction": 28.90,
      "safe_prediction": 28.90,
      "unit": "kg",
      "min_limit": 0.0,
      "max_limit": 400.0
    },
    "ni": {
      "raw_prediction": 15.45,
      "safe_prediction": 15.45,
      "unit": "kg",
      "min_limit": 0.0,
      "max_limit": 200.0
    }
  },
  "warnings": null,
  "metadata": {
    "models_used": ["fesi", "femn", "fecr", "ni"],
    "total_alloy_weight": 121.73
  }
}
```

## Error Handling

### Missing Required Fields:
```json
{
  "status": "error",
  "message": "Both initial_chemistry and target_chemistry are required"
}
```

### Invalid Input Format:
```json
{
  "status": "error",
  "message": "Chemistry data must be dictionaries"
}
```

### Safety Limit Exceeded (with warnings):
```json
{
  "status": "success",
  "predictions": { ... },
  "warnings": [
    "fesi: Prediction 520.00 exceeds maximum 500.0, clamped"
  ],
  ...
}
```

## Architecture Notes

- **Models load once** at server startup (singleton pattern)
- **Stateless API** - no database required for predictions
- **Safety limits** automatically applied to all predictions
- **Clean separation** - ML logic in `ml/` folder, API in `views.py`
- **Production-ready** - proper logging, error handling, validation

## Customization

To adjust safety limits, edit [backend/meltopt/ml/config.py](backend/meltopt/ml/config.py):

```python
MODELS = {
    'fesi': {
        'path': MODELS_DIR / 'fesi_model.pkl',
        'min': 0.0,
        'max': 500.0,  # Change this value
    },
    # ...
}
```
