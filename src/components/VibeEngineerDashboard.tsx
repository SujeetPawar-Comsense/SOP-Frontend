import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Loader2, Book, Search, Zap, ChevronLeft, ChevronRight, Code2, Sparkles, ArrowLeft, Copy, FileText, ChevronDown, CheckCircle2, FileCode, ArrowUp, Calendar, Database, Percent, Image, Shield, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { modulesAPI, projectAPI, featuresAPI, vibePromptsAPI } from '../utils/api'
import VibePromptGenerator from './VibePromptGenerator'
import { Textarea } from './ui/textarea'

interface VibeEngineerDashboardProps {
  projectId: string
}

interface Module {
  id: string
  module_name?: string
  moduleName?: string
  description?: string
  priority?: string
  status?: string
  business_impact?: string
  businessImpact?: string
  dependencies?: string
}

interface Feature {
  id: string
  title?: string
  description?: string
  moduleId?: string
  userStoryId?: string
}

interface ModuleImplementation {
  code: string
  developerNotes: string
  aiPromptsUsed: number
  status: string
}

export default function VibeEngineerDashboard({ projectId }: VibeEngineerDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<Module[]>([])
  const [projectData, setProjectData] = useState<any>(null)
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [features, setFeatures] = useState<Feature[]>([])
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name-asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  
  // Module detail view state
  const [selectedLayer, setSelectedLayer] = useState<string>('ui-components')
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [generatingPrompt, setGeneratingPrompt] = useState(false)
  const [implementation, setImplementation] = useState<ModuleImplementation>({
    code: '',
    developerNotes: '',
    aiPromptsUsed: 0,
    status: 'Todo'
  })

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    setLoading(true)
    try {
      // Load project details
      const projectResponse = await projectAPI.getById(projectId)
      if (projectResponse.data) {
        setProjectData(projectResponse.data)
      }

      // Load modules
      const modulesResponse = await modulesAPI.get(projectId)
      if (modulesResponse.modules) {
        setModules(modulesResponse.modules)
      }

      // Load features
      const featuresResponse = await featuresAPI.get(projectId)
      if (featuresResponse.features) {
        setFeatures(featuresResponse.features)
      }
    } catch (error: any) {
      console.error('Failed to load project data:', error)
      toast.error('Failed to load project data')
    } finally {
      setLoading(false)
    }
  }

  const loadModuleDetails = async (module: Module) => {
    setSelectedModule(module)
    // Filter features for this module
    const moduleFeatures = features.filter(f => f.moduleId === module.id)
    // Features are already loaded, just set the selected module
  }

  const handleGeneratePrompt = async (layer: string) => {
    if (!selectedModule) return
    
    setGeneratingPrompt(true)
    try {
      const layerMap: Record<string, string> = {
        'ui-components': 'UI Components',
        'api-endpoints': 'API Endpoints',
        'database-schema': 'Database Schema',
        'business-logic': 'Business Logic',
        'authentication': 'Authentication',
        'validation': 'Validation',
        'error-handling': 'Error Handling',
        'testing': 'Testing'
      }

      const developmentType = layerMap[layer] || 'UI Components'

      // Generate prompt with selected module and feature
      const prompt = await vibePromptsAPI.generate(
        projectId, 
        developmentType,
        [], // previousOutputs will be fetched by backend
        selectedModule.id,
        selectedFeature?.id
      )

      setGeneratedPrompt(prompt.generatedPrompt || prompt.prompt?.generated_prompt || '')
      setCurrentPromptId(prompt.prompt?.id || null)
      setImplementation(prev => ({
        ...prev,
        aiPromptsUsed: prev.aiPromptsUsed + 1
      }))
      toast.success('Prompt generated successfully!')
    } catch (error: any) {
      console.error('Failed to generate prompt:', error)
      toast.error(error.message || 'Failed to generate prompt')
    } finally {
      setGeneratingPrompt(false)
    }
  }

  const handleSaveImplementation = async () => {
    if (!currentPromptId) {
      toast.error('No prompt generated yet. Please generate a prompt first.')
      return
    }

    try {
      await vibePromptsAPI.saveImplementation(
        currentPromptId,
        implementation.code,
        implementation.developerNotes
      )
      toast.success('Implementation saved successfully!')
      setImplementation(prev => ({
        ...prev,
        status: 'In Progress'
      }))
    } catch (error: any) {
      console.error('Failed to save implementation:', error)
      toast.error(error.message || 'Failed to save implementation')
    }
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt)
    toast.success('Prompt copied to clipboard!')
  }

  const handleModuleClick = (module: Module) => {
    loadModuleDetails(module)
  }

  // Normalize module data
  const normalizedModules = useMemo(() => {
    return modules.map(module => ({
      id: module.id,
      name: module.module_name || module.moduleName || 'Unnamed Module',
      description: module.description || '',
      priority: module.priority || 'Medium',
      status: module.status || 'Not Started',
      businessImpact: module.business_impact || module.businessImpact || ''
    }))
  }, [modules])

  // Filter and sort modules
  const filteredAndSortedModules = useMemo(() => {
    let filtered = normalizedModules.filter(module => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || module.priority === priorityFilter
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || module.status === statusFilter
      
      return matchesSearch && matchesPriority && matchesStatus
    })

    // Sort modules
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'priority-high':
          const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 }
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 99) - 
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 99)
        case 'priority-low':
          const priorityOrderLow = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 }
          return (priorityOrderLow[b.priority as keyof typeof priorityOrderLow] || 99) - 
                 (priorityOrderLow[a.priority as keyof typeof priorityOrderLow] || 99)
        default:
          return 0
      }
    })

    return filtered
  }, [normalizedModules, searchQuery, priorityFilter, statusFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedModules.length / itemsPerPage)
  const paginatedModules = filteredAndSortedModules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedModules(new Set(paginatedModules.map(m => m.id)))
    } else {
      setSelectedModules(new Set())
    }
  }

  const handleModuleToggle = (moduleId: string) => {
    const newSelected = new Set(selectedModules)
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId)
    } else {
      newSelected.add(moduleId)
    }
    setSelectedModules(newSelected)
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'destructive'
      case 'High':
        return 'default'
      case 'Medium':
        return 'secondary'
      case 'Low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const allSelectedOnPage = paginatedModules.length > 0 && 
    paginatedModules.every(m => selectedModules.has(m.id))
  const someSelectedOnPage = paginatedModules.some(m => selectedModules.has(m.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Developer Onboarding Hub</h1>
                <p className="text-sm text-muted-foreground">
                  Access features, AI prompts, and project guidance.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Active
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {filteredAndSortedModules.length} features to implement
                </p>
              </div>
            </div>
          </div>
      </div>

        {/* Tabs */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Code2 className="h-4 w-4 mr-2" />
              Features & Modules
            </TabsTrigger>
            <TabsTrigger value="ai-assistance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sparkles className="h-4 w-4 mr-2" />
              AI Assistance
          </TabsTrigger>
        </TabsList>

          {/* Features & Modules Tab */}
          <TabsContent value="features" className="mt-0">
            {/* Filters and Search */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10 bg-background/50 border-primary/20"
                  />
                </div>
              </div>
              <Select value={priorityFilter} onValueChange={(value) => {
                setPriorityFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[150px] bg-background/50 border-primary/20">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[150px] bg-background/50 border-primary/20">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] bg-background/50 border-primary/20">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="priority-high">Priority (High)</SelectItem>
                  <SelectItem value="priority-low">Priority (Low)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {paginatedModules.length} of {filteredAndSortedModules.length} features</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="w-[100px] bg-background/50 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 per page</SelectItem>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Select All Checkbox */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allSelectedOnPage}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All
                </Label>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedModules.map((module) => {
                const isSelected = selectedModules.has(module.id)
                const isActiveModule = selectedModule?.id === module.id
                return (
                  <Card
                    key={module.id}
                    className={`cursor-pointer transition-all border-2 ${
                      isActiveModule
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-primary/20 bg-card/50 hover:border-primary/40'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      const clickedModule = normalizedModules.find(m => m.id === module.id) || module
                      if (selectedModule?.id === clickedModule.id) {
                        // Deselect if clicking the same module
                        setSelectedModule(null)
                      } else {
                        // Select the clicked module
                        handleModuleClick(clickedModule)
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/50'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {module.name}
                            </h3>
                            <Badge
                              variant={getPriorityBadgeVariant(module.priority)}
                              className="shrink-0"
                            >
                              {module.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {module.description || 'No description available'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-8">
              <Button
                variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-primary/20"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? 'bg-primary'
                        : 'border-primary/20'
                    }
                  >
                    {page}
              </Button>
                ))}
                    <Button
                      variant="outline"
                      size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="border-primary/20"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
            </div>
          )}

            {/* Call to Action - Only show when no module is selected */}
            {!selectedModule && (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">
                      Select a Feature to Get Started
                    </h3>
                  </div>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Choose a feature from the grid above to access AI prompts, implementation tools, and tracking
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Selected Module Features Section */}
            {selectedModule && (
              <div className="mt-8 space-y-6">
                {/* Module Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {selectedModule.module_name || selectedModule.moduleName || 'Selected Module'}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedModule.description || 'Module description'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedModule(null)
                      setGeneratedPrompt('')
                      setSelectedLayer('ui-components')
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>

                {/* Module Overview */}
                <Card className="border-primary/20 bg-card/50">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Priority:</span>
                        <Badge variant={getPriorityBadgeVariant(selectedModule.priority || 'Medium')} className="ml-2">
                          {selectedModule.priority || 'Medium'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={getPriorityBadgeVariant(selectedModule.priority || 'Medium')} className="ml-2">
                          {selectedModule.status || 'Not Started'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Dependencies:</span>
                        <p className="text-sm mt-1">{selectedModule.dependencies || 'None'}</p>
                      </div>
                      <div className="md:col-span-3">
                        <span className="text-sm text-muted-foreground">Business Impact:</span>
                        <p className="text-sm mt-1">{selectedModule.business_impact || selectedModule.businessImpact || 'Not specified'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Features */}
                <Card className="border-primary/20 bg-card/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">
                        Recommended Features ({features.filter(f => f.moduleId === selectedModule.id).length})
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {features.filter(f => f.moduleId === selectedModule.id).length > 0 ? (
                        features.filter(f => f.moduleId === selectedModule.id).map((feature) => {
                          const isSelected = selectedFeature?.id === feature.id
                          return (
                            <div
                              key={feature.id}
                              onClick={() => setSelectedFeature(isSelected ? null : feature)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
                                  : 'bg-primary/10 border-primary/20 hover:border-primary/40'
                              }`}
                            >
                              <CheckCircle2 className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-primary/60'}`} />
                              <span className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>
                                {feature.title || 'Untitled Feature'}
                              </span>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No features available for this module
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Prompt Generator & Implementation Output */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  {/* Left: AI Prompt Generator */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">AI Prompt Generator</h3>
                      <p className="text-sm text-muted-foreground">Context-aware prompts for each layer</p>
                    </div>

                    {/* Prompt Type Selection */}
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { id: 'ui-components', label: 'UI Components', icon: FileText },
                        { id: 'api-endpoints', label: 'API Endpoints', icon: Code2 },
                        { id: 'database-schema', label: 'Database', icon: Database },
                        { id: 'business-logic', label: 'Business Logic', icon: Percent },
                        { id: 'authentication', label: 'Auth', icon: Shield },
                        { id: 'validation', label: 'Validation', icon: CheckSquare },
                        { id: 'testing', label: 'Testing', icon: CheckSquare }
                      ].map((layer) => {
                        const Icon = layer.icon
                        const isSelected = selectedLayer === layer.id
                        return (
                          <button
                            key={layer.id}
                            onClick={() => setSelectedLayer(layer.id)}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-primary/20 bg-card/50 hover:border-primary/40'
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-green-500' : 'text-muted-foreground'}`} />
                          </button>
                        )
                      })}
                    </div>

                    {/* Selected Layer Card */}
                    <Card className="border-primary/20 bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {selectedLayer === 'ui-components' && 'UI Components'}
                              {selectedLayer === 'api-endpoints' && 'API Endpoints'}
                              {selectedLayer === 'database-schema' && 'Database Schema'}
                              {selectedLayer === 'business-logic' && 'Business Logic'}
                              {selectedLayer === 'authentication' && 'Authentication'}
                              {selectedLayer === 'validation' && 'Validation'}
                              {selectedLayer === 'testing' && 'Testing'}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {selectedLayer === 'ui-components' && 'Frontend components and styling'}
                              {selectedLayer === 'api-endpoints' && 'RESTful API endpoints and routes'}
                              {selectedLayer === 'database-schema' && 'Database tables and relationships'}
                              {selectedLayer === 'business-logic' && 'Core business rules and logic'}
                              {selectedLayer === 'authentication' && 'User authentication and authorization'}
                              {selectedLayer === 'validation' && 'Data validation and sanitization'}
                              {selectedLayer === 'testing' && 'Unit and integration tests'}
                            </p>
                          </div>
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            {selectedModule?.priority || 'High'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Generated Prompt Preview */}
                    <Card className="border-primary/20 bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-foreground">Generated Prompt Preview</h4>
                          <div className="flex items-center gap-3">
                            {generatedPrompt && (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  {generatedPrompt.split('\n').length} lines • {generatedPrompt.length} chars
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCopyPrompt}
                                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Prompt
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {generatedPrompt ? (
                          <div className="bg-background/50 rounded-lg p-4 border border-primary/20 max-h-96 overflow-y-auto">
                            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                              {generatedPrompt}
                            </pre>
                          </div>
                        ) : (
                          <div className="bg-background/50 rounded-lg p-8 border border-primary/20 border-dashed text-center">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Select a layer and generate a prompt to get started
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Generate Code Button */}
                    <Button
                      onClick={() => handleGeneratePrompt(selectedLayer)}
                      disabled={generatingPrompt || !selectedModule}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      size="lg"
                    >
                      {generatingPrompt ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Generate Code
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      This prompt includes full project context, feature details, dependencies, and ui components best practices. Use it with your AI assistant for context-aware code generation.
                    </p>
                  </div>

                  {/* Right: Implementation Output */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">Implementation Output</h3>
                      <p className="text-sm text-muted-foreground">Track your code and progress</p>
                    </div>

                    {/* Code / Implementation Notes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Code / Implementation Notes</Label>
                        <Button
                          onClick={handleSaveImplementation}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          disabled={!currentPromptId || !implementation.code.trim()}
                        >
                          <FileCode className="h-4 w-4 mr-2" />
                          Save Implementation
                        </Button>
                      </div>
                      <Textarea
                        value={implementation.code}
                        onChange={(e) => setImplementation(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Paste your implementation code, file paths, or implementation details..."
                        className="min-h-[200px] bg-background/50 border-primary/20 resize-none"
                      />
                    </div>

                    {/* Developer Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Developer Notes</Label>
                      <Textarea
                        value={implementation.developerNotes}
                        onChange={(e) => setImplementation(prev => ({ ...prev, developerNotes: e.target.value }))}
                        placeholder="Add notes about challenges, decisions, or questions..."
                        className="min-h-[150px] bg-background/50 border-primary/20 resize-none"
                      />
                    </div>

                    {/* AI Prompts Used & Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-primary/20 bg-card/50">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">AI Prompts Used</p>
                          <p className="text-2xl font-bold text-foreground">{implementation.aiPromptsUsed}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-primary/20 bg-card/50">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <Badge variant="outline" className="mt-1">
                            {implementation.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </TabsContent>

          {/* AI Assistance Tab */}
          <TabsContent value="ai-assistance" className="mt-0">
          <VibePromptGenerator
            projectId={projectId}
            projectName={projectData?.name || 'Project'}
            applicationType={projectData?.application_type}
          />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

// Module Detail View Component
interface ModuleDetailViewProps {
  module: Module
  features: Feature[]
  selectedLayer: string
  onLayerChange: (layer: string) => void
  generatedPrompt: string
  onGeneratedPromptChange: (prompt: string) => void
  generatingPrompt: boolean
  onGeneratePrompt: (layer: string) => void
  onCopyPrompt: () => void
  implementation: ModuleImplementation
  onImplementationChange: (impl: ModuleImplementation) => void
  onBack: () => void
}

function ModuleDetailView({
  module,
  features,
  selectedLayer,
  onLayerChange,
  generatedPrompt,
  onGeneratedPromptChange,
  generatingPrompt,
  onGeneratePrompt,
  onCopyPrompt,
  implementation,
  onImplementationChange,
  onBack
}: ModuleDetailViewProps) {
  const moduleName = module.module_name || module.moduleName || 'Unnamed Module'
  const moduleDescription = module.description || ''
  const priority = module.priority || 'Medium'
  const status = module.status || 'Not Started'
  const businessImpact = module.business_impact || module.businessImpact || ''
  const dependencies = module.dependencies || ''

  const layers = [
    { id: 'ui-components', label: 'UI Components', icon: FileCode },
    { id: 'api-endpoints', label: 'API Endpoints', icon: Code2 },
    { id: 'database-schema', label: 'Database Schema', icon: FileText },
    { id: 'business-logic', label: 'Business Logic', icon: Sparkles },
    { id: 'authentication', label: 'Authentication', icon: CheckCircle2 },
    { id: 'validation', label: 'Validation', icon: CheckCircle2 },
    { id: 'error-handling', label: 'Error Handling', icon: CheckCircle2 },
    { id: 'testing', label: 'Testing', icon: CheckCircle2 }
  ]

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'destructive'
      case 'High':
        return 'default'
      case 'Medium':
        return 'secondary'
      case 'Low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const promptLines = generatedPrompt.split('\n').length
  const promptChars = generatedPrompt.length

  return (
    <div className="space-y-6">
      {/* Back Button and Header */}
      <div className="flex items-center justify-between">
              <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        <Select value={implementation.status} onValueChange={(value) => {
          onImplementationChange({ ...implementation, status: value })
        }}>
          <SelectTrigger className="w-[150px] bg-background/50 border-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todo">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Module Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{moduleName}</h1>
        <p className="text-muted-foreground">{moduleDescription}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Module Overview Card */}
          <Card className="border-primary/20 bg-card/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Module Overview</h3>
                  <Badge variant={getPriorityBadgeVariant(priority)} className="ml-auto">
                    {status}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <Badge variant={getPriorityBadgeVariant(priority)} className="ml-2">
                      {priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Dependencies:</span>
                    <p className="text-sm mt-1">{dependencies || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Business Impact:</span>
                    <p className="text-sm mt-1">{businessImpact || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Features */}
          <Card className="border-primary/20 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  Recommended Features ({features.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.length > 0 ? (
                  features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature.title || 'Untitled Feature'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No features available for this module
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Prompt Generator */}
          <Card className="border-primary/20 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">AI Prompt Generator</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Context-aware prompts for each layer.
              </p>
              
              {/* Layer Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {layers.map((layer) => {
                  const Icon = layer.icon
                  return (
                    <Button
                      key={layer.id}
                      variant={selectedLayer === layer.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        onLayerChange(layer.id)
                        if (!generatedPrompt) {
                          onGeneratePrompt(layer.id)
                        }
                      }}
                      className={`h-16 flex flex-col items-center justify-center gap-1 ${
                        selectedLayer === layer.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/50 border-primary/20'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[10px] text-center leading-tight">
                        {layer.label}
                      </span>
                    </Button>
                  )
                })}
              </div>

              {/* Selected Layer Card */}
              <Card className="border-primary/30 bg-primary/5 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded"></div>
                      <h4 className="font-medium">
                        {layers.find(l => l.id === selectedLayer)?.label || 'UI Components'}
                      </h4>
                    </div>
                    <Badge variant={getPriorityBadgeVariant(priority)}>
                      {priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedLayer === 'ui-components' && 'Frontend components and styling.'}
                    {selectedLayer === 'api-endpoints' && 'RESTful API endpoints and routes.'}
                    {selectedLayer === 'database-schema' && 'Database tables and relationships.'}
                    {selectedLayer === 'business-logic' && 'Core business rules and logic.'}
                    {selectedLayer === 'authentication' && 'User authentication and authorization.'}
                    {selectedLayer === 'validation' && 'Data validation and sanitization.'}
                    {selectedLayer === 'error-handling' && 'Error handling and logging.'}
                    {selectedLayer === 'testing' && 'Unit and integration tests.'}
                  </p>
                  </CardContent>
                </Card>

              {/* Generated Prompt Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Generated Prompt Preview</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    {generatedPrompt && (
                      <>
                        <span className="text-xs text-muted-foreground">
                          {promptLines} lines
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {promptChars} chars
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onCopyPrompt}
                          className="border-primary/20"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Prompt
                        </Button>
                      </>
                    )}
                  </div>
            </div>
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => onGeneratedPromptChange(e.target.value)}
                  placeholder="Click on a layer above to generate a prompt..."
                  className="min-h-[200px] bg-background/50 border-primary/20 font-mono text-sm"
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onGeneratePrompt(selectedLayer)}
                    disabled={generatingPrompt}
                    className="bg-primary hover:bg-primary/90 flex-1"
                    size="lg"
                  >
                    {generatingPrompt ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Code
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary/20"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                {generatedPrompt && (
                  <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      This prompt includes full project content, feature details, dependencies, and {selectedLayer.replace('-', ' ')} best practices. Use it with your AI assistant for context-aware code generation.
                    </p>
            </div>
          )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Implementation Output */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Implementation Output</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Track your code and progress.
              </p>

              {/* Code / Implementation Notes */}
              <Card className="border-primary/20 bg-background/30 mb-4">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Code / Implementation Notes</h4>
                  <Textarea
                    value={implementation.code}
                    onChange={(e) => onImplementationChange({ ...implementation, code: e.target.value })}
                    placeholder="Paste your implementation code, file paths, or implementation details..."
                    className="min-h-[200px] bg-background/50 border-primary/20 font-mono text-sm"
                  />
                </CardContent>
              </Card>

              {/* Developer Notes */}
              <Card className="border-primary/20 bg-background/30 mb-4">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Developer Notes</h4>
                  <Textarea
                    value={implementation.developerNotes}
                    onChange={(e) => onImplementationChange({ ...implementation, developerNotes: e.target.value })}
                    placeholder="Add notes about challenges, decisions, or questions..."
                    className="min-h-[150px] bg-background/50 border-primary/20 text-sm"
                  />
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="border-primary/20 bg-background/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">AI Prompts Used</span>
                      <p className="text-2xl font-bold">{implementation.aiPromptsUsed}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status</span>
                      <p className="text-2xl font-bold">{implementation.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
