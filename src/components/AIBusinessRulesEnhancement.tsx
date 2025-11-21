import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Wand2, Loader2, X, Check, ChevronsUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from './ui/utils'
import { toast } from 'sonner'
import { supabase } from '../utils/supabaseClient'

interface Category {
  id: string
  name: string
  subcategories?: Array<{
    id: string
    name: string
    userRule?: string
  }>
  customSubcategories?: Array<{
    id: string
    name: string
    userRule?: string
  }>
}

interface BusinessRulesConfig {
  categories: Category[]
  applyToAllProjects?: boolean
  specificModules?: string[]
}

interface AIBusinessRulesEnhancementProps {
  config: BusinessRulesConfig
  projectId?: string
  onEnhanced: (enhancedConfig: BusinessRulesConfig) => void
  className?: string
}

export default function AIBusinessRulesEnhancement({
  config,
  projectId,
  onEnhanced,
  className = ''
}: AIBusinessRulesEnhancementProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [enhancementRequest, setEnhancementRequest] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(true)
  const [open, setOpen] = useState(false)

  // Debug log
  console.log('AIBusinessRulesEnhancement rendered', { config, projectId, categories: config?.categories })

  // Initialize selected categories when dialog opens
  useEffect(() => {
    if (showDialog && config?.categories && config.categories.length > 0) {
      if (selectAll) {
        setSelectedCategories(new Set(config.categories.map(c => c.id)))
      }
    }
  }, [showDialog, config?.categories, selectAll])

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategories(newSelected)
    setSelectAll(false)
  }

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedCategories(new Set())
      setSelectAll(false)
    } else {
      setSelectedCategories(new Set(config?.categories?.map(c => c.id) || []))
      setSelectAll(true)
    }
  }

  // Count rules per category
  const getCategoryRuleCount = (category: Category) => {
    let count = 0
    if (category.subcategories) {
      count += category.subcategories.filter(s => s.userRule && s.userRule.trim()).length
    }
    if (category.customSubcategories) {
      count += category.customSubcategories.filter(s => s.userRule && s.userRule.trim()).length
    }
    return count
  }

  const handleEnhance = async () => {
    if (!enhancementRequest.trim()) {
      toast.error('Please enter an enhancement request')
      return
    }

    if (selectedCategories.size === 0) {
      toast.error('Please select at least one category to enhance')
      return
    }

    if (!projectId) {
      toast.error('Project ID is required for AI enhancements')
      return
    }

    setIsEnhancing(true)
    try {
      // Filter categories to only include selected ones
      const categoriesToEnhance = (config?.categories || []).filter(c => selectedCategories.has(c.id))
      
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/brd/enhance-business-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          projectId,
          categories: categoriesToEnhance,
          enhancementRequest,
          applyToAllProjects: config.applyToAllProjects,
          specificModules: config.specificModules
        })
      })

      if (!response.ok) {
        throw new Error('Failed to enhance business rules')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Merge enhanced categories back into the full config
        const enhancedCategoryIds = new Set(result.data.categories?.map((c: Category) => c.id) || [])
        const mergedCategories = (config?.categories || []).map(category => {
          if (enhancedCategoryIds.has(category.id)) {
            // Find the enhanced version
            const enhanced = result.data.categories.find((c: Category) => c.id === category.id)
            return enhanced || category
          }
          return category
        })
        
        const enhancedConfig = {
          ...config,
          categories: mergedCategories
        }
        
        toast.success(`Successfully enhanced ${selectedCategories.size} ${selectedCategories.size === 1 ? 'category' : 'categories'}!`)
        onEnhanced(enhancedConfig)
        setShowDialog(false)
        setEnhancementRequest('')
        setSelectedCategories(new Set())
      }
    } catch (error: any) {
      console.error('Failed to enhance business rules:', error)
      toast.error('Failed to enhance business rules. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          console.log('AI Magic clicked', { 
            projectId, 
            config,
            hasCategories: config?.categories?.length > 0 
          })
          
          if (!projectId) {
            console.error('No projectId provided')
            toast.error('Project ID is required for AI enhancements')
            return
          }
          
          if (!config || !config.categories || config.categories.length === 0) {
            console.error('No categories available', config)
            toast.error('No categories available for enhancement')
            return
          }
          
          console.log('Opening dialog...')
          setShowDialog(true)
        }}
        size="sm"
        className={`gap-2 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 ${className}`}
      >
        <Wand2 className="w-4 h-4" />
        AI Magic
      </Button>

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open)
        if (open && config?.categories) {
          // Reset to select all when dialog opens
          setSelectAll(true)
          setSelectedCategories(new Set(config.categories.map(c => c.id)))
        }
      }}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-primary/20">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Wand2 className="h-5 w-5 text-green-500" />
              <span>AI Magic - Enhance Business Rules</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select specific rule categories to enhance with AI. You can generate new rules, improve existing ones, or add industry best practices.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Select Rule Categories</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">
                    {selectedCategories.size} selected
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllToggle}
                    className="h-8 px-3 text-sm hover:bg-primary/10"
                  >
                    {selectAll ? 'Clear All' : 'Select All'}
                  </Button>
                </div>
              </div>
              
              {/* Categories as clickable badges/chips */}
              <div className="flex flex-wrap gap-2 p-4 rounded-lg border border-primary/20 bg-card/50 min-h-[120px]">
                {(config?.categories || []).map((category) => {
                  const isSelected = selectedCategories.has(category.id)
                  const ruleCount = getCategoryRuleCount(category)
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                        "border hover:scale-105",
                        isSelected 
                          ? "bg-primary/20 border-primary/50 text-primary" 
                          : "bg-card border-primary/20 text-foreground hover:border-primary/30"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      <span>{category.name}</span>
                      {isSelected && (
                        <X 
                          className="h-3 w-3 hover:text-destructive" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCategoryToggle(category.id)
                          }}
                        />
                      )}
                    </button>
                  )
                })}
                {config?.categories?.length === 0 && (
                  <div className="w-full text-center text-muted-foreground text-sm py-8">
                    No rule categories available
                  </div>
                )}
              </div>
              
              {selectedCategories.size > 0 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{selectedCategories.size}</span> 
                  {selectedCategories.size === 1 ? ' category' : ' categories'} selected
                  {selectedCategories.size > 0 && (
                    <span className="ml-2">
                      • {Array.from(selectedCategories).slice(0, 3).map(id => 
                        config?.categories?.find(c => c.id === id)?.name
                      ).filter(Boolean).join(', ')}
                      {selectedCategories.size > 3 && ` +${selectedCategories.size - 3} more`}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Enhancement Request */}
            <div className="space-y-2">
              <Label htmlFor="enhancement" className="text-base font-semibold">
                Enhancement Request
              </Label>
              <Textarea
                id="enhancement"
                placeholder="e.g., 'Generate security rules for each category', 'Add GDPR compliance rules', 'Include performance optimization rules', 'Add industry-specific best practices'"
                value={enhancementRequest}
                onChange={(e) => setEnhancementRequest(e.target.value)}
                rows={4}
                className="resize-none bg-background/50 border-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-primary/10">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isEnhancing}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnhance}
              disabled={isEnhancing || !enhancementRequest.trim() || selectedCategories.size === 0}
              className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                'Enhance Rules'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
