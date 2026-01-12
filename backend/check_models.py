"""
Model Compatibility Checker and Converter

This script checks if your .pkl model files are compatible with the current Python environment
and attempts to convert them if needed.
"""

import pickle
import sys
from pathlib import Path

# Add backend to path
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / 'models'

print(f"Python version: {sys.version}")
print(f"Pickle protocol version: {pickle.format_version}")
print(f"Checking models in: {MODELS_DIR}\n")

model_files = {
    'fesi': MODELS_DIR / 'fesi_model.pkl',
    'femn': MODELS_DIR / 'femn_model.pkl',
    'fecr': MODELS_DIR / 'fecr_model.pkl',
    'ni': MODELS_DIR / 'ni_model.pkl',
}

print("=" * 60)
print("MODEL COMPATIBILITY CHECK")
print("=" * 60)

results = {}

for model_name, model_path in model_files.items():
    print(f"\nChecking: {model_name} ({model_path.name})")
    print("-" * 60)
    
    if not model_path.exists():
        print(f"❌ File not found: {model_path}")
        results[model_name] = 'missing'
        continue
    
    # Try different loading methods
    methods = [
        ('Default', {}),
        ('Latin1 encoding', {'encoding': 'latin1'}),
        ('Bytes encoding', {'encoding': 'bytes'}),
    ]
    
    loaded = False
    for method_name, kwargs in methods:
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f, **kwargs)
            print(f"✓ Successfully loaded with {method_name}")
            print(f"  Model type: {type(model)}")
            
            # Check if it's a scikit-learn model
            if hasattr(model, 'predict'):
                print(f"  Has predict method: Yes")
            
            results[model_name] = 'ok'
            loaded = True
            break
        except Exception as e:
            print(f"✗ Failed with {method_name}: {str(e)[:80]}")
    
    if not loaded:
        results[model_name] = 'failed'

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)

ok_count = sum(1 for v in results.values() if v == 'ok')
failed_count = sum(1 for v in results.values() if v == 'failed')
missing_count = sum(1 for v in results.values() if v == 'missing')

print(f"✓ Working models: {ok_count}")
print(f"✗ Failed models: {failed_count}")
print(f"? Missing models: {missing_count}")

if failed_count > 0:
    print("\n" + "=" * 60)
    print("RECOMMENDED ACTIONS")
    print("=" * 60)
    print("""
The pickle format is incompatible. This usually happens when:
1. Models were trained with Python 2, but you're using Python 3
2. Models were trained with a very old scikit-learn version
3. Models were trained on a different OS architecture

SOLUTIONS:
-----------

Option 1: Re-save models (if you have the training script)
   - Run the original training script with current Python/sklearn
   - This will regenerate compatible .pkl files

Option 2: Use joblib instead of pickle
   - Install: pip install joblib
   - Update loader.py to use joblib.load() instead of pickle.load()

Option 3: Create dummy models for testing
   - Run: python create_dummy_models.py (I can create this script)
   - This generates simple working models for API testing

Which option would you like to proceed with?
""")

if ok_count == len(model_files):
    print("\n✓ All models are compatible! You can start the server.")
