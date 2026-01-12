"""
Create Dummy ML Models for Testing

This script creates simple working sklearn models for testing the API
when real trained models are not available or incompatible.
"""

import pickle
import numpy as np
from sklearn.linear_model import LinearRegression
from pathlib import Path

print("Creating dummy models for testing...")
print("=" * 60)

# Model directory
MODELS_DIR = Path(__file__).resolve().parent / 'models'
MODELS_DIR.mkdir(exist_ok=True)

# Number of chemistry features (C, Si, Mn, P, S, Cr, Ni, Cu, Mo, V)
N_FEATURES = 10

# Create dummy models for each alloy type
models_to_create = ['fesi', 'femn', 'fecr', 'ni']

for model_name in models_to_create:
    # Create a simple linear regression model
    model = LinearRegression()
    
    # Create dummy training data
    X_dummy = np.random.randn(100, N_FEATURES)
    
    # Create dummy target values (alloy additions in kg)
    # Different base values for different alloys
    base_values = {'fesi': 50, 'femn': 30, 'fecr': 40, 'ni': 20}
    y_dummy = base_values[model_name] + np.random.randn(100) * 10
    
    # Fit the model
    model.fit(X_dummy, y_dummy)
    
    # Save the model
    model_path = MODELS_DIR / f'{model_name}_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"✓ Created {model_name}_model.pkl")
    print(f"  Type: LinearRegression")
    print(f"  Expected output range: {base_values[model_name] - 30} - {base_values[model_name] + 30} kg\n")

print("=" * 60)
print("✓ All dummy models created successfully!")
print(f"Location: {MODELS_DIR}")
print("\nYou can now start the Django server:")
print("  python manage.py runserver")
print("\nNote: These are dummy models for testing only.")
print("Replace with real trained models for production use.")
