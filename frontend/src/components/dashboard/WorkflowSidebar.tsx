import { 
  FlaskConical, 
  BarChart3, 
  Package, 
  PlayCircle, 
  RefreshCw, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowStep, WORKFLOW_STEPS, StepInfo } from '@/types/foundry';
import logo from "../../assets/logo/logo.png"

interface WorkflowSidebarProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick: (step: WorkflowStep) => void;
  isStepAccessible: (step: WorkflowStep) => boolean;
  currentStepInfo: StepInfo | undefined;
}

const stepIcons: Record<WorkflowStep, React.ReactNode> = {
  'melt-input': <FlaskConical className="w-5 h-5" />,
  'chemistry-analysis': <BarChart3 className="w-5 h-5" />,
  'alloy-recommendation': <Package className="w-5 h-5" />,
  'step-execution': <PlayCircle className="w-5 h-5" />,
  're-sampling': <RefreshCw className="w-5 h-5" />,
  'completion': <CheckCircle2 className="w-5 h-5" />,
};

export function WorkflowSidebar({
  currentStep,
  completedSteps,
  onStepClick,
  isStepAccessible,
  currentStepInfo,
}: WorkflowSidebarProps) {
  return (
    <aside className="w-full lg:w-[280px] xl:w-[320px] bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border">
      {/* Project Header */}
      <div className="p-4 lg:p-6 border-b border-sidebar-border">
        <img className='max-w-48 h-auto' src={logo} alt="MeltAssist Logo" />
      </div>

      {/* Workflow Steps */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs uppercase tracking-wider text-sidebar-muted mb-4 px-2">Workflow Steps</p>
        <ul className="space-y-1">
          {WORKFLOW_STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            const isAccessible = isStepAccessible(step.id);

            return (
              <li key={step.id}>
                <button
                  onClick={() => isAccessible && onStepClick(step.id)}
                  disabled={!isAccessible}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    isCompleted && !isActive && "text-sidebar-primary",
                    !isAccessible && "opacity-40 cursor-not-allowed",
                    isAccessible && !isActive && "hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                    isCompleted && !isActive && "bg-sidebar-primary/20 text-sidebar-primary",
                    !isActive && !isCompleted && "bg-sidebar-border text-sidebar-muted"
                  )}>
                    {isCompleted && !isActive ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isActive && "text-sidebar-foreground",
                      isCompleted && !isActive && "text-sidebar-primary"
                    )}>
                      {step.label}
                    </p>
                  </div>
                  <div className={cn(
                    "flex-shrink-0 transition-opacity",
                    isActive ? "opacity-100" : "opacity-50"
                  )}>
                    {stepIcons[step.id]}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Step Guidance Panel */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-sidebar-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-sidebar-muted mb-1">Current Step</p>
              <p className="text-sm font-semibold text-sidebar-foreground mb-2">
                {currentStepInfo?.label || 'Loading...'}
              </p>
              <p className="text-xs text-sidebar-muted leading-relaxed">
                {currentStepInfo?.instruction || ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
