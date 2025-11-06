import { Progress } from './ui/progress'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'

interface CategoryData {
  objective: string
  framework: string
  checkpoints: string
  debugging: string
  context: string
}

interface DesignSettings {
  theme: { type: string; [key: string]: any }
  animations: { type: string; [key: string]: any }
  transitions: { type: string; [key: string]: any }
  logo: { type: string; [key: string]: any }
}

interface ProgressTrackerProps {
  categoryData: CategoryData
  designSettings?: DesignSettings
  onNavigateToCategory?: (categoryKey: string) => void
}

export default function ProgressTracker({ categoryData, designSettings, onNavigateToCategory }: ProgressTrackerProps) {
  const categories = [
    { key: 'objective' as keyof CategoryData, title: 'Objective', type: 'data' },
    { key: 'framework' as keyof CategoryData, title: 'Framework', type: 'data' },
    { key: 'checkpoints' as keyof CategoryData, title: 'Checkpoints', type: 'data' },
    { key: 'debugging' as keyof CategoryData, title: 'Debugging', type: 'data' },
    { key: 'context' as keyof CategoryData, title: 'Context', type: 'data' },
    { key: 'design', title: 'Design', type: 'design' }
  ]

  const dataCompletedCategories = categories.filter(cat => 
    cat.type === 'data' && categoryData[cat.key as keyof CategoryData].trim() !== ''
  )
  
  const isDesignCompleted = designSettings && (
    designSettings.theme.type !== 'minimalist' || 
    designSettings.animations.type !== 'subtle' || 
    designSettings.transitions.type !== 'fade' || 
    designSettings.logo.type !== 'minimal'
  )
  
  const completedCategories = dataCompletedCategories.length + (isDesignCompleted ? 1 : 0)
  const completionPercentage = (completedCategories / categories.length) * 100

  const handleCategoryClick = (categoryKey: string) => {
    if (onNavigateToCategory) {
      onNavigateToCategory(categoryKey)
    } else {
      // Fallback to scroll behavior if no handler provided
      const element = document.getElementById(`category-${categoryKey}`)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg">Project Progress</h3>
        <span className="text-sm text-muted-foreground">
          {completedCategories.length}/{categories.length} completed
        </span>
      </div>
      
      <Progress value={completionPercentage} className="h-2" />
      
      <div>
        <p className="text-xs text-muted-foreground mb-3">Click on any category to navigate to that section</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {categories.map((category) => {
            let isCompleted = false
            
            if (category.type === 'data') {
              isCompleted = categoryData[category.key as keyof CategoryData].trim() !== ''
            } else if (category.key === 'design') {
              isCompleted = isDesignCompleted || false
            }
            
            return (
              <button
                key={category.key}
                onClick={() => handleCategoryClick(category.key)}
                className={`flex items-center justify-between gap-2 text-sm p-3 rounded-md border transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  isCompleted 
                    ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10' 
                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50 hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="truncate">{category.title}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-50 flex-shrink-0" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}