import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Wand2, Loader2, Check, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { toast } from 'sonner'
import { supabase } from '../utils/supabaseClient'
import { ModuleFeature } from './ExcelUtils'
import { modulesAPI, featuresAPI } from '../utils/api'

interface AIGeneralEnhancementProps {
  modules: ModuleFeature[]
  projectId?: string
  onEnhanced: (enhancedModules: ModuleFeature[]) => void
  className?: string
}

export default function AIGeneralEnhancement({
  modules,
  projectId,
  onEnhanced,
  className = ''
}: AIGeneralEnhancementProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [enhancementRequest, setEnhancementRequest] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(true)

  // Initialize selected modules when dialog opens
  useEffect(() => {
    if (showDialog && modules.length > 0) {
      if (selectAll) {
        setSelectedModules(new Set(modules.map(m => m.id)))
      }
    }
  }, [showDialog, modules, selectAll])

  const handleModuleToggle = (moduleId: string) => {
    const newSelected = new Set(selectedModules)
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId)
    } else {
      newSelected.add(moduleId)
    }
    setSelectedModules(newSelected)
    setSelectAll(false)
  }

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedModules(new Set())
      setSelectAll(false)
    } else {
      setSelectedModules(new Set(modules.map(m => m.id)))
      setSelectAll(true)
    }
  }

  const handleEnhance = async () => {
    if (!enhancementRequest.trim()) {
      toast.error('Please enter an enhancement request')
      return
    }

    if (selectedModules.size === 0) {
      toast.error('Please select at least one module to enhance')
      return
    }

    if (!projectId) {
      toast.error('Project ID is required for AI enhancements')
      return
    }

    setIsEnhancing(true)
    try {
      // Filter modules to only include selected ones
      const modulesToEnhance = modules.filter(m => selectedModules.has(m.id))
      
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/brd/enhance-modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          projectId,
          modules: modulesToEnhance,
          enhancementRequest
        })
      })

      if (!response.ok) {
        throw new Error('Failed to enhance modules')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Check if the enhancement request is about business rules
        const isBusinessRulesEnhancement = enhancementRequest.toLowerCase().includes('business rule') || 
                                          enhancementRequest.toLowerCase().includes('business logic')
        
        // Merge enhanced modules back into the full list
        const enhancedModuleIds = new Set(result.data.map((m: any) => m.id))
        const mergedModules = modules.map(module => {
          if (enhancedModuleIds.has(module.id)) {
            // Find the enhanced version
            const enhanced = result.data.find((m: any) => m.id === module.id)
            return enhanced || module
          }
          return module
        })
        
        // Save the enhanced modules to Supabase
        try {
          // Transform modules to backend format (snake_case)
          const modulesForBackend = mergedModules.map(module => {
            const moduleName = (module as any).module_name || module.moduleName || ''
            const businessImpact = (module as any).business_impact || module.businessImpact || ''
            
            return {
              id: module.id,
              module_name: moduleName,
              description: module.description || '',
              priority: module.priority || 'Medium',
              business_impact: businessImpact,
              dependencies: Array.isArray(module.dependencies) 
                ? module.dependencies.join(', ') 
                : (module.dependencies || ''),
              status: module.status || 'Not Started'
            }
          })
          
          await modulesAPI.save(projectId, modulesForBackend)
          
          // If this is a business rules enhancement, also check for features with business rules
          if (isBusinessRulesEnhancement) {
            const allFeatures: any[] = []
            
            // Extract features with business rules from enhanced modules
            for (const enhancedModule of result.data) {
              if (enhancedModule.features && Array.isArray(enhancedModule.features)) {
                for (const feature of enhancedModule.features) {
                  if (feature.business_rules || feature.businessRules) {
                    allFeatures.push({
                      id: feature.id,
                      title: feature.featureName || feature.title || feature.name,
                      description: feature.taskDescription || feature.description || '',
                      module_id: enhancedModule.id,
                      user_story_id: feature.userStoryId || feature.user_story_id || null,
                      priority: feature.priority || 'Medium',
                      status: feature.status || 'Not Started',
                      business_rules: feature.business_rules || feature.businessRules || '',
                      estimated_hours: feature.estimated_hours || feature.estimatedHours || null,
                      assignee: feature.assignee || null
                    })
                  }
                }
              }
              
              // Also check if user stories have features with business rules
              if (enhancedModule.userStories && Array.isArray(enhancedModule.userStories)) {
                for (const userStory of enhancedModule.userStories) {
                  if (userStory.features && Array.isArray(userStory.features)) {
                    for (const feature of userStory.features) {
                      if (feature.business_rules || feature.businessRules) {
                        allFeatures.push({
                          id: feature.id,
                          title: feature.featureName || feature.title || feature.name,
                          description: feature.taskDescription || feature.description || '',
                          module_id: enhancedModule.id,
                          user_story_id: userStory.id,
                          priority: feature.priority || 'Medium',
                          status: feature.status || 'Not Started',
                          business_rules: feature.business_rules || feature.businessRules || '',
                          estimated_hours: feature.estimated_hours || feature.estimatedHours || null,
                          assignee: feature.assignee || null
                        })
                      }
                    }
                  }
                }
              }
            }
            
            // Save features with business rules if any were found
            if (allFeatures.length > 0) {
              try {
                await featuresAPI.save(projectId, allFeatures)
                toast.success(`Enhanced ${result.data.length} module${result.data.length !== 1 ? 's' : ''} and saved ${allFeatures.length} feature${allFeatures.length !== 1 ? 's' : ''} with business rules!`)
              } catch (featuresError) {
                console.error('Failed to save features with business rules:', featuresError)
                toast.success(`Enhanced ${result.data.length} module${result.data.length !== 1 ? 's' : ''}! (Features save failed)`)
              }
            } else {
              toast.success(`Successfully enhanced and saved ${result.data.length} module${result.data.length !== 1 ? 's' : ''}!`)
            }
          } else {
            toast.success(`Successfully enhanced and saved ${result.data.length} module${result.data.length !== 1 ? 's' : ''}!`)
          }
        } catch (saveError) {
          console.error('Failed to save enhanced modules to database:', saveError)
          toast.warning('Modules enhanced but failed to save to database. Please try saving manually.')
        }
        
        // Always call onEnhanced to update the UI
        onEnhanced(mergedModules)
        setShowDialog(false)
        setEnhancementRequest('')
        setSelectedModules(new Set())
      }
    } catch (error: any) {
      console.error('Failed to enhance modules:', error)
      toast.error('Failed to enhance modules. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className={`gap-2 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 ${className}`}
        disabled={!projectId}
      >
        <Wand2 className="h-4 w-4" />
        AI Magic
      </Button>

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open)
        if (open) {
          // Reset to select all when dialog opens
          setSelectAll(true)
          setSelectedModules(new Set(modules.map(m => m.id)))
        }
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              AI Magic - Enhance Modules
            </DialogTitle>
            <DialogDescription>
              Use AI to enhance selected modules. You can add features, improve descriptions, 
              generate business rules, or refine dependencies.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Module Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Modules to Enhance</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedModules.size} of {modules.length} selected
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllToggle}
                    className="h-7 text-xs"
                  >
                    {selectAll ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[200px] w-full rounded-md border border-primary/20 p-3">
                <div className="space-y-2">
                  {modules.map((module) => {
                    const isSelected = selectedModules.has(module.id)
                    return (
                      <div
                        key={module.id}
                        className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                      >
                        <Checkbox
                          id={module.id}
                          checked={isSelected}
                          onCheckedChange={() => handleModuleToggle(module.id)}
                        />
                        <Label
                          htmlFor={module.id}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="font-medium">{module.moduleName}</div>
                          {module.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {module.description}
                            </div>
                          )}
                        </Label>
                        {module.priority && (
                          <Badge variant="outline" className="text-xs">
                            {module.priority}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Enhancement Request */}
            <div className="space-y-2">
              <Label htmlFor="enhancement" className="text-sm font-medium">
                Enhancement Request
              </Label>
              <Textarea
                id="enhancement"
                placeholder="e.g., 'Add authentication features to relevant modules', 'Generate business rules for each module', 'Improve all module descriptions with more technical details'"
                value={enhancementRequest}
                onChange={(e) => setEnhancementRequest(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isEnhancing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnhance}
              disabled={isEnhancing || !enhancementRequest.trim()}
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                'Enhance Modules'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
