import { useState } from 'react';
import { WorkflowSidebar } from './WorkflowSidebar';
import { MeltInputStep } from './steps/MeltInputStep';
import { ChemistryAnalysisStep } from './steps/ChemistryAnalysisStep';
import { AlloyRecommendationStep } from './steps/AlloyRecommendationStep';
import { StepExecutionStep } from './steps/StepExecutionStep';
import { ReSamplingStep } from './steps/ReSamplingStep';
import { CompletionStep } from './steps/CompletionStep';
import { useFoundryWorkflow } from '@/hooks/useFoundryWorkflow';
import { Menu, X } from 'lucide-react';

export function FoundryDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    currentStep,
    completedSteps,
    meltInput,
    apiResponse,
    isLoading,
    goToStep,
    completeCurrentStep,
    submitMeltInput,
    recalculate,
    reset,
    getCurrentStepInfo,
    isStepAccessible,
  } = useFoundryWorkflow();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'melt-input':
        return (
          <MeltInputStep 
            onSubmit={submitMeltInput} 
            isLoading={isLoading} 
          />
        );
      
      case 'chemistry-analysis':
        if (!meltInput) return null;
        return (
          <ChemistryAnalysisStep 
            meltInput={meltInput} 
            onNext={completeCurrentStep} 
          />
        );
      
      case 'alloy-recommendation':
        if (!apiResponse) return null;
        return (
          <AlloyRecommendationStep 
            apiResponse={apiResponse} 
            onNext={completeCurrentStep} 
          />
        );
      
      case 'step-execution':
        if (!apiResponse) return null;
        return (
          <StepExecutionStep 
            apiResponse={apiResponse} 
            onNext={completeCurrentStep} 
          />
        );
      
      case 're-sampling':
        if (!apiResponse) return null;
        return (
          <ReSamplingStep 
            apiResponse={apiResponse} 
            onNext={completeCurrentStep} 
          />
        );
      
      case 'completion':
        if (!apiResponse) return null;
        return (
          <CompletionStep 
            apiResponse={apiResponse} 
            onRecalculate={recalculate} 
            onReset={reset}
            isLoading={isLoading}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-semibold text-lg">MeltAssist</h1>
        </div>
        <div className="text-xs text-muted-foreground">
          {getCurrentStepInfo().title}
        </div>
      </div>

      {/* Sidebar - Desktop: visible, Tablet/Mobile: overlay */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <WorkflowSidebar
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(step) => {
            goToStep(step);
            setSidebarOpen(false);
          }}
          isStepAccessible={isStepAccessible}
          currentStepInfo={getCurrentStepInfo()}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - Responsive padding for mobile header */}
      <main className="flex-1 h-full overflow-auto pt-14 lg:pt-0">
        {renderCurrentStep()}
      </main>
    </div>
  );
}
