export interface Chemistry {
  C: number;
  Si: number;
  Mn: number;
  Cr: number;
  Ni: number;
}

export interface MeltInput {
  initialChemistry: Chemistry;
  targetChemistry: Chemistry;
  meltWeight: number;
}

export interface AlloyRecommendation {
  name: string;
  step1Kg: number;
  totalEstimatedKg: number;
  estimatedSteps: number;
  alloyRate: number;
  maxPerStep: number;
  isCostSensitive?: boolean;
}

export interface OperatorInstruction {
  message: string;
  checklist: string[];
}

export interface Warning {
  type: 'caution' | 'danger';
  message: string;
}

export interface ApiResponse {
  meltWeight: number;
  meltWeightTons: number;
  safetyFactor: number;
  alloyRecommendations: AlloyRecommendation[];
  operatorInstructions: OperatorInstruction;
  warnings: Warning[];
  metadata: {
    largeCorrection: boolean;
    clampedPredictions: boolean;
  };
}

export type WorkflowStep = 
  | 'melt-input'
  | 'chemistry-analysis'
  | 'alloy-recommendation'
  | 'step-execution'
  | 're-sampling'
  | 'completion';

export interface StepInfo {
  id: WorkflowStep;
  label: string;
  instruction: string;
}

export const WORKFLOW_STEPS: StepInfo[] = [
  { id: 'melt-input', label: 'Melt Input', instruction: 'Enter initial and target chemistry values' },
  { id: 'chemistry-analysis', label: 'Chemistry Analysis', instruction: 'Review chemistry gap and deltas' },
  { id: 'alloy-recommendation', label: 'Alloy Recommendation', instruction: 'Review STEP-1 additions and proceed carefully' },
  { id: 'step-execution', label: 'Step Execution', instruction: 'Follow operator instructions precisely' },
  { id: 're-sampling', label: 'Re-Sampling', instruction: 'Review warnings and safety alerts' },
  { id: 'completion', label: 'Completion', instruction: 'Approve, recalculate, or abort operation' },
];
