import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Badge } from './ui/badge'
import { BusinessRulesConfig, RuleCategory, RuleSubcategory } from './BusinessRulesExcelUtils'
import { ChevronDown, ChevronRight, Plus, X, CheckCircle2, Wand2, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'

interface BusinessRulesEditorProps {
  config: BusinessRulesConfig
  onChange: (config: BusinessRulesConfig) => void
  availableModules?: Array<{ id: string; moduleName: string }>
}

export default function BusinessRulesEditor({ config, onChange, availableModules = [] }: BusinessRulesEditorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [editingSubcategory, setEditingSubcategory] = useState<{ categoryId: string; subcategoryId: string } | null>(null)
  const [addingCustomSubcategory, setAddingCustomSubcategory] = useState<string | null>(null)
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [newSubcategoryExample, setNewSubcategoryExample] = useState('')
  
  // AI Magic state
  const [showAIMagicDialog, setShowAIMagicDialog] = useState(false)
  const [aiMagicStage, setAIMagicStage] = useState(0)

  // Auto-expand categories that have defined rules
  useEffect(() => {
    if (config.categories && config.categories.length > 0) {
      const categoriesWithRules = config.categories
        .filter(category => {
          const hasDefinedRules = (category.subcategories || []).some(
            sub => sub.userRule && sub.userRule.trim() !== ''
          )
          const hasCustomRules = (category.customSubcategories || []).some(
            sub => sub.userRule && sub.userRule.trim() !== ''
          )
          return hasDefinedRules || hasCustomRules
        })
        .map(category => category.id)
      
      if (categoriesWithRules.length > 0) {
        setExpandedCategories(new Set(categoriesWithRules))
      }
    }
  }, [config.categories])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleSubcategoryRuleChange = (categoryId: string, subcategoryId: string, rule: string) => {
    const updatedCategories = config.categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: (category.subcategories || []).map(sub =>
            sub.id === subcategoryId ? { ...sub, userRule: rule } : sub
          ),
        }
      }
      return category
    })

    onChange({
      ...config,
      categories: updatedCategories,
    })
  }

  const handleCustomSubcategoryRuleChange = (categoryId: string, subcategoryId: string, rule: string) => {
    const updatedCategories = config.categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          customSubcategories: (category.customSubcategories || []).map(sub =>
            sub.id === subcategoryId ? { ...sub, userRule: rule } : sub
          ),
        }
      }
      return category
    })

    onChange({
      ...config,
      categories: updatedCategories,
    })
  }

  const handleAddCustomSubcategory = (categoryId: string) => {
    if (!newSubcategoryName.trim()) {
      toast.error('Please enter a subcategory name')
      return
    }

    const updatedCategories = config.categories.map(category => {
      if (category.id === categoryId) {
        const newSubcategory: RuleSubcategory = {
          id: `custom-${Date.now()}-${Math.random()}`,
          name: newSubcategoryName,
          example: newSubcategoryExample || 'Custom rule type',
          userRule: '',
          isCustom: true,
        }

        return {
          ...category,
          customSubcategories: [...(category.customSubcategories || []), newSubcategory],
        }
      }
      return category
    })

    onChange({
      ...config,
      categories: updatedCategories,
    })

    setNewSubcategoryName('')
    setNewSubcategoryExample('')
    setAddingCustomSubcategory(null)
    toast.success('Custom subcategory added')
  }

  const handleDeleteCustomSubcategory = (categoryId: string, subcategoryId: string) => {
    const updatedCategories = config.categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          customSubcategories: (category.customSubcategories || []).filter(sub => sub.id !== subcategoryId),
        }
      }
      return category
    })

    onChange({
      ...config,
      categories: updatedCategories,
    })

    toast.success('Custom subcategory removed')
  }

  const getRuleCounts = (category: RuleCategory) => {
    const defaultCount = (category.subcategories || []).filter(sub => sub.userRule && sub.userRule.trim() !== '').length
    const customCount = (category.customSubcategories || []).filter(sub => sub.userRule && sub.userRule.trim() !== '').length
    return { default: defaultCount, custom: customCount, total: defaultCount + customCount }
  }

  const getTotalRuleCount = () => {
    if (!config.categories || !Array.isArray(config.categories)) {
      return 0
    }
    return config.categories.reduce((total, category) => {
      const counts = getRuleCounts(category)
      return total + counts.total
    }, 0)
  }

  const handleModuleSelectionChange = (moduleId: string) => {
    const newModules = config.specificModules.includes(moduleId)
      ? config.specificModules.filter(id => id !== moduleId)
      : [...config.specificModules, moduleId]

    onChange({
      ...config,
      specificModules: newModules,
    })
  }

  // AI Magic stage progression
  useEffect(() => {
    if (!showAIMagicDialog) return

    const stages = [
      { duration: 1500, nextStage: 1 },
      { duration: 2000, nextStage: 2 },
      { duration: 1500, nextStage: 3 },
    ]

    if (aiMagicStage < stages.length) {
      const timer = setTimeout(() => {
        setAIMagicStage(aiMagicStage + 1)
      }, stages[aiMagicStage].duration)

      return () => clearTimeout(timer)
    } else if (aiMagicStage === 3) {
      // Close dialog after completing all stages
      setTimeout(() => {
        setShowAIMagicDialog(false)
        setAIMagicStage(0)
        toast.success('AI suggestions applied successfully!')
      }, 500)
    }
  }, [showAIMagicDialog, aiMagicStage])

  // Handle AI Magic button click
  const handleAIMagic = () => {
    setShowAIMagicDialog(true)
    setAIMagicStage(0)
  }

  return (
    <div className="space-y-6">
      {/* Application Scope */}
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <span>Application Scope</span>
                <Badge variant="outline" className="border-primary/50">
                  {getTotalRuleCount()} rules defined
                </Badge>
              </CardTitle>
              <CardDescription>Configure where these business rules should apply</CardDescription>
            </div>
            <Button
              onClick={handleAIMagic}
              size="sm"
              className="gap-2 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              <Wand2 className="w-4 h-4" />
              AI Magic
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="apply-all" className="cursor-pointer">
              Apply to All Projects
            </Label>
            <Switch
              id="apply-all"
              checked={config.applyToAllProjects}
              onCheckedChange={(checked) => onChange({ ...config, applyToAllProjects: checked })}
            />
          </div>

          {!config.applyToAllProjects && availableModules.length > 0 && (
            <div className="space-y-2">
              <Label>Specific Modules</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableModules.map(module => (
                  <div
                    key={module.id}
                    onClick={() => handleModuleSelectionChange(module.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      config.specificModules.includes(module.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    <div key={`inner-${module.id}`} className="flex items-center gap-2">
                      {config.specificModules.includes(module.id) && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-sm">{module.moduleName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Rules Categories */}
      <div className="space-y-3">
        {config.categories && config.categories.length > 0 ? (
          config.categories.map(category => {
          const counts = getRuleCounts(category)
          const isExpanded = expandedCategories.has(category.id)

          return (
            <Card key={category.id} className="border-primary/20 bg-card/50">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-primary/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {(category.subcategories?.length || 0)} rule types
                            {(category.customSubcategories?.length || 0) > 0 && (
                              <span className="text-primary"> + {category.customSubcategories?.length} custom</span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {counts.total > 0 && (
                          <Badge variant="outline" className="border-primary/50 bg-primary/10">
                            {counts.total} defined
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2 hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setAddingCustomSubcategory(category.id)
                            setExpandedCategories(new Set(expandedCategories).add(category.id))
                          }}
                        >
                          <Plus className="w-4 h-4" />
                          Add Custom
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    {/* Default Subcategories */}
                    {(category.subcategories || []).map(subcategory => (
                      <div
                        key={subcategory.id}
                        className="p-4 rounded-lg border border-primary/20 bg-background/50 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{subcategory.name}</h4>
                              {subcategory.userRule && subcategory.userRule.trim() !== '' && (
                                <Badge variant="outline" className="border-primary/50 bg-primary/10">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Defined
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{subcategory.example}</p>
                            
                            {/* Display applicable modules if available */}
                            {(subcategory as any).applicableTo && Array.isArray((subcategory as any).applicableTo) && (subcategory as any).applicableTo.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-semibold text-cyan-400 mb-1">Applicable To:</p>
                                <div className="flex flex-wrap gap-1">
                                  {(subcategory as any).applicableTo.map((module: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
                                      {module}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {editingSubcategory?.categoryId === category.id &&
                            editingSubcategory?.subcategoryId === subcategory.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={subcategory.userRule || ''}
                                  onChange={(e) =>
                                    handleSubcategoryRuleChange(category.id, subcategory.id, e.target.value)
                                  }
                                  placeholder={subcategory.example}
                                  rows={4}
                                  className="bg-input-background border-primary/30"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => setEditingSubcategory(null)}
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingSubcategory(null)}
                                    className="border-primary/30"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {subcategory.userRule && subcategory.userRule.trim() !== '' ? (
                                  <div className="p-3 bg-primary/5 rounded border border-primary/20 text-sm">
                                    {subcategory.userRule}
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-1 border-primary/30"
                                    onClick={() =>
                                      setEditingSubcategory({
                                        categoryId: category.id,
                                        subcategoryId: subcategory.id,
                                      })
                                    }
                                  >
                                    Define Business Rule
                                  </Button>
                                )}
                                {subcategory.userRule && subcategory.userRule.trim() !== '' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="mt-2 text-primary hover:text-primary/80"
                                    onClick={() =>
                                      setEditingSubcategory({
                                        categoryId: category.id,
                                        subcategoryId: subcategory.id,
                                      })
                                    }
                                  >
                                    Edit Rule
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Custom Subcategories */}
                    {(category.customSubcategories || []).map(subcategory => (
                      <div
                        key={subcategory.id}
                        className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{subcategory.name}</h4>
                              <Badge className="bg-primary/20 text-primary border-primary/50">Custom</Badge>
                              {subcategory.userRule && subcategory.userRule.trim() !== '' && (
                                <Badge variant="outline" className="border-primary/50 bg-primary/10">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Defined
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{subcategory.example}</p>
                            
                            {/* Display applicable modules if available */}
                            {(subcategory as any).applicableTo && Array.isArray((subcategory as any).applicableTo) && (subcategory as any).applicableTo.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-semibold text-cyan-400 mb-1">Applicable To:</p>
                                <div className="flex flex-wrap gap-1">
                                  {(subcategory as any).applicableTo.map((module: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
                                      {module}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {editingSubcategory?.categoryId === category.id &&
                            editingSubcategory?.subcategoryId === subcategory.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={subcategory.userRule || ''}
                                  onChange={(e) =>
                                    handleCustomSubcategoryRuleChange(category.id, subcategory.id, e.target.value)
                                  }
                                  placeholder={subcategory.example}
                                  rows={4}
                                  className="bg-input-background border-primary/30"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => setEditingSubcategory(null)}
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingSubcategory(null)}
                                    className="border-primary/30"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {subcategory.userRule && subcategory.userRule.trim() !== '' ? (
                                  <div className="p-3 bg-primary/5 rounded border border-primary/20 text-sm">
                                    {subcategory.userRule}
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-1 border-primary/30"
                                    onClick={() =>
                                      setEditingSubcategory({
                                        categoryId: category.id,
                                        subcategoryId: subcategory.id,
                                      })
                                    }
                                  >
                                    Define Business Rule
                                  </Button>
                                )}
                                {subcategory.userRule && subcategory.userRule.trim() !== '' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="mt-2 text-primary hover:text-primary/80"
                                    onClick={() =>
                                      setEditingSubcategory({
                                        categoryId: category.id,
                                        subcategoryId: subcategory.id,
                                      })
                                    }
                                  >
                                    Edit Rule
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCustomSubcategory(category.id, subcategory.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Add Custom Subcategory Form */}
                    {addingCustomSubcategory === category.id && (
                      <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 space-y-3">
                        <h4 className="font-medium">Add Custom Rule Type</h4>
                        <div className="space-y-2">
                          <Label>Subcategory Name</Label>
                          <Input
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                            placeholder="e.g., Custom Validation Rule"
                            className="bg-input-background border-primary/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Example / Description</Label>
                          <Input
                            value={newSubcategoryExample}
                            onChange={(e) => setNewSubcategoryExample(e.target.value)}
                            placeholder="e.g., Validate specific business constraints"
                            className="bg-input-background border-primary/30"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddCustomSubcategory(category.id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Subcategory
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAddingCustomSubcategory(null)
                              setNewSubcategoryName('')
                              setNewSubcategoryExample('')
                            }}
                            className="border-primary/30"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })
        ) : (
          <Card className="border-primary/20 bg-card/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-2">No business rules found</p>
              <p className="text-sm text-muted-foreground">
                Business rules will appear here after they are generated from your BRD or added manually.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
