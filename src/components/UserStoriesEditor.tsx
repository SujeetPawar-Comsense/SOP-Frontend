import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
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
import { Plus, Pencil, Trash2, Search, ArrowUpDown, Filter, Download, Upload, Copy } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { ModuleFeature } from './ExcelUtils'

export interface UserStory {
  id: string
  title: string
  userRole: string
  description: string
  acceptanceCriteria: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Not Started' | 'In Progress' | 'Completed'
  moduleId?: string // Links user story to a module
}

export const createDefaultUserStory = (): UserStory => ({
  id: crypto.randomUUID(),
  title: '',
  userRole: '',
  description: '',
  acceptanceCriteria: '',
  priority: 'Medium',
  status: 'Not Started',
  moduleId: ''
})

export const createSampleUserStories = (): UserStory[] => [
  {
    id: crypto.randomUUID(),
    title: 'User Registration',
    userRole: 'Customer',
    description: 'As a Customer, I want to register an account so that I can access personalized features.',
    acceptanceCriteria: '- User can enter email and password\n- Email validation is performed\n- Password must be at least 8 characters\n- Confirmation email is sent\n- User is redirected to dashboard after registration',
    priority: 'High',
    status: 'Completed'
  },
  {
    id: crypto.randomUUID(),
    title: 'Admin Dashboard Access',
    userRole: 'Admin',
    description: 'As an Admin, I want to access a comprehensive dashboard so that I can monitor system activities.',
    acceptanceCriteria: '- Admin can view real-time metrics\n- Access to user management tools\n- Can export reports\n- Role-based access control is enforced',
    priority: 'High',
    status: 'In Progress'
  },
  {
    id: crypto.randomUUID(),
    title: 'Product Search',
    userRole: 'Customer',
    description: 'As a Customer, I want to search for products so that I can quickly find what I need.',
    acceptanceCriteria: '- Search bar is visible on all pages\n- Results display within 2 seconds\n- Filters can be applied to results\n- Search suggestions appear as user types',
    priority: 'High',
    status: 'Not Started'
  },
  {
    id: crypto.randomUUID(),
    title: 'Order Management',
    userRole: 'Manager',
    description: 'As a Manager, I want to manage orders so that I can track and fulfill customer requests.',
    acceptanceCriteria: '- View all orders in a sortable table\n- Filter by status and date range\n- Update order status\n- Export order data to CSV',
    priority: 'Medium',
    status: 'Not Started'
  },
  {
    id: crypto.randomUUID(),
    title: 'Payment Processing',
    userRole: 'Customer',
    description: 'As a Customer, I want to securely process payments so that I can complete my purchase.',
    acceptanceCriteria: '- Multiple payment methods supported\n- PCI compliance maintained\n- Payment confirmation displayed\n- Receipt sent via email',
    priority: 'High',
    status: 'In Progress'
  }
]

interface UserStoriesEditorProps {
  userStories: UserStory[]
  onChange: (userStories: UserStory[]) => void
  modules: ModuleFeature[]
}

