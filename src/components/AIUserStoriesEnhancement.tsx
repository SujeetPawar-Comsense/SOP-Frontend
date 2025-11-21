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
import { UserStory } from './UserStoriesEditor'
import { ModuleFeature } from './ExcelUtils'

interface AIUserStoriesEnhancementProps {
  userStories: UserStory[]
  modules: ModuleFeature[]
  projectId?: string
  onEnhanced: (enhancedStories: UserStory[]) => void
  className?: string
}

export default function AIUserStoriesEnhancement({
  userStories,
  modules,
  projectId,
  onEnhanced,
  className = ''
}: AIUserStoriesEnhancementProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [enhancementRequest, setEnhancementRequest] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(true)
  const [open, setOpen] = useState(false)

  // Initialize selected stories when dialog opens
  useEffect(() => {
    if (showDialog && userStories.length > 0) {
      if (selectAll) {
        setSelectedStories(new Set(userStories.map(s => s.id)))
      }
    }
  }, [showDialog, userStories, selectAll])

  const handleStoryToggle = (storyId: string) => {
    const newSelected = new Set(selectedStories)
    if (newSelected.has(storyId)) {
      newSelected.delete(storyId)
    } else {
      newSelected.add(storyId)
    }
    setSelectedStories(newSelected)
    setSelectAll(false)
  }

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedStories(new Set())
      setSelectAll(false)
    } else {
      setSelectedStories(new Set(userStories.map(s => s.id)))
      setSelectAll(true)
    }
  }

  // Helper function to get module name by ID
  const getModuleName = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    return module?.moduleName || 'Unknown Module'
  }

  const handleEnhance = async () => {
    if (!enhancementRequest.trim()) {
      toast.error('Please enter an enhancement request')
      return
    }

    if (selectedStories.size === 0) {
      toast.error('Please select at least one user story to enhance')
      return
    }

    if (!projectId) {
      toast.error('Project ID is required for AI enhancements')
      return
    }

    setIsEnhancing(true)
    try {
      // Filter user stories to only include selected ones
      const storiesToEnhance = userStories.filter(story => 
        selectedStories.has(story.id)
      )
      
      // Get unique module IDs from selected stories
      const moduleIds = new Set(storiesToEnhance.map(s => s.moduleId).filter(Boolean))
      const relevantModules = modules.filter(m => moduleIds.has(m.id))
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/brd/enhance-user-stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          projectId,
          userStories: storiesToEnhance,
          modules: relevantModules,
          enhancementRequest
        })
      })

      if (!response.ok) {
        throw new Error('Failed to enhance user stories')
      }

      const result = await response.json()
      
      if (result.success) {
        // Data has been saved in the backend, show success message with counts
        if (result.saved) {
          const counts: string[] = []
          if (result.saved.userStories > 0) {
            counts.push(`${result.saved.userStories} user ${result.saved.userStories !== 1 ? 'stories' : 'story'}`)
          }
          if (result.saved.features > 0) {
            counts.push(`${result.saved.features} feature${result.saved.features !== 1 ? 's' : ''}`)
          }
          
          if (counts.length > 0) {
            toast.success(`Successfully enhanced and saved ${counts.join(' and ')}!`)
          } else {
            toast.success('Enhancement completed successfully!')
          }
        } else {
          toast.success('User stories enhanced successfully!')
        }
        
        // Process the enhanced data for UI update
        if (result.data && result.data.length > 0) {
          // Normalize the enhanced stories to match frontend format
          const normalizedStories = result.data.map((story: any) => ({
            id: story.id,
            title: story.title,
            userRole: story.userRole || story.user_role || 'User',
            description: story.description || '',
            acceptanceCriteria: story.acceptanceCriteria || story.acceptance_criteria || '',
            moduleId: story.moduleId || story.module_id,
            priority: story.priority || 'Medium',
            status: story.status || 'Not Started',
            // Include features if present for display
            features: story.features
          }))
          
          // Merge enhanced stories back into the full list
          const enhancedStoryIds = new Set(normalizedStories.map((s: UserStory) => s.id))
          const mergedStories = userStories.map(story => {
            if (enhancedStoryIds.has(story.id)) {
              // Find the enhanced version
              const enhanced = normalizedStories.find((s: UserStory) => s.id === story.id)
              return enhanced || story
            }
            return story
          })
          
          // Also add any new stories that were generated
          const existingIds = new Set(userStories.map(s => s.id))
          const newStories = normalizedStories.filter((s: UserStory) => !existingIds.has(s.id))
          const finalStories = [...mergedStories, ...newStories]
          
          // Call onEnhanced to update the parent component
          onEnhanced(finalStories)
        } else {
          // If no data in response, just refresh by calling onEnhanced with existing stories
          // The parent should reload data from the server
          onEnhanced(userStories)
        }
        
        setShowDialog(false)
        setEnhancementRequest('')
        setSelectedStories(new Set())
      }
    } catch (error: any) {
      console.error('Failed to enhance user stories:', error)
      toast.error('Failed to enhance user stories. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className={`bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 ${className}`}
        disabled={!projectId || userStories.length === 0}
      >
        <Wand2 className="w-4 h-4 mr-2" />
        AI Magic
      </Button>

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open)
        if (open) {
          // Reset to select all when dialog opens
          setSelectAll(true)
          setSelectedStories(new Set(userStories.map(s => s.id)))
        }
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              AI Magic - Enhance User Stories
            </DialogTitle>
            <DialogDescription>
              Select specific user stories to enhance with AI. You can improve descriptions, 
              add acceptance criteria, or refine priorities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* User Story Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select User Stories</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedStories.size} selected
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllToggle}
                    className="h-7 text-xs"
                  >
                    {selectAll ? 'Clear All' : 'Select All'}
                  </Button>
                </div>
              </div>
              
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="truncate">
                      {selectedStories.size === 0
                        ? "Select user stories..."
                        : selectedStories.size === 1
                        ? userStories.find(s => selectedStories.has(s.id))?.title
                        : `${selectedStories.size} stories selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search user stories..." />
                    <CommandEmpty>No user story found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {userStories.map((story) => {
                        const isSelected = selectedStories.has(story.id)
                        const moduleName = story.moduleId ? getModuleName(story.moduleId) : 'No Module'
                        
                        return (
                          <CommandItem
                            key={story.id}
                            value={story.title}
                            onSelect={() => handleStoryToggle(story.id)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-start gap-2 flex-1">
                              <Check
                                className={cn(
                                  "h-4 w-4 mt-0.5",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="font-medium text-sm">{story.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {moduleName} • {story.priority || 'Medium'} • {story.status || 'Not Started'}
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Selected Stories Preview */}
              {selectedStories.size > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedStories).slice(0, 5).map(storyId => {
                    const story = userStories.find(s => s.id === storyId)
                    if (!story) return null
                    return (
                      <Badge 
                        key={storyId} 
                        variant="secondary" 
                        className="text-xs flex items-center gap-1"
                      >
                        {story.title}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStoryToggle(storyId)
                          }}
                        />
                      </Badge>
                    )
                  })}
                  {selectedStories.size > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedStories.size - 5} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Enhancement Request */}
            <div className="space-y-2">
              <Label htmlFor="enhancement" className="text-sm font-medium">
                Enhancement Request
              </Label>
              <Textarea
                id="enhancement"
                placeholder="e.g., 'Add detailed acceptance criteria', 'Make descriptions more specific', 'Add edge cases and error scenarios', 'Improve user role definitions'"
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
              disabled={isEnhancing || !enhancementRequest.trim() || selectedStories.size === 0}
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                'Enhance Stories'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
