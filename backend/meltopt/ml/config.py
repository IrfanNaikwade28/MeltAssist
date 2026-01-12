"""ML Model Configuration for Melt Chemistry Optimization"""

import os
from pathlib import Path

# Base directory for models
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / 'models'

# Model configurations
# IMPORTANT: Models predict kg per ton of melt (kg/ton)
MODELS = {
    'fesi': {
        'path': MODELS_DIR / 'fesi_model.pkl',
        'min_per_ton': 0.0,  # kg/ton
        'max_per_ton': 50.0,  # kg/ton (reasonable upper bound)
        'max_per_step_kg': 500.0,  # Absolute maximum kg per addition step
    },
    'femn': {
        'path': MODELS_DIR / 'femn_model.pkl',
        'min_per_ton': 0.0,
        'max_per_ton': 30.0,
        'max_per_step_kg': 300.0,
    },
    'fecr': {
        'path': MODELS_DIR / 'fecr_model.pkl',
        'min_per_ton': 0.0,
        'max_per_ton': 40.0,
        'max_per_step_kg': 400.0,
    },
    'ni': {
        'path': MODELS_DIR / 'ni_model.pkl',
        'min_per_ton': 0.0,
        'max_per_ton': 20.0,
        'max_per_step_kg': 200.0,
    },
}

# Chemistry elements tracked
# IMPORTANT: Adjust this list to match your training data!
# If models expect 5 features, list only those 5 elements here
CHEMISTRY_ELEMENTS = ['C', 'Si', 'Mn', 'Cr', 'Ni']  # Top 5 most common

# Full list of possible elements (for reference)
ALL_CHEMISTRY_ELEMENTS = ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Ni', 'Cu', 'Mo', 'V']

# Safety thresholds
SAFETY_THRESHOLDS = {
    'warn_threshold_multiplier': 0.8,  # Warn if approaching max
    'min_melt_weight_kg': 100.0,  # Minimum melt size
    'max_melt_weight_kg': 100000.0,  # Maximum melt size (100 tons)
}

# Step-wise addition strategy
STEP_STRATEGY = {
    'large_correction_threshold': 0.10,  # Flag if delta > 10% of target
    'safety_factor': 0.85,  # Apply 85% of calculated to avoid overshoot
    'min_step_kg': 10.0,  # Don't recommend additions smaller than this
}
