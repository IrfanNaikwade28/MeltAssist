"""
Model Retraining Template for MeltAssist

This is a TEMPLATE for retraining your ML models with the current Python environment.
You need to:
1. Replace the training data loading section with your actual data
2. Adjust feature engineering to match your original approach
3. Run this script to regenerate compatible .pkl files

IMPORTANT: Use this as a starting point - adapt it to match your original training process.
"""

import numpy as np
import pandas as pd
import joblib  # More robust than pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor  # Or your actual model type
from sklearn.linear_model import LinearRegression
from pathlib import Path

print("=" * 70)
print("MELT CHEMISTRY ML MODEL RETRAINING")
print("=" * 70)

# Configuration
MODELS_DIR = Path(__file__).resolve().parent / 'models'
MODELS_DIR.mkdir(exist_ok=True)

# Chemistry elements (features)
CHEMISTRY_ELEMENTS = ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Ni', 'Cu', 'Mo', 'V']

# Alloys to predict
ALLOYS = ['fesi', 'femn', 'fecr', 'ni']


def load_training_data():
    """
    REPLACE THIS FUNCTION with your actual data loading logic.
    
    Expected return format:
    - X: DataFrame with chemistry differences (target - initial) for each element
    - y_dict: Dictionary with keys 'fesi', 'femn', 'fecr', 'ni' 
              and values as arrays of alloy additions in kg
    """
    print("\n⚠️  ATTENTION: Replace this function with your actual data loading!")
    print("This is generating DUMMY data for demonstration only.\n")
    
    # EXAMPLE: Generate synthetic data (REPLACE THIS)
    n_samples = 1000
    
    # Random chemistry deltas (target - initial)
    X = pd.DataFrame(
        np.random.randn(n_samples, len(CHEMISTRY_ELEMENTS)),
        columns=CHEMISTRY_ELEMENTS
    )
    
    # Random alloy additions (REPLACE with actual data)
    y_dict = {
        'fesi': 50 + 20 * np.random.randn(n_samples),
        'femn': 30 + 15 * np.random.randn(n_samples),
        'fecr': 40 + 18 * np.random.randn(n_samples),
        'ni': 20 + 10 * np.random.randn(n_samples),
    }
    
    # Ensure non-negative values
    for alloy in ALLOYS:
        y_dict[alloy] = np.maximum(y_dict[alloy], 0)
    
    return X, y_dict


def train_model(X, y, model_name):
    """
    Train a single model for one alloy type.
    
    ADJUST THIS to match your original model architecture:
    - RandomForestRegressor
    - GradientBoostingRegressor
    - XGBoost
    - Neural Network
    - etc.
    """
    print(f"\nTraining {model_name} model...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # OPTION 1: Linear Regression (simple, fast)
    model = LinearRegression()
    
    # OPTION 2: Random Forest (more robust, use this if unsure)
    # model = RandomForestRegressor(
    #     n_estimators=100,
    #     max_depth=10,
    #     random_state=42,
    #     n_jobs=-1
    # )
    
    # Train
    model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"  Train R²: {train_score:.4f}")
    print(f"  Test R²:  {test_score:.4f}")
    
    return model


def main():
    """Main training pipeline"""
    
    # Step 1: Load data
    print("\n" + "=" * 70)
    print("STEP 1: Loading Training Data")
    print("=" * 70)
    X, y_dict = load_training_data()
    print(f"Loaded {len(X)} samples with {len(X.columns)} features")
    
    # Step 2: Train models
    print("\n" + "=" * 70)
    print("STEP 2: Training Models")
    print("=" * 70)
    
    trained_models = {}
    for alloy in ALLOYS:
        trained_models[alloy] = train_model(X, y_dict[alloy], alloy)
    
    # Step 3: Save models
    print("\n" + "=" * 70)
    print("STEP 3: Saving Models")
    print("=" * 70)
    
    for alloy, model in trained_models.items():
        model_path = MODELS_DIR / f'{alloy}_model.pkl'
        
        # Use joblib (recommended) or pickle
        joblib.dump(model, model_path)
        # OR: pickle.dump(model, open(model_path, 'wb'))
        
        print(f"\u2713 Saved {alloy}_model.pkl")
    
    # Step 4: Verification
    print("\n" + "=" * 70)
    print("STEP 4: Verification")
    print("=" * 70)
    
    print("\nTesting model loading...")
    for alloy in ALLOYS:
        model_path = MODELS_DIR / f'{alloy}_model.pkl'
        loaded_model = joblib.load(model_path)
        
        # Test prediction
        test_input = X.iloc[0:1]
        prediction = loaded_model.predict(test_input)[0]
        print(f"\u2713 {alloy}: Loaded successfully, test prediction = {prediction:.2f} kg")
    
    print("\n" + "=" * 70)
    print("✓ RETRAINING COMPLETE!")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Verify the models work: python manage.py runserver")
    print("2. Test the API: POST http://localhost:8000/api/optimize/")
    print("\nNote: If you used dummy data, replace with real training data!")


if __name__ == "__main__":
    # Check dependencies
    try:
        import joblib
        import sklearn
        print(f"✓ scikit-learn version: {sklearn.__version__}")
        print(f"✓ joblib available")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install scikit-learn joblib")
        exit(1)
    
    main()
