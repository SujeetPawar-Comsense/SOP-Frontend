import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { ChevronDown, ChevronUp, CheckSquare, Square, Play } from 'lucide-react'
import { AnimationEffectsConfig, AnimationCategory } from './AnimationEffectsExcelUtils'

interface AnimationEffectsEditorProps {
  config: AnimationEffectsConfig
  onChange: (config: AnimationEffectsConfig) => void
  availableModules: { id: string; moduleName: string }[]
}

export default function AnimationEffectsEditor({
  config,
  onChange,
  availableModules
}: AnimationEffectsEditorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    visibility: true
  })
  const [previewingCategory, setPreviewingCategory] = useState<string | null>(null)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId]
    })
  }

  // Map effect names to animation classes
  const getAnimationClass = (effectName: string): string => {
    const effectMap: Record<string, string> = {
      'Fade In': 'animate-preview-fade-in',
      'Fade Out': 'animate-preview-fade-out',
      'Slide Up': 'animate-preview-slide-up',
      'Slide Down': 'animate-preview-slide-down',
      'Slide Left': 'animate-preview-slide-left',
      'Slide Right': 'animate-preview-slide-right',
      'Scale Up': 'animate-preview-scale-up',
      'Scale Down': 'animate-preview-scale-down',
      'Zoom In': 'animate-preview-zoom-in',
      'Rotate In': 'animate-preview-rotate-in',
      'Flip In': 'animate-preview-flip-in',
      'Bounce': 'animate-preview-bounce',
      'Shake': 'animate-preview-shake',
      'Pulse': 'animate-preview-pulse',
      'Glow': 'animate-preview-glow',
      'Blur In': 'animate-preview-blur-in'
    }
    return effectMap[effectName] || 'animate-preview-fade-in'
  }

  const handleEffectClick = (categoryId: string, effectName: string) => {
    // Show preview animation for all effects in category
    setPreviewingCategory(categoryId)
    
    // Reset after animation completes
    setTimeout(() => {
      setPreviewingCategory(null)
    }, 1000)

    // Toggle selection
    toggleEffect(categoryId, effectName)
  }

  const handlePreviewOnly = (categoryId: string, effectName: string) => {
    // Show preview animation for all effects in category, without toggling selection
    setPreviewingCategory(categoryId)
    
    // Reset after animation completes
    setTimeout(() => {
      setPreviewingCategory(null)
    }, 1000)
  }

  const toggleEffect = (categoryId: string, effectName: string) => {
    const currentSelected = config.selectedEffects[categoryId] || []
    const newSelected = currentSelected.includes(effectName)
      ? currentSelected.filter(e => e !== effectName)
      : [...currentSelected, effectName]
    
    onChange({
      ...config,
      selectedEffects: {
        ...config.selectedEffects,
        [categoryId]: newSelected
      }
    })
  }

  const toggleAllInCategory = (categoryId: string) => {
    const category = config.categories.find(c => c.id === categoryId)
    if (!category) return

    const currentSelected = config.selectedEffects[categoryId] || []
    const allEffectNames = category.effects.map(e => e.name)
    
    // If all are selected, deselect all; otherwise select all
    const allSelected = allEffectNames.every(name => currentSelected.includes(name))
    
    onChange({
      ...config,
      selectedEffects: {
        ...config.selectedEffects,
        [categoryId]: allSelected ? [] : allEffectNames
      }
    })
  }

  const toggleAllEffects = () => {
    const allSelected = config.categories.every(category => {
      const currentSelected = config.selectedEffects[category.id] || []
      const allEffectNames = category.effects.map(e => e.name)
      return allEffectNames.every(name => currentSelected.includes(name))
    })

    if (allSelected) {
      // Deselect all
      onChange({
        ...config,
        selectedEffects: {}
      })
    } else {
      // Select all
      const newSelectedEffects: Record<string, string[]> = {}
      config.categories.forEach(category => {
        newSelectedEffects[category.id] = category.effects.map(e => e.name)
      })
      onChange({
        ...config,
        selectedEffects: newSelectedEffects
      })
    }
  }

  const toggleModule = (moduleId: string) => {
    const newModules = config.specificModules.includes(moduleId)
      ? config.specificModules.filter(id => id !== moduleId)
      : [...config.specificModules, moduleId]
    
    onChange({
      ...config,
      specificModules: newModules
    })
  }

  const getTotalSelectedCount = () => {
    return Object.values(config.selectedEffects).reduce((sum, effects) => sum + effects.length, 0)
  }

  const getTotalEffectsCount = () => {
    return config.categories.reduce((sum, category) => sum + category.effects.length, 0)
  }

  const getCategorySelectedCount = (categoryId: string) => {
    return (config.selectedEffects[categoryId] || []).length
  }

  return (
    <div className="space-y-6">
      {/* Application Scope */}
      <Card className="border-primary/20 bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">UX Interaction & Behavior</CardTitle>
          <CardDescription>
            Choose where these animation effects should be applied
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-primary/10">
            <div className="space-y-0.5">
              <Label htmlFor="apply-all" className="cursor-pointer">
                Apply to All Projects
              </Label>
              <p className="text-sm text-muted-foreground">
                Use these animation effects across the entire application
              </p>
            </div>
            <Switch
              id="apply-all"
              checked={config.applyToAllProjects}
              onCheckedChange={(checked) => onChange({ ...config, applyToAllProjects: checked })}
            />
          </div>

          {!config.applyToAllProjects && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label>Select Specific Modules</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableModules.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No modules available. Please add modules in the Modules/Features section first.
                  </p>
                ) : (
                  availableModules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30 border border-primary/10 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleModule(module.id)}
                    >
                      <Checkbox
                        id={`module-${module.id}`}
                        checked={config.specificModules.includes(module.id)}
                        onCheckedChange={() => toggleModule(module.id)}
                      />
                      <Label
                        htmlFor={`module-${module.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {module.moduleName}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Selection Controls */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-medium">Animation Effects Library</h3>
            <p className="text-sm text-muted-foreground">
              {getTotalSelectedCount()} of {getTotalEffectsCount()} effects selected across {config.categories.length} categories
            </p>
          </div>
        </div>
        <Button
          onClick={toggleAllEffects}
          variant="outline"
          size="sm"
          className="gap-2 border-primary/50 hover:bg-primary/10"
        >
          {getTotalSelectedCount() === getTotalEffectsCount() ? (
            <>
              <Square className="w-4 h-4" />
              Deselect All
            </>
          ) : (
            <>
              <CheckSquare className="w-4 h-4" />
              Select All
            </>
          )}
        </Button>
      </div>

      {/* Animation Categories */}
      <div className="space-y-4">
        {config.categories.map((category) => {
          const isExpanded = expandedCategories[category.id]
          const selectedCount = getCategorySelectedCount(category.id)
          const totalCount = category.effects.length
          const allSelected = selectedCount === totalCount && totalCount > 0

          return (
            <Card
              key={category.id}
              className="border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              <CardHeader className="cursor-pointer" onClick={() => toggleCategory(category.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCategory(category.id)
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedCount} of {totalCount} effects selected
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                        {selectedCount} selected
                      </Badge>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleAllInCategory(category.id)
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-primary/50 hover:bg-primary/10"
                    >
                      {allSelected ? (
                        <>
                          <Square className="w-4 h-4" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4" />
                          Select All
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 gap-3">
                    {category.effects.map((effect) => {
                      const isSelected = (config.selectedEffects[category.id] || []).includes(effect.name)

                      return (
                        <div
                          key={effect.name}
                          className={`flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary/5 border-primary/30 hover:bg-primary/10'
                              : 'bg-muted/20 border-primary/10 hover:bg-muted/30'
                          } ${
                            previewingCategory === category.id 
                              ? getAnimationClass(effect.name) 
                              : ''
                          }`}
                          onClick={() => handleEffectClick(category.id, effect.name)}
                        >
                          <Checkbox
                            id={`${category.id}-${effect.name}`}
                            checked={isSelected}
                            onCheckedChange={() => handleEffectClick(category.id, effect.name)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <Label
                              htmlFor={`${category.id}-${effect.name}`}
                              className="font-medium cursor-pointer leading-tight"
                            >
                              {effect.name}
                            </Label>
                            <p className="text-sm text-muted-foreground leading-snug">
                              {effect.description}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-primary/30 hover:bg-primary/10 hover:text-primary h-8 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewOnly(category.id, effect.name)
                            }}
                          >
                            <Play className="w-3.5 h-3.5" />
                            Preview
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      {getTotalSelectedCount() > 0 && (
        <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Selection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Effects</p>
                <p className="text-2xl font-medium text-primary">{getTotalSelectedCount()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Categories Used</p>
                <p className="text-2xl font-medium text-primary">
                  {Object.keys(config.selectedEffects).filter(key => config.selectedEffects[key].length > 0).length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Application Scope</p>
                <p className="text-lg font-medium">
                  {config.applyToAllProjects ? 'All Projects' : `${config.specificModules.length} Modules`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
