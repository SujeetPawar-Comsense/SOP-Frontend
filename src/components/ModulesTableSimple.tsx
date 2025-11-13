import { useState } from 'react'
import { toast } from 'sonner@2.0.3'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { ModuleFeature } from './ExcelUtils'
import AIGeneralEnhancement from './AIGeneralEnhancement'

// Keep old exports for compatibility
export interface ModuleFeatures {
  [moduleId: string]: string[]
}

export interface ModuleBusinessRules {
  [moduleId: string]: string[]
}

interface ModulesTableProps {
  modules: ModuleFeature[]
  projectId?: string
  onChange: (modules: ModuleFeature[]) => void
}

export default function ModulesTable({ 
  modules,
  projectId,
  onChange
}: ModulesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ModuleFeature | null>(null)

  const handleAddModule = () => {
    const newModule: ModuleFeature = {
      id: crypto.randomUUID(),
      moduleName: '',
      description: '',
      priority: 'Medium',
      businessImpact: '',
      dependencies: '',
      status: 'Not Started'
    }
    setEditingId(newModule.id)
    setEditForm(newModule)
    onChange([...modules, newModule])
  }

  const handleEdit = (module: ModuleFeature) => {
    setEditingId(module.id)
    // Convert array dependencies to comma-separated string for editing
    setEditForm({ 
      ...module,
      dependencies: Array.isArray(module.dependencies) 
        ? module.dependencies.join(', ') 
        : module.dependencies 
    })
  }

  const handleSave = () => {
    if (editForm && editingId) {
      if (!editForm.moduleName || !editForm.description) {
        toast.error('Module name and description are required')
        return
      }
      onChange(modules.map(m => m.id === editingId ? editForm : m))
      setEditingId(null)
      setEditForm(null)
      toast.success('Module saved successfully')
    }
  }

  const handleCancel = () => {
    if (editForm && !editForm.moduleName) {
      // If it's a new module that hasn't been filled, remove it
      onChange(modules.filter(m => m.id !== editingId))
    }
    setEditingId(null)
    setEditForm(null)
  }

  const handleDelete = (id: string) => {
    onChange(modules.filter(m => m.id !== id))
    toast.success('Module deleted successfully')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-muted'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'In Progress': return 'bg-primary/20 text-primary border-primary/30'
      case 'Not Started': return 'bg-muted text-muted-foreground border-muted-foreground/30'
      default: return 'bg-muted'
    }
  }

  if (modules.length === 0 && !editingId) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg bg-background/50">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg mb-2">No Modules Added Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Modules represent the major functional areas of your application. Start by adding your first module.
          </p>
          <div className="flex gap-2 justify-center">
            <AIGeneralEnhancement
              modules={modules}
              projectId={projectId}
              onEnhanced={onChange}
            />
            <Button
              onClick={handleAddModule}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Add First Module
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg">Modules</h3>
          <p className="text-sm text-muted-foreground">
            Define the major functional areas of your application
          </p>
        </div>
        <div className="flex gap-2">
          <AIGeneralEnhancement
            modules={modules}
            projectId={projectId}
            onEnhanced={onChange}
          />
          <Button
            onClick={handleAddModule}
            className="gap-2 bg-primary hover:bg-primary/90"
            disabled={editingId !== null}
          >
            <Plus className="w-4 h-4" />
            Add Module
          </Button>
        </div>
      </div>

      <div className="border border-primary/20 rounded-lg overflow-hidden bg-background/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-primary/20 hover:bg-primary/5">
                <TableHead className="w-[200px]">Module Name</TableHead>
                <TableHead className="w-[300px]">Description</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[200px]">Business Impact</TableHead>
                <TableHead className="w-[150px]">Dependencies</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow 
                  key={module.id} 
                  className="border-primary/20 hover:bg-primary/5"
                >
                  {editingId === module.id && editForm ? (
                    <>
                      <TableCell>
                        <Input
                          value={editForm.module_name}
                          onChange={(e) => setEditForm({ ...editForm, module_name: e.target.value })}
                          placeholder="Module name..."
                          className="bg-input-background border-primary/30"
                          autoFocus
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editForm.descripdescriptiontion}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description..."
                          className="bg-input-background border-primary/30"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editForm.priority}
                          onValueChange={(value: any) => setEditForm({ ...editForm, priority: value })}
                        >
                          <SelectTrigger className="bg-input-background border-primary/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="High" value="High">High</SelectItem>
                            <SelectItem key="Medium" value="Medium">Medium</SelectItem>
                            <SelectItem key="Low" value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editForm.businessImpact}
                          onChange={(e) => setEditForm({ ...editForm, businessImpact: e.target.value })}
                          placeholder="Business impact..."
                          className="bg-input-background border-primary/30"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editForm.dependencies}
                          onChange={(e) => setEditForm({ ...editForm, dependencies: e.target.value })}
                          placeholder="Dependencies..."
                          className="bg-input-background border-primary/30"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editForm.status}
                          onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
                        >
                          <SelectTrigger className="bg-input-background border-primary/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="Not Started" value="Not Started">Not Started</SelectItem>
                            <SelectItem key="In Progress" value="In Progress">In Progress</SelectItem>
                            <SelectItem key="Completed" value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSave}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{module.module_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{module.description}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(module.priority)}>
                          {module.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{module.business_impact || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {Array.isArray(module.dependencies) 
                          ? module.dependencies.join(', ') 
                          : (module.dependencies || '-')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(module.status)}>
                          {module.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(module)}
                            className="h-8 w-8 p-0"
                            disabled={editingId !== null}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(module.id)}
                            className="h-8 w-8 p-0"
                            disabled={editingId !== null}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {modules.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {modules.length} module{modules.length !== 1 ? 's' : ''} • 
          User Stories and Features/Tasks will be linked to these modules
        </div>
      )}
    </div>
  )
}
