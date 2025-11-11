import { useState } from 'react'
import { Plus, FolderOpen, Calendar, Users, FileText, Loader2, Upload, Sparkles, Trash2, MoreVertical } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import ProjectDocumentCreator from './ProjectDocumentCreator'
import BRDUploadModal from './BRDUploadModal'
import { UserRole } from './RoleSelector'
import { apiClient } from '../utils/api'

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  createdBy: string
  createdByName?: string
  createdByRole?: string
  completionPercentage: number
}

interface ProjectSelectorProps {
  projects: Project[]
  onProjectSelect: (project: Project) => void
  onProjectCreate: (name: string, description: string) => void
  currentRole: UserRole
  loading?: boolean
}

export default function ProjectSelector({ projects, onProjectSelect, onProjectCreate, currentRole, loading }: ProjectSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [showProjectDocumentCreator, setShowProjectDocumentCreator] = useState(false)
  const [selectedProjectForDocument, setSelectedProjectForDocument] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadedBRD, setUploadedBRD] = useState('')
  const [uploadProjectName, setUploadProjectName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isBRDModalOpen, setIsBRDModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    onProjectCreate(newProjectName, newProjectDescription)
    setNewProjectName('')
    setNewProjectDescription('')
    setIsCreateDialogOpen(false)
  }

  const canCreateProject = currentRole === 'project_owner'
  const canDeleteProject = currentRole === 'project_owner'

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    setIsDeleting(true)
    try {
      const response = await apiClient.delete(`/projects/${projectToDelete.id}`)
      if (response.success) {
        toast.success('Project deleted successfully')
        // Reload the page to refresh the project list
        window.location.reload()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project')
    } finally {
      setIsDeleting(false)
      setProjectToDelete(null)
    }
  }

  const handleCreateDocument = () => {
    setShowProjectDocumentCreator(true)
    setSelectedProjectForDocument(null)
  }

  const handleBackFromDocument = () => {
    setShowProjectDocumentCreator(false)
    setSelectedProjectForDocument(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    // Clear pasted content when file is selected
    setUploadedBRD('')
  }

  const handleUploadBRD = async () => {
    if (!uploadedFile && !uploadedBRD.trim()) {
      toast.error('Please upload a file or paste document content')
      return
    }

    if (!uploadProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    setIsProcessing(true)

    try {
      let parseResponse: any

      // Note: Document parsing is not implemented in mock mode
      // This feature requires backend integration
      toast.info('Document parsing will be available when backend is connected')
      parseResponse = { extractedData: null }

      if (!parseResponse.extractedData) {
        throw new Error('Failed to extract data from document')
      }

      // Create a new project with the extracted data
      const projectData = {
        name: uploadProjectName,
        description: parseResponse.extractedData.projectInformation?.description || '',
        ...parseResponse.extractedData.projectInformation,
        completionPercentage: 0
      }

      const createResponse = await apiClient.post('/projects', projectData)

      if (!createResponse.project) {
        throw new Error('Failed to create project')
      }

      const projectId = createResponse.project.id

      // Transform and save all extracted data to the project
      const savePromises = []

      // Transform and save user stories
      if (parseResponse.extractedData.userStories && Array.isArray(parseResponse.extractedData.userStories) && parseResponse.extractedData.userStories.length > 0) {
        try {
          const transformedUserStories = parseResponse.extractedData.userStories
            .filter((story: any) => story && (story.userStory || story.title || story.description))
            .map((story: any) => {
              // Parse the userStory string to extract role and description
              let userRole = ''
              let description = story.userStory || story.description || ''
              
              // Try to extract role from "As a [role], I want..." format
              const roleMatch = description.match(/As an? ([\w\s]+),/i)
              if (roleMatch) {
                userRole = roleMatch[1].trim()
              }
              
              // Normalize priority
              let priority = 'Medium'
              if (story.priority) {
                const p = story.priority.toString().trim()
                if (p === 'High' || p === 'Medium' || p === 'Low') {
                  priority = p
                }
              }
              
              return {
                id: crypto.randomUUID(),
                title: story.title || (description.length > 50 ? description.substring(0, 50) + '...' : description),
                userRole: userRole || 'User',
                description: description,
                acceptanceCriteria: story.acceptanceCriteria || '',
                priority: priority as 'High' | 'Medium' | 'Low',
                status: 'Not Started' as const,
                moduleId: ''
              }
            })
          
          if (transformedUserStories.length > 0) {
            savePromises.push(
              apiClient.post(`/projects/${projectId}/user-stories`, {
                userStories: transformedUserStories
              })
            )
          }
        } catch (transformError) {
          console.error('Error transforming user stories:', transformError)
        }
      }

      // Transform and save modules
      if (parseResponse.extractedData.modules && parseResponse.extractedData.modules.length > 0) {
        const transformedModules = parseResponse.extractedData.modules.map((module: any) => ({
          id: crypto.randomUUID(),
          moduleName: module.moduleName || module.name || '',
          description: module.description || '',
          priority: module.priority || 'Medium',
          status: 'Not Started'
        }))
        
        savePromises.push(
          apiClient.post(`/projects/${projectId}/modules`, {
            modules: transformedModules
          })
        )
      }

      // Transform and save features/tasks
      if (parseResponse.extractedData.features && Array.isArray(parseResponse.extractedData.features) && parseResponse.extractedData.features.length > 0) {
        const transformedFeatures = parseResponse.extractedData.features.map((feature: any) => ({
          id: crypto.randomUUID(),
          title: feature.title || feature.featureName || '',
          description: feature.description || '',
          userStoryId: feature.userStoryId || '',
          moduleId: feature.moduleId || '',
          priority: feature.priority || 'Medium',
          status: feature.status || 'Not Started',
          estimatedHours: feature.estimatedHours,
          assignee: feature.assignee || ''
        }))
        
        savePromises.push(
          apiClient.post(`/projects/${projectId}/features`, {
            features: transformedFeatures
          })
        )
      }

      // Save business rules (already in correct format)
      if (parseResponse.extractedData.businessRules) {
        savePromises.push(
          apiClient.post(`/projects/${projectId}/business-rules`, {
            businessRules: parseResponse.extractedData.businessRules
          })
        )
      }

      // Save actions/interactions (already in correct format)
      if (parseResponse.extractedData.actions || parseResponse.extractedData.actionsInteractions) {
        savePromises.push(
          apiClient.post(`/projects/${projectId}/actions`, {
            actions: parseResponse.extractedData.actions || parseResponse.extractedData.actionsInteractions
          })
        )
      }

      // Save UI/UX guidelines (already in correct format)
      if (parseResponse.extractedData.uiuxGuidelines) {
        savePromises.push(
          apiClient.post(`/projects/${projectId}/uiux-guidelines`, {
            guidelines: parseResponse.extractedData.uiuxGuidelines
          })
        )
      }

      // Save all data with error handling
      try {
        await Promise.all(savePromises)
        console.log('All data saved successfully')
      } catch (saveError: any) {
        console.error('Error saving extracted data:', saveError)
        // Continue anyway - partial data is better than nothing
        toast.warning('Project created but some data may not have been saved correctly')
      }

      toast.success('Document imported and project created successfully!')
      
      // Reset form
      setUploadedBRD('')
      setUploadProjectName('')
      setUploadedFile(null)
      setIsUploadDialogOpen(false)

      // Navigate to the newly created project
      setTimeout(() => {
        onProjectSelect(createResponse.project)
      }, 500)

    } catch (error: any) {
      console.error('Failed to process document:', error)
      
      // Provide user-friendly error messages with better formatting
      let errorMessage = 'Failed to process document'
      let errorTitle = '❌ Document Processing Failed'
      
      if (error.message?.includes('Failed to parse the document') || 
          error.message?.includes('Failed to parse the pasted content')) {
        // New structured error from backend
        errorMessage = error.message
        errorTitle = '⚠️ Document Parsing Error'
      } else if (error.message?.includes('Failed to parse AI response')) {
        errorMessage = error.message
        errorTitle = '⚠️ AI Processing Error'
      } else if (error.message?.includes('too complex') || error.message?.includes('too long')) {
        errorMessage = 'Document is too large or complex.\n\n✓ Try uploading a shorter document\n✓ Paste content directly\n✓ Simplify the document structure'
        errorTitle = '📄 Document Too Large'
      } else if (error.message?.includes('Unsupported file type')) {
        errorMessage = error.message + '\n\n✓ Use .txt, .md, or .docx files\n✓ Or paste the content directly'
        errorTitle = '📎 Unsupported File Type'
      } else if (error.message?.includes('empty or too short')) {
        errorMessage = 'Document appears to be empty or contains no valid content.\n\n✓ Check that the file is not corrupted\n✓ Ensure it contains readable text'
        errorTitle = '📄 Empty Document'
      } else if (error.message?.includes('PDF parsing not yet implemented')) {
        errorMessage = 'PDF files are not yet supported.\n\n✓ Convert to .txt or .docx\n✓ Or paste the content directly'
        errorTitle = '📕 PDF Not Supported'
      } else if (error.message?.includes('OpenAI API')) {
        errorMessage = 'AI service is temporarily unavailable.\n\n✓ Please try again in a moment\n✓ Or paste content directly'
        errorTitle = '🤖 AI Service Unavailable'
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Your session has expired.\n\n✓ Please sign in again\n✓ Then retry uploading'
        errorTitle = '🔐 Authentication Required'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Display error with title and longer duration for complex messages
      const duration = errorMessage.length > 100 ? 12000 : 8000
      toast.error(`${errorTitle}\n\n${errorMessage}`, { duration })
      
      // Log detailed error for debugging
      console.error('Full error details:', {
        error,
        stack: error.stack,
        message: error.message,
        response: error.response
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (showProjectDocumentCreator) {
    const projectName = selectedProjectForDocument 
      ? projects.find(p => p.id === selectedProjectForDocument)?.name 
      : undefined
    return <ProjectDocumentCreator onBack={handleBackFromDocument} projectName={projectName} userRole={currentRole} />
  }

  return (
    <div className="min-h-screen bg-background relative p-6">
      <div className="max-w-6xl mx-auto">
        {/* BRD Creator Section */}
        {canCreateProject && (
          <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-primary/5 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-cyan-500/10 rounded-lg neon-glow">
                    <FileText className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-1 bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
                      {currentRole === 'project_owner' ? 'Business Requirement Document' : 'Technical Design Document'}
                    </h3>
                    <p className="text-muted-foreground">
                      {currentRole === 'project_owner' 
                        ? 'Create a new BRD from scratch or upload an existing document to auto-populate your project'
                        : 'Create a new TDD from scratch or upload an existing document to auto-populate your project'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 neon-glow"
                        size="lg"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Existing
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card/95 backdrop-blur-sm border-primary/30 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                          Upload {currentRole === 'project_owner' ? 'BRD' : 'TDD'}
                        </DialogTitle>
                        <DialogDescription>
                          Upload or paste your existing {currentRole === 'project_owner' ? 'Business Requirement Document' : 'Technical Design Document'}. 
                          AI will automatically extract and populate your project information.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="upload-project-name">Project Name *</Label>
                          <Input
                            id="upload-project-name"
                            value={uploadProjectName}
                            onChange={(e) => setUploadProjectName(e.target.value)}
                            placeholder="Enter project name..."
                            className="mt-2 bg-input-background border-primary/30"
                            disabled={isProcessing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="file-upload">Upload Document</Label>
                          <Input
                            id="file-upload"
                            type="file"
                            accept=".txt,.md,.doc,.docx"
                            onChange={handleFileUpload}
                            className="mt-2 bg-input-background border-primary/30"
                            disabled={isProcessing}
                          />
                          {uploadedFile && (
                            <p className="text-xs text-cyan-400 mt-1">
                              ✓ Selected: {uploadedFile.name}
                            </p>
                          )}
                          {!uploadedFile && (
                            <div className="space-y-1 mt-1">
                              <p className="text-xs text-muted-foreground">
                                Supports .txt, .md, .doc, .docx files (max 10MB)
                              </p>
                              <p className="text-xs text-amber-400/80">
                                💡 Tip: For large documents, paste content directly for better results
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="brd-content">Or Paste Document Content</Label>
                          <Textarea
                            id="brd-content"
                            value={uploadedBRD}
                            onChange={(e) => {
                              setUploadedBRD(e.target.value)
                              // Clear file when pasting
                              if (e.target.value && uploadedFile) {
                                setUploadedFile(null)
                              }
                            }}
                            placeholder="Paste your BRD/TDD content here..."
                            className="mt-2 bg-input-background border-primary/30 min-h-[200px] font-mono text-sm"
                            disabled={isProcessing || !!uploadedFile}
                          />
                          {uploadedFile && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Clear the uploaded file to paste content
                            </p>
                          )}
                          {!uploadedFile && uploadedBRD && (
                            <p className="text-xs text-green-400/80 mt-1">
                              ✓ Pasting content often works better for complex documents
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={handleUploadBRD}
                          className="w-full bg-primary hover:bg-primary/90 neon-glow"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing Document...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Import & Create Project
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    onClick={handleCreateDocument}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-400/50 neon-glow"
                    size="lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Select a Project
            </h1>
            <p className="text-muted-foreground">
              Choose an existing project or create a new one
            </p>
          </div>

          {canCreateProject && (
            <div className="flex gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary hover:bg-primary/90 neon-glow">
                    <Plus className="w-4 h-4" />
                    New Project
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-sm border-primary/30">
                <DialogHeader>
                  <DialogTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                    Create New Project
                  </DialogTitle>
                  <DialogDescription>
                    Enter the details for your new project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="project-name">Project Name *</Label>
                    <Input
                      id="project-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name..."
                      className="mt-2 bg-input-background border-primary/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-description">Description</Label>
                    <Input
                      id="project-description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Brief project description..."
                      className="mt-2 bg-input-background border-primary/30"
                    />
                  </div>
                  <Button
                    onClick={handleCreateProject}
                    className="w-full bg-primary hover:bg-primary/90 neon-glow"
                  >
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

              {/* AI BRD Upload Button */}
              <Button 
                onClick={() => setIsBRDModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-cyan-600 to-primary hover:from-cyan-700 hover:to-primary/90 neon-glow"
              >
                <Sparkles className="w-4 h-4" />
                Parse BRD with AI
              </Button>
            </div>
          )}

          {/* BRD Upload Modal */}
          <BRDUploadModal
            open={isBRDModalOpen}
            onClose={() => setIsBRDModalOpen(false)}
            onSuccess={(projectId) => {
              // Find and select the newly created project
              const newProject = projects.find(p => p.id === projectId)
              if (newProject) {
                onProjectSelect(newProject)
              }
              // Refresh projects list
              window.location.reload()
            }}
          />
        </div>

        {projects.length === 0 ? (
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                {canCreateProject
                  ? 'Create your first project to get started'
                  : 'No projects available. Contact your administrator to create a project.'}
              </p>
              {canCreateProject && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2 bg-primary hover:bg-primary/90 neon-glow"
                >
                  <Plus className="w-4 h-4" />
                  Create First Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="border-primary/20 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all hover:scale-105 neon-glow relative"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onProjectSelect(project)}
                    >
                      <CardTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    {canDeleteProject && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mr-2 -mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setProjectToDelete(project)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent 
                  className="cursor-pointer"
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>By {project.createdByName || project.createdBy}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-primary">{project.completionPercentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all neon-glow"
                          style={{ width: `${project.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This will permanently delete the project and all its data including:
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>All modules and features</li>
                <li>All user stories</li>
                <li>All business rules</li>
                <li>All generated prompts</li>
                <li>All project documentation</li>
              </ul>
              <span className="text-destructive font-semibold">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}