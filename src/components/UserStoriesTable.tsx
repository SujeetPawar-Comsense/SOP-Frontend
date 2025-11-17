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
  FileText
} from 'lucide-react'
import { UserStory } from './UserStoriesEditor'
import { ModuleFeature } from './ExcelUtils'
import { FeatureTask } from './FeaturesTasksEditor'
import AIGeneralEnhancement from './AIGeneralEnhancement'

interface UserStoriesTableProps {
  userStories: UserStory[]
  modules: ModuleFeature[]
  features: FeatureTask[]
  projectId?: string
  onChange: (userStories: UserStory[]) => void
}

export default function UserStoriesTable({
  userStories,
  modules,
  features,
  projectId,
  onChange
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
              <Button 
                variant="outline" 
                size="sm"
                className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                AI Magic
              </Button>
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
        
        return (
          <Card 
            ref={featuresCardRef}
            className="border-primary/30 bg-primary/5"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">
                    {selectedStory.title} - Features
                  </CardTitle>
                  <CardDescription className="ml-2">
                    Manage features for this user story ({storyFeatures.length} feature{storyFeatures.length !== 1 ? 's' : ''})
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Magic
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {storyFeatures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No features found for this user story</p>
                  <p className="text-sm mt-2">Add features to implement this user story</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storyFeatures.map((feature) => (
                    <Card 
                      key={feature.id}
                      className="border-primary/20 bg-card/50 hover:bg-card/70 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-primary">{feature.title}</h4>
                              <Badge className={getPriorityColor(feature.priority || 'Medium')}>
                                {feature.priority || 'Medium'}
                              </Badge>
                              <Badge className={getStatusColor(feature.status || 'Not Started')}>
                                {feature.status || 'Not Started'}
                              </Badge>
                            </div>
                            {feature.description && (
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            )}
                            {feature.businessRules && (
                              <div className="mt-2 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded">
                                <Label className="text-xs text-cyan-400 mb-1">Business Rules</Label>
                                <p className="text-xs text-muted-foreground">{feature.businessRules}</p>
                              </div>
                            )}
                            {feature.estimatedHours && (
                              <div className="text-xs text-muted-foreground">
                                Estimated: {feature.estimatedHours} hours
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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