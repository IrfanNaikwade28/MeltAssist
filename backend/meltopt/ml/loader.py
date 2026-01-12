"""ML Model Loader - Singleton pattern for efficient model loading"""

import pickle
import logging
from pathlib import Path
from typing import Dict, Any

try:
    import joblib
    HAS_JOBLIB = True
except ImportError:
    HAS_JOBLIB = False

from .config import MODELS

logger = logging.getLogger(__name__)


class ModelLoader:
    """Singleton class to load and cache ML models"""
    
    _instance = None
    _models = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._models = {}
            cls._instance._load_models()
        return cls._instance
    
    def _load_models(self) -> None:
        """Load all ML models from disk"""
        logger.info("Loading ML models...")
        
        failed_models = []
        
        for model_name, config in MODELS.items():
            model_path = config['path']
            
            if not model_path.exists():
                logger.warning(f"Model file not found: {model_path}")
                failed_models.append((model_name, f"File not found: {model_path}"))
                continue
            
            # Try multiple loading strategies
            loading_methods = []
            
            # Method 1: joblib (recommended)
            if HAS_JOBLIB:
                loading_methods.append(('joblib', lambda: joblib.load(model_path)))
            
            # Method 2: pickle with default settings
            loading_methods.append(('pickle', lambda: pickle.load(open(model_path, 'rb'))))
            
            # Method 3: pickle with latin1 encoding
            loading_methods.append(('pickle-latin1', lambda: pickle.load(open(model_path, 'rb'), encoding='latin1')))
            
            # Method 4: pickle with bytes encoding
            loading_methods.append(('pickle-bytes', lambda: pickle.load(open(model_path, 'rb'), encoding='bytes')))
            
            success = False
            for method_name, load_func in loading_methods:
                try:
                    self._models[model_name] = load_func()
                    logger.info(f"✓ Loaded {model_name} model from {model_path.name} using {method_name}")
                    success = True
                    break
                except Exception as e:
                    continue
            
            if not success:
                error_msg = "All loading methods failed (pickle incompatibility)"
                logger.error(f"Failed to load {model_name} model: {error_msg}")
                failed_models.append((model_name, error_msg))
        
        if self._models:
            logger.info(f"Successfully loaded {len(self._models)} model(s)")
        
        if failed_models:
            logger.warning(f"Failed to load {len(failed_models)} model(s):")
            for model_name, error in failed_models:
                logger.warning(f"  - {model_name}: {error}")
            
            # If ALL models failed, raise an error
            if not self._models:
                raise RuntimeError(
                    "Failed to load any models. Please ensure:\n"
                    "1. Model files exist in backend/models/\n"
                    "2. Models were saved with compatible Python/sklearn versions\n"
                    "3. Run: python -c \"import pickle; print(pickle.format_version)\"\n"
                    "   to check pickle compatibility"
                )
    
    def get_model(self, model_name: str) -> Any:
        """Get a specific model by name"""
        if model_name not in self._models:
            raise ValueError(f"Model '{model_name}' not found. Available: {list(self._models.keys())}")
        return self._models[model_name]
    
    def get_all_models(self) -> Dict[str, Any]:
        """Get all loaded models"""
        return self._models
    
    @property
    def is_loaded(self) -> bool:
        """Check if models are loaded"""
        return bool(self._models)


# Global instance
model_loader = ModelLoader()
