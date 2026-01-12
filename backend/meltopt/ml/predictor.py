"""ML Prediction Engine with Safety Constraints"""

import numpy as np
import logging
from typing import Dict, List, Tuple

from .loader import model_loader
from .config import MODELS, CHEMISTRY_ELEMENTS, SAFETY_THRESHOLDS, STEP_STRATEGY

logger = logging.getLogger(__name__)


class MeltPredictor:
    """Main prediction class for melt chemistry optimization"""
    
    def __init__(self):
        self.models = model_loader.get_all_models()
        self.model_configs = MODELS
        
        # Auto-detect expected features from first model
        if self.models:
            first_model = next(iter(self.models.values()))
            if hasattr(first_model, 'n_features_in_'):
                expected_features = first_model.n_features_in_
                actual_features = len(CHEMISTRY_ELEMENTS)
                
                if expected_features != actual_features:
                    logger.warning(
                        f"Feature mismatch detected! Models expect {expected_features} features, "
                        f"but CHEMISTRY_ELEMENTS has {actual_features}. "
                        f"Please update config.py to match your training data."
                    )
    
    def compute_chemistry_delta(self, initial: Dict[str, float], target: Dict[str, float]) -> Dict[str, float]:
        """Compute the difference between target and initial chemistry"""
        delta = {}
        for element in CHEMISTRY_ELEMENTS:
            initial_val = initial.get(element, 0.0)
            target_val = target.get(element, 0.0)
            delta[element] = target_val - initial_val
        return delta
    
    def prepare_features(self, chemistry_delta: Dict[str, float]) -> np.ndarray:
        """Convert chemistry delta dict to feature array for ML models"""
        # Assumes models were trained with these features in this order
        features = [chemistry_delta.get(elem, 0.0) for elem in CHEMISTRY_ELEMENTS]
        return np.array(features).reshape(1, -1)
    
    def apply_safety_limits(self, prediction: float, model_name: str, is_step_recommendation: bool = False) -> Tuple[float, List[str]]:
        """Apply safety constraints to predictions"""
        warnings = []
        config = self.model_configs[model_name]
        
        # Use step limit if this is a step recommendation
        max_val = config['max_per_step'] if is_step_recommendation else config['max']
        min_val = config['min']
        warn_threshold = SAFETY_THRESHOLDS['warn_threshold'] * max_val
        
        # Check if prediction exceeds limits
        if prediction < min_val:
            warnings.append(f"{model_name}: Prediction {prediction:.2f} below minimum {min_val}")
            prediction = min_val
        
        if prediction > max_val:
            warnings.append(f"{model_name}: Prediction {prediction:.2f} exceeds maximum {max_val}, clamped")
            prediction = max_val
        
        # Warning if approaching limits
        if prediction > warn_threshold:
            warnings.append(f"{model_name}: Approaching limit (recommend step-wise addition)")
        
        return prediction, warnings
    
    def predict_alloy_additions(self, initial_chemistry: Dict[str, float], 
                                target_chemistry: Dict[str, float],
                                melt_weight: float = None) -> Dict:
        """Main prediction method with melt weight scaling"""
        try:
            # Validate melt weight
            if melt_weight is None:
                melt_weight = SAFETY_THRESHOLDS['reference_melt_weight']
                logger.warning(f"No melt weight provided, using reference: {melt_weight} kg")
            
            if melt_weight < SAFETY_THRESHOLDS['min_melt_weight']:
                return {
                    'status': 'error',
                    'message': f'Melt weight too small: {melt_weight} kg (min: {SAFETY_THRESHOLDS["min_melt_weight"]} kg)',
                }
            
            if melt_weight > SAFETY_THRESHOLDS['max_melt_weight']:
                return {
                    'status': 'error',
                    'message': f'Melt weight too large: {melt_weight} kg (max: {SAFETY_THRESHOLDS["max_melt_weight"]} kg)',
                }
            
            # Step 1: Compute chemistry differences
            delta = self.compute_chemistry_delta(initial_chemistry, target_chemistry)
            logger.info(f"Chemistry delta computed: {delta}")
            
            # Check if correction is large
            large_correction = any(
                abs(delta[elem]) > STEP_STRATEGY['large_correction_threshold'] * target_chemistry.get(elem, 1.0)
                for elem in CHEMISTRY_ELEMENTS
            )
            
            # Step 2: Prepare features
            features = self.prepare_features(delta)
            
            # Step 3: Run predictions for each alloy
            predictions = {}
            all_warnings = []
            
            # Scale factor based on melt weight
            weight_scale = melt_weight / SAFETY_THRESHOLDS['reference_melt_weight']
            
            for model_name, model in self.models.items():
                # Get raw prediction (for reference melt weight)
                raw_prediction = model.predict(features)[0]
                
                # Scale by actual melt weight
                scaled_prediction = raw_prediction * weight_scale
                
                # Calculate step recommendation (safe incremental addition)
                total_needed = scaled_prediction * STEP_STRATEGY['safety_factor']
                step_recommendation, step_warnings = self.apply_safety_limits(
                    total_needed, model_name, is_step_recommendation=True
                )
                
                # Estimate number of steps
                estimated_steps = max(1, int(np.ceil(total_needed / step_recommendation)))
                
                predictions[model_name] = {
                    'step_recommendation': float(step_recommendation),  # What operator should add NOW
                    'total_estimated': float(total_needed),  # Total estimated for full correction
                    'estimated_steps': estimated_steps,
                    'unit': 'kg',
                    'max_per_step': self.model_configs[model_name]['max_per_step'],
                }
                
                all_warnings.extend(step_warnings)
            
            # Add global warnings
            if large_correction:
                all_warnings.insert(0, "⚠ Large chemistry correction detected - multiple steps recommended")
            
            # Step 4: Build operator-friendly response
            response = {
                'status': 'success',
                'operator_instructions': {
                    'message': 'Recommended additions for STEP 1:',
                    'next_action': 'Add alloys → Mix → Sample → Re-run system',
                },
                'chemistry_delta': delta,
                'melt_weight_kg': float(melt_weight),
                'recommendations': predictions,
                'warnings': all_warnings if all_warnings else None,
                'metadata': {
                    'models_used': list(self.models.keys()),
                    'large_correction': large_correction,
                    'safety_factor_applied': STEP_STRATEGY['safety_factor'],
                },
            }
            
            logger.info(f"Predictions generated successfully for {melt_weight} kg melt")
            return response
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}", exc_info=True)
            return {
                'status': 'error',
                'message': str(e),
            }
