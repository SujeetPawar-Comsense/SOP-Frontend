import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  Wand2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Check,
  RotateCcw,
  Save,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Copy,
  FileText,
  Zap
} from 'lucide-react'
import { Checkbox } from './ui/checkbox'
import { UserStory } from './UserStoriesEditor'
import { ModuleFeature } from './ExcelUtils'
import { FeatureTask } from './FeaturesTasksEditor'
import AIGeneralEnhancement from './AIGeneralEnhancement'
import AIUserStoriesEnhancement from './AIUserStoriesEnhancement'
import { featuresAPI } from '../utils/api'

interface UserStoriesTableProps {
  userStories: UserStory[]
  modules: ModuleFeature[]
  features: FeatureTask[]
  projectId?: string
  onChange: (userStories: UserStory[]) => void
  onFeaturesChange?: (features: FeatureTask[]) => void
}

export default function UserStoriesTable({
  userStories,
  modules,
  features,
  projectId,
  onChange,
  onFeaturesChange
}: UserStoriesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('All Priorities')
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<UserStory | null>(null)
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingStory, setEditingStory] = useState<UserStory | null>(null)
  const featuresCardRef = useRef<HTMLDivElement>(null)
  
  // Feature management state
  const [customFeatureName, setCustomFeatureName] = useState('')
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set())
  const [customFeatures, setCustomFeatures] = useState<string[]>([])

  // Helper function to get normalized userRole
  const getUserRole = (story: UserStory | any): string => {
    return story.userRole || story.user_role || ''
  }

  // Helper function to get normalized acceptanceCriteria
  const getAcceptanceCriteria = (story: UserStory | any): string => {
    const criteria = story.acceptanceCriteria || story.acceptance_criteria || ''
    if (Array.isArray(criteria)) {
      return criteria.join('\n')
    }
    return criteria || ''
  }

  // Helper function to get module name
  const getModuleName = (moduleId: string | undefined): string => {
    if (!moduleId) return 'No Module'
    
    // Try to find module by id, handling both exact match and string conversion
    const module = modules.find(m => {
      const mId = String(m.id || '')
      const searchId = String(moduleId || '')
      return mId === searchId || mId.toLowerCase() === searchId.toLowerCase()
    })
    
    if (!module) {
      return 'Unknown Module'
    }
    
    // Handle both moduleName (camelCase) and module_name (snake_case) fields
    // Modules from backend use module_name, frontend uses moduleName
    return (module as any).moduleName || (module as any).module_name || 'Unknown Module'
  }

  // Filter user stories
  const filteredStories = userStories.filter(story => {
    const userRole = getUserRole(story)
    const matchesSearch = 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriority = priorityFilter === 'All Priorities' || story.priority === priorityFilter
    const matchesStatus = statusFilter === 'All Statuses' || story.status === statusFilter
    
    return matchesSearch && matchesPriority && matchesStatus
  })

  // Get features for a specific user story
  const getFeaturesForStory = (storyId: string): FeatureTask[] => {
    return features.filter(f => {
      const featureUserStoryId = f.userStoryId || (f as any).user_story_id
      return featureUserStoryId && (
        String(featureUserStoryId) === String(storyId) ||
        featureUserStoryId === storyId
      )
    })
  }

  const handleAddStory = () => {
    const newStory: UserStory = {
      id: crypto.randomUUID(),
      title: 'New User Story',
      userRole: 'User',
      description: 'As a User, I want to...',
      acceptanceCriteria: '- Given...\n- When...\n- Then...',
      priority: 'Medium',
      status: 'Not Started',
      moduleId: modules[0]?.id
    }
    // Ensure both formats are set for compatibility
    const storyWithBothFormats = {
      ...newStory,
      user_role: newStory.userRole,
      acceptance_criteria: newStory.acceptanceCriteria
    }
    onChange([...userStories, storyWithBothFormats as UserStory])
    setEditingId(newStory.id)
    setEditForm(newStory)
  }

  const handleEdit = (story: UserStory) => {
    setEditingStory({ ...story })
    setShowEditDialog(true)
  }

  const handleSaveEdit = () => {
    if (!editingStory) return

    // Ensure both formats are preserved when saving
    const storyWithBothFormats = {
      ...editingStory,
      user_role: editingStory.userRole || editingStory.user_role,
      acceptance_criteria: editingStory.acceptanceCriteria || editingStory.acceptance_criteria
    }

    const updatedStories = userStories.map(s => 
      s.id === editingStory.id ? storyWithBothFormats : s
    )
    onChange(updatedStories)
    setShowEditDialog(false)
    setEditingStory(null)
    toast.success('User story updated successfully')
  }

  const handleDelete = (id: string) => {
    onChange(userStories.filter(s => s.id !== id))
    if (selectedStoryId === id) {
      setSelectedStoryId(null)
    }
    toast.success('User story deleted successfully')
  }

  const handleStoryClick = (storyId: string) => {
    if (editingId) return // Don't allow selection while editing
    
    // If clicking the same story, deselect it
    if (selectedStoryId === storyId) {
      setSelectedStoryId(null)
      setSelectedFeatureIds(new Set())
      setCustomFeatures([])
      setCustomFeatureName('')
      return
    }
    
    // Select the new story
    setSelectedStoryId(storyId)
  }

  // Scroll to features card when a story is selected
  useEffect(() => {
    if (selectedStoryId && featuresCardRef.current) {
      setTimeout(() => {
        featuresCardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        })
      }, 150)
    }
  }, [selectedStoryId])
  
  // Initialize selected features when story is selected
  useEffect(() => {
    if (selectedStoryId) {
      const existingFeatures = getFeaturesForStory(selectedStoryId)
      if (existingFeatures.length > 0) {
        // Initialize with existing feature titles
        const featureTitles = existingFeatures.map(f => f.title || '').filter(Boolean)
        setSelectedFeatureIds(new Set(featureTitles))
      } else {
        setSelectedFeatureIds(new Set())
      }
      setCustomFeatures([])
      setCustomFeatureName('')
    }
  }, [selectedStoryId, features])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'In Progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-primary">User Stories</CardTitle>
              <CardDescription>Capture user needs and scenarios</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
              </Button>
              <AIUserStoriesEnhancement
                userStories={userStories}
                modules={modules}
                projectId={projectId}
                onEnhanced={onChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search user stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input-background border-primary/30"
              />
            </div>
            <Button
              onClick={handleAddStory}
              className="bg-primary hover:bg-primary/90"
              disabled={editingId !== null}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User Story
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Filters:</span>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px] bg-input-background border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Priorities">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-input-background border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Stories Table */}
          <div className="border border-primary/20 rounded-lg overflow-hidden bg-background/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead className="text-primary font-semibold">
                    <div className="flex items-center gap-1">
                      Title
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-primary font-semibold">
                    <div className="flex items-center gap-1">
                      Module
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-primary font-semibold">
                    <div className="flex items-center gap-1">
                      User/Role
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-primary font-semibold">Description</TableHead>
                  <TableHead className="text-primary font-semibold">Acceptance Criteria</TableHead>
                  <TableHead className="text-primary font-semibold text-center">Priority</TableHead>
                  <TableHead className="text-primary font-semibold text-center">Status</TableHead>
                  <TableHead className="text-primary font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStories.map((story) => {
                  const isSelected = selectedStoryId === story.id
                  const storyFeatures = getFeaturesForStory(story.id)
                  
                  return (
                    <TableRow 
                      key={story.id}
                      className={`border-primary/20 hover:bg-primary/5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => handleStoryClick(story.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <ChevronDown className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          {story.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                          {getModuleName(story.moduleId || (story as any).module_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {getUserRole(story)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <span className="line-clamp-2">{story.description}</span>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <span className="line-clamp-2">{getAcceptanceCriteria(story)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getPriorityColor(story.priority)}>
                          {story.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(story.status)}>
                          {story.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(story)}
                            className="h-8 w-8 p-0"
                            disabled={editingId !== null}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(story.id)}
                            className="h-8 w-8 p-0 text-destructive"
                            disabled={editingId !== null}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredStories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No user stories found. Create your first user story to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Features Panel for Selected User Story */}
      {selectedStoryId && (() => {
        const selectedStory = userStories.find(s => s.id === selectedStoryId)
        if (!selectedStory) return null
        
        const storyFeatures = getFeaturesForStory(selectedStoryId)
        const moduleName = getModuleName(selectedStory.moduleId || (selectedStory as any).module_id)
        
        // Use actual features from database, combine with custom features
        const allFeatures = [
          ...storyFeatures.map(f => f.title || '').filter(Boolean), 
          ...customFeatures
        ]
        const allSelected = allFeatures.length > 0 && allFeatures.every(f => {
          const featureId = typeof f === 'string' ? f : f
          return selectedFeatureIds.has(featureId)
        })
        
        const handleAddCustomFeature = () => {
          if (customFeatureName.trim()) {
            setCustomFeatures([...customFeatures, customFeatureName.trim()])
            setCustomFeatureName('')
          }
        }
        
        const handleToggleFeature = (featureName: string) => {
          const newSelected = new Set(selectedFeatureIds)
          if (newSelected.has(featureName)) {
            newSelected.delete(featureName)
          } else {
            newSelected.add(featureName)
          }
          setSelectedFeatureIds(newSelected)
        }
        
        const handleSelectAll = () => {
          if (allSelected) {
            setSelectedFeatureIds(new Set())
          } else {
            setSelectedFeatureIds(new Set(allFeatures))
          }
        }
        
        const handleResetFeatures = () => {
          setSelectedFeatureIds(new Set())
          setCustomFeatures([])
          setCustomFeatureName('')
        }
        
        const handleSaveChanges = async () => {
          if (!projectId || !selectedStoryId) {
            toast.error('Cannot save features: Missing project or user story ID')
            return
          }
          
          try {
            // Reload features first to get latest data
            const featuresResponse = await featuresAPI.get(projectId)
            const currentFeatures = featuresResponse.features || []
            
            // Get existing features for this user story
            const existingFeatures = currentFeatures.filter((f: any) => {
              const featureUserStoryId = f.userStoryId || f.user_story_id
              return featureUserStoryId && String(featureUserStoryId) === String(selectedStoryId)
            })
            
            console.log('Existing features for story:', existingFeatures)
            console.log('Selected feature IDs:', Array.from(selectedFeatureIds))
            
            // Create features to add/update
            const featuresToSave: FeatureTask[] = []
            
            // Add selected features
            Array.from(selectedFeatureIds).forEach(featureName => {
              const existingFeature = existingFeatures.find((f: any) => f.title === featureName)
              if (existingFeature) {
                // Keep existing feature
                featuresToSave.push(existingFeature)
              } else {
                // Create new feature
                const newFeature: FeatureTask = {
                  id: crypto.randomUUID(),
                  title: String(featureName),
                  description: '',
                  userStoryId: selectedStoryId,
                  priority: 'Medium',
                  status: 'Not Started'
                } as FeatureTask
                featuresToSave.push(newFeature)
              }
            })
            
            // Combine all project features: keep features from other stories, replace features for this story
            const allProjectFeatures = currentFeatures
              .filter((f: any) => {
                const featureUserStoryId = f.userStoryId || f.user_story_id
                // Keep features that don't belong to this story
                return !featureUserStoryId || String(featureUserStoryId) !== String(selectedStoryId)
              })
              .concat(featuresToSave)
            
            console.log('Saving features:', allProjectFeatures.length, 'total features')
            
            // Save features via API
            if (projectId) {
              const savedResponse = await featuresAPI.save(projectId, allProjectFeatures)
              
              // Notify parent component to reload features
              if (onFeaturesChange && savedResponse.features) {
                onFeaturesChange(savedResponse.features)
              }
              
              toast.success(`Successfully saved ${featuresToSave.length} feature(s)`)
              
              // Reload features to update the UI
              const updatedFeatures = await featuresAPI.get(projectId)
              if (onFeaturesChange && updatedFeatures.features) {
                onFeaturesChange(updatedFeatures.features)
              }
            }
          } catch (error: any) {
            console.error('Failed to save features:', error)
            toast.error(error.message || 'Failed to save features')
          }
        }
        
        return (
          <Card 
            ref={featuresCardRef}
            className="border-primary/30 bg-card/50 rounded-lg"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl text-primary">
                      {moduleName} - Feature Management
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    Select from recommended features or add custom features for this module
                  </CardDescription>
                </div>
                {/* <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  AI Magic
                </Button> */}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Custom Feature Section */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Add Custom Feature</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom feature name..."
                    value={customFeatureName}
                    onChange={(e) => setCustomFeatureName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomFeature()
                      }
                    }}
                    className="flex-1 border-primary/30"
                  />
                  <Button
                    onClick={handleAddCustomFeature}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Features Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <Label className="text-base font-semibold text-primary">
                      Features ({allFeatures.length})
                    </Label>
                  </div>
                  {allFeatures.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Select All ({allFeatures.length})
                    </Button>
                  )}
                </div>
                
                {/* Features Grid */}
                {allFeatures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No features found. Add custom features above or save features to see them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allFeatures.map((featureName) => {
                      const featureId = typeof featureName === 'string' ? featureName : featureName
                      const isSelected = selectedFeatureIds.has(featureId)
                      const displayName = typeof featureName === 'string' ? featureName : featureName
                      
                      return (
                        <div
                          key={featureId}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-primary/20 bg-card/30 hover:border-primary/40'
                          }`}
                          onClick={() => handleToggleFeature(featureId)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleFeature(featureId)}
                            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm font-medium text-foreground flex-1">
                            {displayName}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-primary/20">
                <Button
                  variant="outline"
                  onClick={handleResetFeatures}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Features
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })()}


      {/* Edit User Story Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">Edit User Story</DialogTitle>
            <DialogDescription>
              Define who will use this feature and what acceptance criteria must be met.
            </DialogDescription>
          </DialogHeader>
          
          {editingStory && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingStory.title}
                  onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                  className="bg-input-background border-primary/30"
                />
              </div>

              <div>
                <Label>User/Role <span className="text-red-500">*</span></Label>
                <Input
                  value={getUserRole(editingStory)}
                  onChange={(e) => setEditingStory({ ...editingStory, userRole: e.target.value, user_role: e.target.value })}
                  className="bg-input-background border-primary/30"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Who will interact with this feature? Include access levels or permissions if needed.
                </p>
              </div>

              <div>
                <Label>Description <span className="text-red-500">*</span></Label>
                <Textarea
                  value={editingStory.description}
                  onChange={(e) => setEditingStory({ ...editingStory, description: e.target.value })}
                  className="bg-input-background border-primary/30 min-h-[100px]"
                />
              </div>

              <div>
                <Label>Acceptance Criteria</Label>
                <Textarea
                  value={getAcceptanceCriteria(editingStory)}
                  onChange={(e) => setEditingStory({ 
                    ...editingStory, 
                    acceptanceCriteria: e.target.value,
                    acceptance_criteria: e.target.value
                  })}
                  className="bg-input-background border-primary/30 min-h-[120px]"
                  placeholder="- Given...\n- When...\n- Then..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Conditions that define when this feature is complete or working correctly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={editingStory.priority} 
                    onValueChange={(value) => setEditingStory({ 
                      ...editingStory, 
                      priority: value as 'High' | 'Medium' | 'Low' 
                    })}
                  >
                    <SelectTrigger className="bg-input-background border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select 
                    value={editingStory.status} 
                    onValueChange={(value) => setEditingStory({ 
                      ...editingStory, 
                      status: value as 'Not Started' | 'In Progress' | 'Completed' 
                    })}
                  >
                    <SelectTrigger className="bg-input-background border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {modules.length > 0 && (
                <div>
                  <Label>Module</Label>
                  <Select 
                    value={editingStory.moduleId || ''} 
                    onValueChange={(value) => setEditingStory({ ...editingStory, moduleId: value })}
                  >
                    <SelectTrigger className="bg-input-background border-primary/30">
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(module => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.moduleName || (module as any).module_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}