export default function UserStoriesEditor({ userStories, onChange, modules }: UserStoriesEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [viewingStory, setViewingStory] = useState<UserStory | null>(null)
  const [deleteStoryId, setDeleteStoryId] = useState<string | null>(null)
  const [editingStory, setEditingStory] = useState<UserStory>(createDefaultUserStory())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<keyof UserStory>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterModule, setFilterModule] = useState<string>('all')

  const handleAdd = () => {
    setEditingStory(createDefaultUserStory())
    setIsAddDialogOpen(true)
  }

  const handleEdit = (story: UserStory) => {
    setEditingStory({ ...story })
    setIsEditDialogOpen(true)
  }

  const handleView = (story: UserStory) => {
    setViewingStory(story)
    setIsDetailDialogOpen(true)
  }

  const handleSaveNew = () => {
    if (!editingStory.title || !editingStory.userRole || !editingStory.description || !editingStory.moduleId) {
      toast.error('Please fill in all required fields including module')
      return
    }
    
    onChange([...userStories, editingStory])
    setIsAddDialogOpen(false)
    toast.success('User story added successfully')
  }

  const handleSaveEdit = () => {
    if (!editingStory.title || !editingStory.userRole || !editingStory.description || !editingStory.moduleId) {
      toast.error('Please fill in all required fields including module')
      return
    }

    onChange(userStories.map(story => 
      story.id === editingStory.id ? editingStory : story
    ))
    setIsEditDialogOpen(false)
    toast.success('User story updated successfully')
  }

  const handleDelete = (id: string) => {
    setDeleteStoryId(id)
  }

  const confirmDelete = () => {
    if (deleteStoryId) {
      onChange(userStories.filter(story => story.id !== deleteStoryId))
      setDeleteStoryId(null)
      toast.success('User story deleted successfully')
    }
  }

  const handleSort = (field: keyof UserStory) => {
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

  // Filter and sort logic
  const filteredAndSortedStories = userStories
    .filter(story => {
      const matchesSearch = 
        (story.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (story.userRole || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (story.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesPriority = filterPriority === 'all' || story.priority === filterPriority
      const matchesStatus = filterStatus === 'all' || story.status === filterStatus
      const matchesModule = filterModule === 'all' || story.moduleId === filterModule
      
      return matchesSearch && matchesPriority && matchesStatus && matchesModule
    })
    .sort((a, b) => {
      const aValue = a[sortField] || ''
      const bValue = b[sortField] || ''
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  return (
    <div className="space-y-4">
      {modules.length === 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-6">
            <p className="text-center text-yellow-500">
              Please create Modules first before adding User Stories
            </p>
          </CardContent>
        </Card>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-primary/30"
            />
          </div>
        </div>
        <Button onClick={handleAdd} className="neon-glow" disabled={modules.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add User Story
        </Button>
      </div>

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
        {(filterModule !== 'all' || filterPriority !== 'all' || filterStatus !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterModule('all')
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
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('userRole')}
                  >
                    <div className="flex items-center gap-2">
                      User/Role
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Acceptance Criteria</TableHead>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedStories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {userStories.length === 0 
                        ? 'No user stories yet. Click "Add User Story" to get started.'
                        : 'No user stories match your search criteria.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedStories.map((story) => (
                    <TableRow 
                      key={story.id} 
                      className="border-primary/20 hover:bg-primary/5 cursor-pointer"
                      onClick={() => handleView(story)}
                    >
                      <TableCell className="font-medium max-w-[200px]">
                        {story.title}
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs">
                          {getModuleName(story.moduleId || '')}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                          {story.userRole}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="line-clamp-2 text-sm text-muted-foreground">
                          {story.description}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="line-clamp-2 text-sm text-muted-foreground">
                          {story.acceptanceCriteria || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs ${
                          story.priority === 'High' 
                            ? 'bg-red-500/10 text-red-500'
                            : story.priority === 'Medium'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {story.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs ${
                          story.status === 'Completed'
                            ? 'bg-green-500/10 text-green-500'
                            : story.status === 'In Progress'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {story.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(story)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(story.id)
                            }}
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
              {isAddDialogOpen ? 'Add User Story' : 'Edit User Story'}
            </DialogTitle>
            <DialogDescription>
              Define who will use this feature and what acceptance criteria must be met.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={editingStory.title}
                onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                placeholder="e.g., User Registration"
                className="border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module">
                Module <span className="text-destructive">*</span>
              </Label>
              <Select
                value={editingStory.moduleId}
                onValueChange={(value) => setEditingStory({ ...editingStory, moduleId: value })}
              >
                <SelectTrigger className="border-primary/30">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.moduleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Which module does this user story belong to?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userRole">
                User/Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userRole"
                value={editingStory.userRole}
                onChange={(e) => setEditingStory({ ...editingStory, userRole: e.target.value })}
                placeholder="e.g., Customer, Admin, Manager"
                className="border-primary/30"
              />
              <p className="text-xs text-muted-foreground">
                Who will interact with this feature? Include access levels or permissions if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={editingStory.description}
                onChange={(e) => setEditingStory({ ...editingStory, description: e.target.value })}
                placeholder="As a [user role], I want to [action] so that [benefit]"
                rows={3}
                className="resize-none border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acceptanceCriteria">
                Acceptance Criteria
              </Label>
              <Textarea
                id="acceptanceCriteria"
                value={editingStory.acceptanceCriteria}
                onChange={(e) => setEditingStory({ ...editingStory, acceptanceCriteria: e.target.value })}
                placeholder="- User can enter email and password&#10;- Email validation is performed&#10;- Confirmation is displayed"
                rows={5}
                className="resize-none border-primary/30"
              />
              <p className="text-xs text-muted-foreground">
                Conditions that define when this feature is complete or working correctly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={editingStory.priority}
                  onValueChange={(value: 'High' | 'Medium' | 'Low') => 
                    setEditingStory({ ...editingStory, priority: value })
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
                  value={editingStory.status}
                  onValueChange={(value: 'Not Started' | 'In Progress' | 'Completed') => 
                    setEditingStory({ ...editingStory, status: value })
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
              {isAddDialogOpen ? 'Add Story' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle>
                  {viewingStory?.title}
                </DialogTitle>
                <DialogDescription>
                  Detailed information about the user story.
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewingStory) {
                    const storyText = `User Story: ${viewingStory.title}

User/Role: ${viewingStory.userRole}

Description: ${viewingStory.description}

Acceptance Criteria:
${viewingStory.acceptanceCriteria || 'N/A'}

Priority: ${viewingStory.priority}
Status: ${viewingStory.status}`
                    
                    // Try modern Clipboard API first, with fallback for blocked environments
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(storyText)
                        .then(() => {
                          toast.success('User story copied to clipboard')
                        })
                        .catch(() => {
                          // Fallback method
                          fallbackCopyToClipboard(storyText)
                        })
                    } else {
                      // Fallback method for environments without Clipboard API
                      fallbackCopyToClipboard(storyText)
                    }
                  }
                  
                  function fallbackCopyToClipboard(text: string) {
                    const textArea = document.createElement('textarea')
                    textArea.value = text
                    textArea.style.position = 'fixed'
                    textArea.style.left = '-999999px'
                    textArea.style.top = '-999999px'
                    document.body.appendChild(textArea)
                    textArea.focus()
                    textArea.select()
                    try {
                      document.execCommand('copy')
                      toast.success('User story copied to clipboard')
                    } catch (err) {
                      toast.error('Failed to copy to clipboard')
                    }
                    document.body.removeChild(textArea)
                  }
                }}
                className="gap-2 border-primary/50 hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={viewingStory?.title || ''}
                readOnly
                className="border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module">
                Module <span className="text-destructive">*</span>
              </Label>
              <Input
                id="module"
                value={getModuleName(viewingStory?.moduleId || '')}
                readOnly
                className="border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userRole">
                User/Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userRole"
                value={viewingStory?.userRole || ''}
                readOnly
                className="border-primary/30"
              />
              <p className="text-xs text-muted-foreground">
                Who will interact with this feature? Include access levels or permissions if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={viewingStory?.description || ''}
                readOnly
                placeholder="As a [user role], I want to [action] so that [benefit]"
                rows={3}
                className="resize-none border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acceptanceCriteria">
                Acceptance Criteria
              </Label>
              <Textarea
                id="acceptanceCriteria"
                value={viewingStory?.acceptanceCriteria || ''}
                readOnly
                placeholder="- User can enter email and password&#10;- Email validation is performed&#10;- Confirmation is displayed"
                rows={5}
                className="resize-none border-primary/30"
              />
              <p className="text-xs text-muted-foreground">
                Conditions that define when this feature is complete or working correctly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={viewingStory?.priority || 'Medium'}
                  onValueChange={(value: 'High' | 'Medium' | 'Low') => 
                    setEditingStory({ ...editingStory, priority: value })
                  }
                >
                  <SelectTrigger className="border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={viewingStory?.status || 'Not Started'}
                  onValueChange={(value: 'Not Started' | 'In Progress' | 'Completed') => 
                    setEditingStory({ ...editingStory, status: value })
                  }
                >
                  <SelectTrigger className="border-primary/30">
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false)
              }}
            >
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (viewingStory) {
                  setIsDetailDialogOpen(false)
                  handleEdit(viewingStory)
                }
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (viewingStory) {
                  setIsDetailDialogOpen(false)
                  handleDelete(viewingStory.id)
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteStoryId !== null} onOpenChange={() => setDeleteStoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user story? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}