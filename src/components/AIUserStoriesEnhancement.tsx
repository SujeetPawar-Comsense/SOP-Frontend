import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Wand2, Loader2 } from 'lucide-react'
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
      
      if (result.success && result.data) {
        // Merge enhanced stories back into the full list
        const enhancedStoryIds = new Set(result.data.map((s: UserStory) => s.id))
        const mergedStories = userStories.map(story => {
          if (enhancedStoryIds.has(story.id)) {
            // Find the enhanced version
            const enhanced = result.data.find((s: UserStory) => s.id === story.id)
            return enhanced || story
          }
          return story
        })
        
        // Also add any new stories that were generated
        const existingIds = new Set(userStories.map(s => s.id))
        const newStories = result.data.filter((s: UserStory) => !existingIds.has(s.id))
        const finalStories = [...mergedStories, ...newStories]
        
        toast.success(`Successfully enhanced ${result.data.length} user ${result.data.length !== 1 ? 'stories' : 'story'}!`)
        onEnhanced(finalStories)
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
                    {selectedStories.size} of {userStories.length} selected
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
              
              <ScrollArea className="h-[300px] w-full rounded-md border border-primary/20 p-3">
                <div className="space-y-2">
                  {userStories.map((story) => {
                    const isSelected = selectedStories.has(story.id)
                    const moduleName = story.moduleId ? getModuleName(story.moduleId) : 'No Module'
                    
                    return (
                      <div
                        key={story.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                      >
                        <Checkbox
                          id={story.id}
                          checked={isSelected}
                          onCheckedChange={() => handleStoryToggle(story.id)}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={story.id}
                          className="flex-1 cursor-pointer text-sm space-y-1"
                        >
                          <div className="font-medium">{story.title}</div>
                          <div className="text-xs text-muted-foreground">
                            As a {story.userRole || 'User'}, {story.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {moduleName}
                            </Badge>
                            {story.priority && (
                              <Badge variant="outline" className="text-xs">
                                {story.priority}
                              </Badge>
                            )}
                            {story.status && (
                              <Badge variant="outline" className="text-xs">
                                {story.status}
                              </Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                  {userStories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No user stories available. Please create user stories first.
                    </div>
                  )}
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
