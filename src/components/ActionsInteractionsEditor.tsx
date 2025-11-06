import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { ActionsInteractionsConfig, InteractionCategory } from './ActionsInteractionsExcelUtils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ScrollArea } from './ui/scroll-area'

interface ActionsInteractionsEditorProps {
  config: ActionsInteractionsConfig
  onChange: (config: ActionsInteractionsConfig) => void
  availableModules?: Array<{ id: string; moduleName: string }>
}

export default function ActionsInteractionsEditor({
  config,
  onChange,
  availableModules = []
}: ActionsInteractionsEditorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'click-tap': true
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const handleActionToggle = (categoryId: string, actionName: string) => {
    const currentActions = config.selectedActions[categoryId] || []
    const newActions = currentActions.includes(actionName)
      ? currentActions.filter(a => a !== actionName)
      : [...currentActions, actionName]

    onChange({
      ...config,
      selectedActions: {
        ...config.selectedActions,
        [categoryId]: newActions
      }
    })
  }

  const handleCategorySelectAll = (category: InteractionCategory) => {
    const currentActions = config.selectedActions[category.id] || []
    // Convert all actions to strings (handle both string and object formats)
    const actionNames = category.actions.map(action => 
      typeof action === 'string' ? action : (action as any).name || ''
    ).filter(Boolean)
    
    const allSelected = currentActions.length === actionNames.length

    onChange({
      ...config,
      selectedActions: {
        ...config.selectedActions,
        [category.id]: allSelected ? [] : actionNames
      }
    })
  }

  const handleApplyToAllToggle = (checked: boolean) => {
    onChange({
      ...config,
      applyToAllProjects: checked,
      specificModules: checked ? [] : config.specificModules
    })
  }

  const handleModuleToggle = (moduleId: string) => {
    const newModules = config.specificModules.includes(moduleId)
      ? config.specificModules.filter(id => id !== moduleId)
      : [...config.specificModules, moduleId]

    onChange({
      ...config,
      specificModules: newModules
    })
  }

  const getTotalSelectedCount = () => {
    return Object.values(config.selectedActions).reduce(
      (sum, actions) => sum + actions.length,
      0
    )
  }

  const getCategorySelectedCount = (categoryId: string) => {
    const selectedActions = config.selectedActions[categoryId] || []
    // Ensure we're counting valid action names only
    return selectedActions.filter(action => typeof action === 'string' && action.trim()).length
  }

  const expandAll = () => {
    const expanded: Record<string, boolean> = {}
    config.categories.forEach(cat => {
      expanded[cat.id] = true
    })
    setExpandedCategories(expanded)
  }

  const collapseAll = () => {
    setExpandedCategories({})
  }

  return (
    <div className="space-y-6">
      {/* Summary and Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm">
                <span className="text-primary">{getTotalSelectedCount()}</span> interactions selected
              </p>
              <p className="text-xs text-muted-foreground">
                across {config.categories.length} categories
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={expandAll}
            size="sm"
            variant="outline"
            className="border-primary/30"
          >
            Expand All
          </Button>
          <Button
            onClick={collapseAll}
            size="sm"
            variant="outline"
            className="border-primary/30"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Apply To Settings */}
      <Card className="border-primary/20 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Application Scope</CardTitle>
          <CardDescription>
            Choose whether to apply these interactions to all projects or specific modules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-primary/20 rounded-lg bg-background/30">
            <div className="flex items-center gap-3">
              <Switch
                id="apply-all"
                checked={config.applyToAllProjects}
                onCheckedChange={handleApplyToAllToggle}
              />
              <Label htmlFor="apply-all" className="cursor-pointer">
                Apply to All Projects
              </Label>
            </div>
            {config.applyToAllProjects && (
              <Badge variant="outline" className="border-primary/50 text-primary">
                Global
              </Badge>
            )}
          </div>

          {!config.applyToAllProjects && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <Label>Select Specific Modules</Label>
              {availableModules.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border border-dashed border-primary/20 rounded-lg text-center">
                  No modules available. Add modules in the "Modules & Features" section first.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableModules.map(module => (
                    <div
                      key={module.id}
                      className="flex items-center gap-2 p-3 border border-primary/20 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                    >
                      <Checkbox
                        id={`module-${module.id}`}
                        checked={config.specificModules.includes(module.id)}
                        onCheckedChange={() => handleModuleToggle(module.id)}
                      />
                      <Label
                        htmlFor={`module-${module.id}`}
                        className="cursor-pointer flex-1"
                      >
                        {module.moduleName}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {config.specificModules.length > 0 && (
                <div className="text-sm text-primary">
                  {config.specificModules.length} module(s) selected
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interaction Categories */}
      <div className="space-y-3">
        <h3 className="text-lg bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
          Interaction Categories
        </h3>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {config.categories.map((category, idx) => {
              // Normalize actions to strings for counting
              const normalizedActions = category.actions.map(action =>
                typeof action === 'string' ? action : (action as any).name || ''
              ).filter(Boolean)
              
              const selectedCount = getCategorySelectedCount(category.id)
              const allSelected = selectedCount === normalizedActions.length
              const someSelected = selectedCount > 0 && selectedCount < normalizedActions.length
              const isExpanded = expandedCategories[category.id]

              return (
                <Card
                  key={`category-${category.id}-${idx}`}
                  className="border-primary/20 bg-card/50 overflow-hidden"
                >
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-background/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-primary/50 text-primary w-8 h-8 rounded-full flex items-center justify-center p-0"
                            >
                              {idx + 1}
                            </Badge>
                            <div className="text-left">
                              <h4 className="font-medium">{category.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {normalizedActions.length} actions available
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedCount > 0 && (
                            <Badge variant="outline" className="border-primary/50 text-primary">
                              {selectedCount} / {normalizedActions.length}
                            </Badge>
                          )}
                          {allSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : someSelected ? (
                            <Circle className="w-5 h-5 text-primary fill-primary/30" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t border-primary/10 p-4 space-y-3 bg-background/20">
                        <div className="flex items-center justify-between pb-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCategorySelectAll(category)
                            }}
                            size="sm"
                            variant="outline"
                            className="border-primary/30 text-xs"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {category.actions.map((action, actionIdx) => {
                            // Handle both string actions and object actions (for backward compatibility)
                            const actionName = typeof action === 'string' ? action : (action as any).name || ''
                            const actionKey = `${category.id}-${actionIdx}-${actionName}`
                            const isSelected = config.selectedActions[category.id]?.includes(actionName)
                            
                            if (!actionName) {
                              console.warn('Invalid action in category:', category.id, action)
                              return null
                            }
                            
                            return (
                              <div
                                key={actionKey}
                                className={`flex items-center gap-2 p-3 border rounded-lg transition-all ${
                                  isSelected
                                    ? 'border-primary/50 bg-primary/5'
                                    : 'border-primary/20 bg-background/30 hover:bg-background/50'
                                }`}
                              >
                                <Checkbox
                                  id={actionKey}
                                  checked={isSelected}
                                  onCheckedChange={() => handleActionToggle(category.id, actionName)}
                                />
                                <Label
                                  htmlFor={actionKey}
                                  className="cursor-pointer flex-1 text-sm"
                                >
                                  {actionName}
                                </Label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
