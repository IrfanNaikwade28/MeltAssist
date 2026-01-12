import { useState, useCallback } from 'react';
import { MeltInput, ApiResponse, WorkflowStep, WORKFLOW_STEPS, Chemistry } from '@/types/foundry';
import { 
  optimizeMelt, 
  mapApiResponseToInternal, 
  MeltApiError,
  type OptimizeMeltPayload 
} from '@/services/meltApi';
import { useToast } from '@/hooks/use-toast';

const STEP_ORDER: WorkflowStep[] = WORKFLOW_STEPS.map(s => s.id);

/**
 * Converts frontend MeltInput to API payload format
 */
function buildApiPayload(input: MeltInput): OptimizeMeltPayload {
  return {
    initial_chemistry: {
      C: Number(input.initialChemistry.C),
      Si: Number(input.initialChemistry.Si),
      Mn: Number(input.initialChemistry.Mn),
      Cr: Number(input.initialChemistry.Cr),
      Ni: Number(input.initialChemistry.Ni),
    },
    target_chemistry: {
      C: Number(input.targetChemistry.C),
      Si: Number(input.targetChemistry.Si),
      Mn: Number(input.targetChemistry.Mn),
      Cr: Number(input.targetChemistry.Cr),
      Ni: Number(input.targetChemistry.Ni),
    },
    melt_weight_kg: Number(input.meltWeight),
  };
}

export function useFoundryWorkflow() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('melt-input');
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);
  const [meltInput, setMeltInput] = useState<MeltInput | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const currentStepIndex = STEP_ORDER.indexOf(currentStep);

  const goToStep = useCallback((step: WorkflowStep) => {
    const stepIndex = STEP_ORDER.indexOf(step);
    if (stepIndex <= currentStepIndex || completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  }, [currentStepIndex, completedSteps]);

  const completeCurrentStep = useCallback(() => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      setCurrentStep(STEP_ORDER[nextIndex]);
    }
  }, [currentStep, currentStepIndex, completedSteps]);

  const submitMeltInput = useCallback(async (input: MeltInput) => {
    // Prevent duplicate submissions
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMeltInput(input);
    
    try {
      // Build API payload
      const payload = buildApiPayload(input);
      
      // Call real backend API
      const apiResponseRaw = await optimizeMelt(payload);
      
      // Map API response to internal format
      const response = mapApiResponseToInternal(apiResponseRaw);
      
      // Update response
      setApiResponse(response);
      
      // Show success notification
      toast({
        title: 'Chemistry Analysis Complete',
        description: 'Alloy recommendations have been generated.',
      });
      
      // Move to next step
      completeCurrentStep();
      
    } catch (err) {
      // Handle API errors
      const errorMessage = err instanceof MeltApiError 
        ? err.message 
        : 'An unexpected error occurred. Please try again.';
      
      setError(errorMessage);
      
      // Show error notification
      toast({
        title: 'Optimization Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      console.error('Melt optimization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, completeCurrentStep, toast]);

  const recalculate = useCallback(async () => {
    if (!meltInput || isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build API payload
      const payload = buildApiPayload(meltInput);
      
      // Call real backend API
      const apiResponseRaw = await optimizeMelt(payload);
      
      // Map API response to internal format
      const response = mapApiResponseToInternal(apiResponseRaw);
      
      // Update response
      setApiResponse(response);
      
      // Show success notification
      toast({
        title: 'Recalculation Complete',
        description: 'Updated recommendations have been generated.',
      });
      
    } catch (err) {
      const errorMessage = err instanceof MeltApiError 
        ? err.message 
        : 'Recalculation failed. Please try again.';
      
      setError(errorMessage);
      
      toast({
        title: 'Recalculation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      console.error('Melt recalculation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [meltInput, isLoading, toast]);

  const reset = useCallback(() => {
    setCurrentStep('melt-input');
    setCompletedSteps([]);
    setMeltInput(null);
    setApiResponse(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const getCurrentStepInfo = useCallback(() => {
    return WORKFLOW_STEPS.find(s => s.id === currentStep);
  }, [currentStep]);

  return {
    currentStep,
    completedSteps,
    meltInput,
    apiResponse,
    isLoading,
    error,
    goToStep,
    completeCurrentStep,
    submitMeltInput,
    recalculate,
    reset,
    getCurrentStepInfo,
    isStepAccessible: (step: WorkflowStep) => {
      const stepIndex = STEP_ORDER.indexOf(step);
      return stepIndex <= currentStepIndex || completedSteps.includes(step);
    },
    isStepCompleted: (step: WorkflowStep) => completedSteps.includes(step),
  };
}
