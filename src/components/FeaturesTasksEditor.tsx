import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { Plus, Pencil, Trash2, Search, ArrowUpDown, Filter } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { ModuleFeature } from './ExcelUtils'
import { UserStory } from './UserStoriesEditor'

export interface FeatureTask {
  id: string
  title: string
  description: string
  userStoryId: string
  moduleId: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Not Started' | 'In Progress' | 'Completed'
  estimatedHours?: number
  assignee?: string
}

export const createDefaultFeatureTask = (): FeatureTask => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  userStoryId: '',
  moduleId: '',
  priority: 'Medium',
  status: 'Not Started',
  estimatedHours: undefined,
  assignee: ''
})

interface FeaturesTasksEditorProps {
  features: FeatureTask[]
  onChange: (features: FeatureTask[]) => void
  userStories: UserStory[]
  modules: ModuleFeature[]
}

export default function FeaturesTasksEditor({ 
  features, 
  onChange,
  userStories,
  modules
}: FeaturesTasksEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteFeatureId, setDeleteFeatureId] = useState<string | null>(null)
  const [editingFeature, setEditingFeature] = useState<FeatureTask>(createDefaultFeatureTask())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<keyof FeatureTask>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterModule, setFilterModule] = useState<string>('all')
  const [filterUserStory, setFilterUserStory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const handleAdd = () => {
    setEditingFeature(createDefaultFeatureTask())
    setIsAddDialogOpen(true)
  }

  const handleEdit = (feature: FeatureTask) => {
    setEditingFeature({ ...feature })
    setIsEditDialogOpen(true)
  }

  const handleSaveNew = () => {
    if (!editingFeature.title || !editingFeature.description || !editingFeature.userStoryId) {
      toast.error('Please fill in all required fields')
      return
    }
    
    // Get moduleId from selected user story
    const userStory = userStories.find(us => us.id === editingFeature.userStoryId)
    if (!userStory?.moduleId) {
      toast.error('Selected user story must belong to a module')
      return
    }

    const newFeature = { ...editingFeature, moduleId: userStory.moduleId }
    onChange([...features, newFeature])
    setIsAddDialogOpen(false)
    toast.success('Feature/Task added successfully')
  }

  const handleSaveEdit = () => {
    if (!editingFeature.title || !editingFeature.description || !editingFeature.userStoryId) {
      toast.error('Please fill in all required fields')
      return
    }

    // Get moduleId from selected user story
    const userStory = userStories.find(us => us.id === editingFeature.userStoryId)
    if (!userStory?.moduleId) {
      toast.error('Selected user story must belong to a module')
      return
    }

    const updatedFeature = { ...editingFeature, moduleId: userStory.moduleId }
    onChange(features.map(feature => 
      feature.id === updatedFeature.id ? updatedFeature : feature
    ))
    setIsEditDialogOpen(false)
    toast.success('Feature/Task updated successfully')
  }

  const handleDelete = (id: string) => {
    setDeleteFeatureId(id)
  }

  const confirmDelete = () => {
    if (deleteFeatureId) {
      onChange(features.filter(feature => feature.id !== deleteFeatureId))
      setDeleteFeatureId(null)
      toast.success('Feature/Task deleted successfully')
    }
  }

  const handleSort = (field: keyof FeatureTask) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get module name by ID
  const getModuleName = (moduleId: string) => {
    return modules.find(m => m.id === moduleId)?.moduleName || 'Unknown Module'
  }

  // Get user story title by ID
  const getUserStoryTitle = (userStoryId: string) => {
    return userStories.find(us => us.id === userStoryId)?.title || 'Unknown User Story'
  }

  // Filter and sort logic
  const filteredAndSortedFeatures = features
    .filter(feature => {
      const matchesSearch = 
        (feature.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (feature.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesModule = filterModule === 'all' || feature.moduleId === filterModule
      const matchesUserStory = filterUserStory === 'all' || feature.userStoryId === filterUserStory
      const matchesPriority = filterPriority === 'all' || feature.priority === filterPriority
      const matchesStatus = filterStatus === 'all' || feature.status === filterStatus
      
      return matchesSearch && matchesModule && matchesUserStory && matchesPriority && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField] || ''
      const bValue = b[sortField] || ''
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  // Get user stories for selected module (for dropdown filtering)
  const getUserStoriesForModule = (moduleId: string) => {
    return userStories.filter(us => us.moduleId === moduleId)
  }

  // Group features by module and user story for better organization
  const featuresByModule = filteredAndSortedFeatures.reduce((acc, feature) => {
    if (!acc[feature.moduleId]) {
      acc[feature.moduleId] = []
    }
    acc[feature.moduleId].push(feature)
    return acc
  }, {} as Record<string, FeatureTask[]>)

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features/tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-primary/30"
            />
          </div>
        </div>
        <Button onClick={handleAdd} className="neon-glow" disabled={userStories.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feature/Task
        </Button>
      </div>

      {userStories.length === 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-6">
            <p className="text-center text-yellow-500">
              Please create User Stories first before adding Features/Tasks
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-[180px] border-primary/30">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map(module => (
              <SelectItem key={module.id} value={module.id}>
                {module.moduleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterUserStory} onValueChange={setFilterUserStory}>
          <SelectTrigger className="w-[200px] border-primary/30">
            <SelectValue placeholder="User Story" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All User Stories</SelectItem>
            {userStories.map(story => (
              <SelectItem key={story.id} value={story.id}>
                {story.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px] border-primary/30">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-priority" value="all">All Priorities</SelectItem>
            <SelectItem key="High" value="High">High</SelectItem>
            <SelectItem key="Medium" value="Medium">Medium</SelectItem>
            <SelectItem key="Low" value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] border-primary/30">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-status" value="all">All Statuses</SelectItem>
            <SelectItem key="Not Started" value="Not Started">Not Started</SelectItem>
            <SelectItem key="In Progress" value="In Progress">In Progress</SelectItem>
            <SelectItem key="Completed" value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {(filterModule !== 'all' || filterUserStory !== 'all' || filterPriority !== 'all' || filterStatus !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterModule('all')
              setFilterUserStory('all')
              setFilterPriority('all')
              setFilterStatus('all')
            }}
            className="text-xs"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="border-primary/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20 hover:bg-primary/5">
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Title
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>User Story</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      Priority
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Est. Hours</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedFeatures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {features.length === 0 
                        ? 'No features/tasks yet. Click "Add Feature/Task" to get started.'
                        : 'No features/tasks match your search criteria.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedFeatures.map((feature) => (
                    <TableRow 
                      key={feature.id} 
                      className="border-primary/20 hover:bg-primary/5"
                    >
                      <TableCell className="font-medium max-w-[200px]">
                        {feature.title}
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs">
                          {getModuleName(feature.moduleId)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs">
                          {getUserStoryTitle(feature.userStoryId)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="line-clamp-2 text-sm text-muted-foreground">
                          {feature.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs ${
                          feature.priority === 'High' 
                            ? 'bg-red-500/10 text-red-500'
                            : feature.priority === 'Medium'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {feature.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs ${
                          feature.status === 'Completed'
                            ? 'bg-green-500/10 text-green-500'
                            : feature.status === 'In Progress'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {feature.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {feature.estimatedHours ? `${feature.estimatedHours}h` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(feature)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(feature.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddDialogOpen ? 'Add Feature/Task' : 'Edit Feature/Task'}
            </DialogTitle>
            <DialogDescription>
              Define a specific feature or task that implements part of a user story.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={editingFeature.title}
                onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                placeholder="e.g., Implement login form validation"
                className="border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userStory">
                User Story <span className="text-destructive">*</span>
              </Label>
              <Select
                value={editingFeature.userStoryId}
                onValueChange={(value) => setEditingFeature({ ...editingFeature, userStoryId: value })}
              >
                <SelectTrigger className="border-primary/30">
                  <SelectValue placeholder="Select user story" />
                </SelectTrigger>
                <SelectContent>
                  {userStories.map(story => (
                    <SelectItem key={story.id} value={story.id}>
                      {story.title} ({getModuleName(story.moduleId || '')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Which user story does this feature/task implement?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={editingFeature.description}
                onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                placeholder="Detailed description of the feature/task implementation..."
                rows={4}
                className="resize-none border-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={editingFeature.priority}
                  onValueChange={(value: 'High' | 'Medium' | 'Low') => 
                    setEditingFeature({ ...editingFeature, priority: value })
                  }
                >
                  <SelectTrigger className="border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="High" value="High">High</SelectItem>
                    <SelectItem key="Medium" value="Medium">Medium</SelectItem>
                    <SelectItem key="Low" value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingFeature.status}
                  onValueChange={(value: 'Not Started' | 'In Progress' | 'Completed') => 
                    setEditingFeature({ ...editingFeature, status: value })
                  }
                >
                  <SelectTrigger className="border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="Not Started" value="Not Started">Not Started</SelectItem>
                    <SelectItem key="In Progress" value="In Progress">In Progress</SelectItem>
                    <SelectItem key="Completed" value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editingFeature.estimatedHours || ''}
                  onChange={(e) => setEditingFeature({ 
                    ...editingFeature, 
                    estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="e.g., 8"
                  className="border-primary/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee (Optional)</Label>
                <Input
                  id="assignee"
                  value={editingFeature.assignee || ''}
                  onChange={(e) => setEditingFeature({ ...editingFeature, assignee: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="border-primary/30"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setIsEditDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={isAddDialogOpen ? handleSaveNew : handleSaveEdit}>
              {isAddDialogOpen ? 'Add Feature/Task' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteFeatureId !== null} onOpenChange={() => setDeleteFeatureId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature/Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feature/task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
