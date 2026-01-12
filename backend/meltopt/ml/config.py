"""ML Model Configuration for Melt Chemistry Optimization"""

import os
from pathlib import Path

# Base directory for models
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / 'models'

# Model configurations
MODELS = {
    'fesi': {
        'path': MODELS_DIR / 'fesi_model.pkl',
        'min': 0.0,
        'max': 500.0,  # kg per step
        'max_per_step': 500.0,  # Maximum safe addition per step
    },
    'femn': {
        'path': MODELS_DIR / 'femn_model.pkl',
        'min': 0.0,
        'max': 300.0,
        'max_per_step': 300.0,
    },
    'fecr': {
        'path': MODELS_DIR / 'fecr_model.pkl',
        'min': 0.0,
        'max': 400.0,
        'max_per_step': 400.0,
    },
    'ni': {
        'path': MODELS_DIR / 'ni_model.pkl',
        'min': 0.0,
        'max': 200.0,
        'max_per_step': 200.0,
    },
}

# Chemistry elements tracked
# IMPORTANT: Adjust this list to match your training data!
# If models expect 5 features, list only those 5 elements here
CHEMISTRY_ELEMENTS = ['C', 'Si', 'Mn', 'Cr', 'Ni']  # Top 5 most common

# Full list of possible elements (for reference)
ALL_CHEMISTRY_ELEMENTS = ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Ni', 'Cu', 'Mo', 'V']

# Safety thresholds (percentage-based warnings)
SAFETY_THRESHOLDS = {
    'max_single_addition': 500.0,  # kg
    'warn_threshold': 0.8,  # Warn if prediction > 80% of max
    'reference_melt_weight': 1000.0,  # kg (reference melt size for model training)
    'min_melt_weight': 100.0,  # kg
    'max_melt_weight': 100000.0,  # kg (100 tons)
}

# Step-wise addition strategy
STEP_STRATEGY = {
    'large_correction_threshold': 0.10,  # If delta > 10% of target, flag as large
    'estimate_steps': True,  # Estimate number of steps needed
    'safety_factor': 0.85,  # Apply 85% of calculated to avoid overshoot
}
