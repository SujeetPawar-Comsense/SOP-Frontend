import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { CheckCircle2, Circle } from 'lucide-react'

interface SectionData {
  projectOverview: string
  featuresModules: string
  techStack: string
  designGuidelines: string
  securityCompliance: string
  environmentSetup: string
  apiDatabase: string
  documentation: string
  notes: string
}

interface DesignSettings {
  theme: { type: string; [key: string]: any }
  animations: { type: string; [key: string]: any }
  transitions: { type: string; [key: string]: any }
  logo: { type: string; [key: string]: any }
}

interface StepProgressBarProps {
  sectionData: SectionData
  designSettings: DesignSettings
  activeStep: string
}

export default function StepProgressBar({ sectionData, designSettings, activeStep }: StepProgressBarProps) {
  const steps = [
    { key: 'projectOverview' as keyof SectionData, label: 'Overview', number: 1 },
    { key: 'featuresModules' as keyof SectionData, label: 'Features', number: 2 },
    { key: 'techStack' as keyof SectionData, label: 'Tech Stack', number: 3 },
    { key: 'designGuidelines' as keyof SectionData, label: 'Design', number: 4 },
    { key: 'securityCompliance' as keyof SectionData, label: 'Security', number: 5 },
    { key: 'environmentSetup' as keyof SectionData, label: 'Environment', number: 6 },
    { key: 'apiDatabase' as keyof SectionData, label: 'API/DB', number: 7 },
    { key: 'documentation' as keyof SectionData, label: 'Docs', number: 8 },
    { key: 'notes' as keyof SectionData, label: 'Notes', number: 9 }
  ]

  const completedSteps = steps.filter(step => 
    sectionData[step.key].trim() !== ''
  )

  const completionPercentage = (completedSteps.length / steps.length) * 100
  const activeStepIndex = steps.findIndex(step => step.key === activeStep)

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            Project Context Progress
          </h3>
          <span className="text-sm text-muted-foreground">
            {completedSteps.length}/{steps.length} sections completed
          </span>
        </div>
        
        <Progress value={completionPercentage} className="h-2" />
        
        {/* Step Indicators */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mt-4">
          {steps.map((step, index) => {
            const isCompleted = sectionData[step.key].trim() !== ''
            const isActive = step.key === activeStep
            
            return (
              <div
                key={step.key}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary/10 border border-primary/30 scale-105' 
                    : 'hover:bg-muted/30'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  isCompleted 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : isActive 
                    ? 'border-primary text-primary animate-pulse' 
                    : 'border-border text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-xs">{step.number}</span>
                  )}
                </div>
                <span className={`text-xs text-center ${
                  isActive || isCompleted ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress Message */}
        <div className="text-center mt-4 p-3 bg-background/50 border border-primary/20 rounded-md">
          <p className="text-sm text-muted-foreground">
            {completionPercentage === 100 
              ? '🎉 All sections complete! Ready to generate your master prompt.' 
              : completionPercentage >= 50 
              ? '⚡ Great progress! Keep going to complete your project context.' 
              : '📝 Fill out each section to build your comprehensive project context.'}
          </p>
        </div>
      </div>
    </Card>
  )
}
