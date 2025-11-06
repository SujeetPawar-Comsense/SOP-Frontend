import { Check, Palette, Zap, ArrowRightLeft, ImageIcon } from 'lucide-react'
import { Badge } from './ui/badge'
import { DesignSettings } from './DesignCustomizer'

interface DesignStepProgressBarProps {
  designSettings: DesignSettings
  activeStep: number
  onStepClick: (step: number) => void
}

const designSteps = [
  {
    id: 1,
    key: 'theme',
    title: 'Theme',
    description: 'Colors & Typography',
    icon: Palette
  },
  {
    id: 2,
    key: 'animations',
    title: 'Animations',
    description: 'Interactive Effects',
    icon: Zap
  },
  {
    id: 3,
    key: 'transitions',
    title: 'Transitions',
    description: 'Page Transitions',
    icon: ArrowRightLeft
  },
  {
    id: 4,
    key: 'logo',
    title: 'Logo',
    description: 'Branding & Identity',
    icon: ImageIcon
  }
]

export default function DesignStepProgressBar({ 
  designSettings, 
  activeStep, 
  onStepClick 
}: DesignStepProgressBarProps) {
  const getStepStatus = (stepKey: string) => {
    switch (stepKey) {
      case 'theme':
        return designSettings.theme.type !== 'minimalist' || 
               (designSettings.theme.type === 'custom' && 
                (designSettings.theme.primaryColor || designSettings.theme.secondaryColor))
      case 'animations':
        return designSettings.animations.type !== 'subtle' ||
               (designSettings.animations.type === 'custom' && 
                (designSettings.animations.interactionType || designSettings.animations.speed))
      case 'transitions':
        return designSettings.transitions.type !== 'fade' ||
               (designSettings.transitions.type === 'custom' && 
                (designSettings.transitions.direction || designSettings.transitions.duration))
      case 'logo':
        return designSettings.logo.type !== 'minimal' ||
               (designSettings.logo.type === 'custom' && 
                (designSettings.logo.appPurpose || designSettings.logo.colors))
      default:
        return false
    }
  }

  const completedSteps = designSteps.filter(step => getStepStatus(step.key)).length
  const progressPercentage = (completedSteps / designSteps.length) * 100

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-xl p-6 space-y-6 neon-glow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            Design Configuration Progress
          </h2>
          <p className="text-sm text-muted-foreground">
            Customize your application's visual design and user experience
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Step {activeStep + 1} of {designSteps.length}
          </div>
          <div className="text-sm text-primary">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        {/* Background connector lines */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -translate-y-1/2" />
        
        {/* Active connector lines */}
        {designSteps.map((_, index) => (
          index < completedSteps && (
            <div 
              key={`connector-${index}`}
              className="absolute top-5 bg-primary h-0.5 -translate-y-1/2 transition-all duration-300"
              style={{
                left: `calc(${(index / (designSteps.length - 1)) * 100}% + 1.25rem)`,
                width: `calc(${100 / (designSteps.length - 1)}% - 2.5rem)`
              }}
            />
          )
        ))}
        
        {/* Step Items */}
        <div className="relative flex justify-between">
          {designSteps.map((step, index) => {
            const isCompleted = getStepStatus(step.key)
            const isActive = activeStep === index
            const IconComponent = step.icon
            
            return (
              <div key={step.id} className="flex flex-col items-center relative">
                <button
                  onClick={() => onStepClick(index)}
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary border-primary text-primary-foreground neon-glow' 
                      : isCompleted
                      ? 'bg-primary border-primary text-primary-foreground neon-glow'
                      : 'bg-card border-primary/30 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </button>
                
                <div className="mt-3 text-center max-w-20">
                  <div className={`text-xs transition-colors ${
                    isActive || isCompleted 
                      ? 'text-foreground' 
                      : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Configuration Progress</span>
          <span className="text-sm text-muted-foreground">{completedSteps}/{designSteps.length} settings configured</span>
        </div>
        <div className="w-full bg-card border border-primary/20 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary to-cyan-400 h-full rounded-full transition-all duration-300 ease-out neon-glow"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export { designSteps }