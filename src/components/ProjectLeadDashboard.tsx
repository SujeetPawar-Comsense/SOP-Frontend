import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, Lock, Trash2, Settings } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { cn } from './ui/utils'
import ProjectInformationForm, { ProjectInformation, createDefaultProjectInformation } from './ProjectInformationForm'
import { UserStory } from './UserStoriesEditor'
import ModulesTable from './ModulesTableSimple'
import UserStoriesAndFeatures from './UserStoriesAndFeatures'
import { ModuleFeature } from './ExcelUtils'
import { FeatureTask } from './FeaturesTasksEditor'
import BusinessRulesEditor from './BusinessRulesEditor'
import { BusinessRulesConfig, createDefaultBusinessRulesConfig } from './BusinessRulesExcelUtils'
import ActionsInteractionsEditor from './ActionsInteractionsEditor'
import { ActionsInteractionsConfig, createDefaultActionsInteractionsConfig } from './ActionsInteractionsExcelUtils'
import { apiClient } from '../utils/api'
import { UserRole } from './RoleSelector'
import AIGenerationModal from './AIGenerationModal'
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
  DropdownMenuSeparator,
} from './ui/dropdown-menu'

interface ProjectLeadDashboardProps {
  projectId: string
  userRole: UserRole
}

export default function ProjectLeadDashboard({ projectId, userRole }: ProjectLeadDashboardProps) {
  const [activeSection, setActiveSection] = useState('projectInfo')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // BRD Analysis states
  const [isFromBRD, setIsFromBRD] = useState(false)
  const [isAnalyzingBRD, setIsAnalyzingBRD] = useState(false)
  const [brdAnalysisProgress, setBrdAnalysisProgress] = useState('')
  const [unlockedSections, setUnlockedSections] = useState<Set<string>>(new Set(['projectInfo']))
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [showAIGenerationModal, setShowAIGenerationModal] = useState(false)
  const [brdContentForGeneration, setBrdContentForGeneration] = useState('')
  
  // Data states
  const [projectInformation, setProjectInformation] = useState<ProjectInformation>(createDefaultProjectInformation())
  const [modules, setModules] = useState<ModuleFeature[]>([])
  const [userStories, setUserStories] = useState<UserStory[]>([])
  const [features, setFeatures] = useState<FeatureTask[]>([])
  const [businessRules, setBusinessRules] = useState<BusinessRulesConfig>(createDefaultBusinessRulesConfig())
  const [actionsInteractions, setActionsInteractions] = useState<ActionsInteractionsConfig>(createDefaultActionsInteractionsConfig())

  // Load all project data
  useEffect(() => {
    loadProjectData()
  }, [projectId])
  
  // Get project name
  useEffect(() => {
    getProjectDetails()
  }, [projectId])
  
  const getProjectDetails = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}`)
      if (response.project) {
        setProjectName(response.project.name)
      }
    } catch (error) {
      console.error('Failed to get project details:', error)
    }
  }
  
  const handleDeleteProject = async () => {
    setIsDeleting(true)
    try {
      const response = await apiClient.delete(`/projects/${projectId}`)
      if (response.success) {
        toast.success('Project deleted successfully')
        // Navigate back to project selector
        window.location.href = '/'
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }
  
  // Check if this project was created from BRD
  useEffect(() => {
    checkIfFromBRD()
  }, [projectId])
  
  const checkIfFromBRD = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}`)
      if (response.project?.from_brd) {
        setIsFromBRD(true)
        
        // Check if project information already exists (might have been created during BRD upload)
        const projectInfoResponse = await apiClient.get(`/projects/${projectId}/project-information`)
        
        if (projectInfoResponse.projectInformation && 
            (projectInfoResponse.projectInformation.vision || 
             projectInfoResponse.projectInformation.purpose)) {
          // Project overview already exists, no need to analyze again
          console.log('Project overview already exists from BRD creation')
          setProjectInformation(projectInfoResponse.projectInformation)
        } else if (response.project.brd_content) {
          // Project info doesn't exist, analyze the BRD
          console.log('Project overview not found, analyzing BRD...')
          analyzeBRDOverview(response.project.brd_content)
        }
      }
    } catch (error) {
      console.error('Failed to check BRD status:', error)
    }
  }
  
  const analyzeBRDOverview = async (brdContent: string) => {
    setIsAnalyzingBRD(true)
    setBrdAnalysisProgress('Analyzing your Business Requirements Document...')
    
    try {
      const response = await apiClient.post('/brd/analyze-overview', { brdContent })
      
      if (response.projectOverview) {
        const { businessIntent, requirements } = response.projectOverview
        
        // Convert to ProjectInformation format
        const projectInfo: ProjectInformation = {
          vision: businessIntent?.vision || '',
          purpose: businessIntent?.purpose || '',
          objectives: businessIntent?.objectives?.join('\n') || '',
          projectScope: JSON.stringify(businessIntent?.projectScope) || '',
          functionalRequirements: requirements?.functional?.join('\n') || '',
          nonFunctionalRequirements: requirements?.nonFunctional?.join('\n') || '',
          integrationRequirements: requirements?.integration?.join('\n') || '',
          reportingRequirements: requirements?.reporting?.join('\n') || ''
        }
        
        setProjectInformation(projectInfo)
        setBrdAnalysisProgress('Analysis complete! Review the extracted information below.')
        
        // Save to backend
        await saveProjectInformation(projectInfo)
      }
    } catch (error: any) {
      toast.error('Failed to analyze BRD: ' + error.message)
      setBrdAnalysisProgress('')
    } finally {
      setIsAnalyzingBRD(false)
    }
  }
  
  const handleSaveAndContinue = async () => {
    // Save current data
    await saveProjectInformation(projectInformation)
    
    // If this is a BRD project and we're moving from projectInfo to modules
    if (isFromBRD && activeSection === 'projectInfo') {
      // Get BRD content for generation
      try {
        const response = await apiClient.get(`/projects/${projectId}`)
        if (response.project?.brd_content) {
          setBrdContentForGeneration(response.project.brd_content)
          // Show AI generation modal
          setShowAIGenerationModal(true)
        } else {
          // No BRD content, just unlock next section normally
          unlockNextSection()
        }
      } catch (error) {
        console.error('Failed to get BRD content:', error)
        unlockNextSection()
      }
    } else {
      unlockNextSection()
    }
    
    toast.success('Progress saved!')
  }
  
  const unlockNextSection = () => {
    const sectionsOrder = ['projectInfo', 'modules', 'userStoriesFeatures', 'businessRules', 'actions']
    const currentIndex = sectionsOrder.indexOf(activeSection)
    
    if (currentIndex < sectionsOrder.length - 1) {
      const nextSection = sectionsOrder[currentIndex + 1]
      setUnlockedSections(prev => new Set([...prev, nextSection]))
      setActiveSection(nextSection)
    }
  }
  
  const handleAIGenerationComplete = async (generatedData: any) => {
    console.log('AI Generation complete:', generatedData)
    
    // Reload all data to get the newly generated content
    await loadProjectData()
    
    // Unlock all sections since we have generated everything
    setUnlockedSections(new Set(['projectInfo', 'modules', 'userStoriesFeatures', 'businessRules', 'actions']))
    
    // Move to modules section
    setActiveSection('modules')
    
    // Close the modal
    setShowAIGenerationModal(false)
    
    toast.success('AI has generated your project structure!')
  }
  
  // Convert project information to the format expected by the API
  const getProjectOverviewForAPI = () => {
    return {
      projectName: projectName,
      projectDescription: '', // This would come from project description
      businessIntent: {
        vision: projectInformation.vision,
        purpose: projectInformation.purpose,
        objectives: projectInformation.objectives.split('\n').filter(o => o.trim()),
        projectScope: projectInformation.projectScope ? JSON.parse(projectInformation.projectScope) : { inScope: [], outOfScope: [] }
      },
      requirements: {
        functional: projectInformation.functionalRequirements.split('\n').filter(r => r.trim()),
        nonFunctional: projectInformation.nonFunctionalRequirements.split('\n').filter(r => r.trim()),
        integration: projectInformation.integrationRequirements.split('\n').filter(r => r.trim()),
        reporting: projectInformation.reportingRequirements.split('\n').filter(r => r.trim())
      }
    }
  }

  const loadProjectData = async () => {
    setLoading(true)
    try {
      // Load project information
      const projectInfoResponse = await apiClient.get(`/projects/${projectId}/project-information`)
      if (projectInfoResponse.projectInformation) {
        setProjectInformation(projectInfoResponse.projectInformation)
      }

      // Load modules
      const modulesResponse = await apiClient.get(`/projects/${projectId}/modules`)
      if (modulesResponse.modules) {
        setModules(modulesResponse.modules)
      }

      // Load user stories
      const userStoriesResponse = await apiClient.get(`/projects/${projectId}/user-stories`)
      if (userStoriesResponse.userStories) {
        setUserStories(userStoriesResponse.userStories)
      }

      // Load features/tasks
      const featuresResponse = await apiClient.get(`/projects/${projectId}/features`)
      if (featuresResponse.features) {
        setFeatures(featuresResponse.features)
      }

      // Load business rules
      const businessRulesResponse = await apiClient.get(`/projects/${projectId}/business-rules`)
      if (businessRulesResponse.businessRules) {
        // Merge with default business rules to ensure all properties exist
        const defaultRules = createDefaultBusinessRulesConfig()
        setBusinessRules({
          ...defaultRules,
          ...businessRulesResponse.businessRules,
          categories: businessRulesResponse.businessRules.categories || defaultRules.categories
        })
      }

      // Note: UI/UX guidelines removed from new workflow

      // Load actions/interactions
      const actionsResponse = await apiClient.get(`/projects/${projectId}/actions`)
      if (actionsResponse.actions) {
        // Merge with default actions to ensure all properties exist
        const defaultActions = createDefaultActionsInteractionsConfig()
        
        // Normalize categories to ensure actions are strings
        const categoriesData = actionsResponse.actions.categories || defaultActions.categories
        const normalizedCategories = Array.isArray(categoriesData) ? categoriesData.map((cat: any) => {
          const actions = Array.isArray(cat.actions) ? cat.actions : []
          return {
            ...cat,
            actions: actions.map((action: any) => 
              typeof action === 'string' ? action : (action.name || '')
            ).filter(Boolean)
          }
        }) : defaultActions.categories
        
        // Normalize selectedActions to ensure they're all strings
        const normalizedSelectedActions: Record<string, string[]> = {}
        const selectedActionsData = actionsResponse.actions.selectedActions || {}
        
        if (selectedActionsData && typeof selectedActionsData === 'object') {
          Object.keys(selectedActionsData).forEach(categoryId => {
            const categoryActions = selectedActionsData[categoryId]
            // Ensure it's an array before mapping
            if (Array.isArray(categoryActions)) {
              normalizedSelectedActions[categoryId] = categoryActions.map((action: any) =>
                typeof action === 'string' ? action : (action.name || '')
              ).filter(Boolean)
            } else {
              // If it's not an array, initialize as empty array
              normalizedSelectedActions[categoryId] = []
            }
          })
        }
        
        setActionsInteractions({
          ...defaultActions,
          ...actionsResponse.actions,
          categories: normalizedCategories,
          selectedActions: normalizedSelectedActions
        })
      }
    } catch (error: any) {
      console.error('Failed to load project data:', error)
      toast.error('Failed to load project data')
    } finally {
      setLoading(false)
    }
  }

  const saveProjectInformation = async (data: ProjectInformation) => {
    setSaving(true)
    try {
      await apiClient.post(`/projects/${projectId}/project-information`, data)
      setProjectInformation(data)
      toast.success('Project information saved')
    } catch (error: any) {
      toast.error('Failed to save project information')
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const saveModules = async (modulesList: ModuleFeature[]) => {
    setSaving(true)
    try {
      await apiClient.post(`/projects/${projectId}/modules`, { modules: modulesList })
      setModules(modulesList)
      toast.success('Modules saved')
    } catch (error: any) {
      toast.error('Failed to save modules')
    } finally {
      setSaving(false)
    }
  }

  const saveUserStories = async (stories: UserStory[]) => {
    setSaving(true)
    try {
      await apiClient.post(`/projects/${projectId}/user-stories`, { userStories: stories })
      setUserStories(stories)
      toast.success('User stories saved')
    } catch (error: any) {
      toast.error('Failed to save user stories')
    } finally {
      setSaving(false)
    }
  }

  const saveFeatures = async (featuresList: FeatureTask[]) => {
    setSaving(true)
    try {
      await apiClient.post(`/projects/${projectId}/features`, { features: featuresList })
      setFeatures(featuresList)
      toast.success('Features/Tasks saved')
    } catch (error: any) {
      toast.error('Failed to save features/tasks')
    } finally {
      setSaving(false)
    }
  }

  const saveBusinessRules = async (rules: BusinessRulesConfig) => {
    setSaving(true)
    try {
      await apiClient.post(`/projects/${projectId}/business-rules`, { businessRules: rules })
      setBusinessRules(rules)
      toast.success('Business rules saved')
    } catch (error: any) {
      toast.error('Failed to save business rules')
    } finally {
      setSaving(false)
    }
  }

  const saveActionsInteractions = async (actions: ActionsInteractionsConfig) => {
    setSaving(true)
    try {
      await apiClient.post(`/projects/${projectId}/actions`, { actions })
      setActionsInteractions(actions)
      toast.success('Actions/Interactions saved')
    } catch (error: any) {
      toast.error('Failed to save actions/interactions')
    } finally {
      setSaving(false)
    }
  }

  // Calculate completion for each section
  const calculateProjectInfoCompletion = () => {
    if (!projectInformation) {
      return { completed: 0, total: 8 }
    }
    const fields = [
      projectInformation.vision,
      projectInformation.purpose,
      projectInformation.objectives,
      projectInformation.projectScope,
      projectInformation.functionalRequirements,
      projectInformation.nonFunctionalRequirements,
      projectInformation.integrationRequirements,
      projectInformation.reportingRequirements,
    ]
    const completed = fields.filter(field => field && String(field).trim() !== '').length
    return { completed, total: fields.length }
  }

  const calculateModulesCompletion = () => {
    if (!modules || !Array.isArray(modules)) {
      return { completed: 0, total: 5 }
    }
    const total = modules.length > 0 ? modules.length : 5 // Expect at least 5
    const completed = modules.filter(module => 
      module && 
      module.moduleName && module.moduleName.trim() !== '' &&
      module.description && module.description.trim() !== ''
    ).length
    return { completed, total }
  }

  const calculateUserStoriesCompletion = () => {
    if (!userStories || !Array.isArray(userStories)) {
      return { completed: 0, total: 0 }
    }
    const total = userStories.length
    const completed = userStories.filter(story => 
      story && 
      story.title && story.title.trim() !== '' &&
      story.userRole && story.userRole.trim() !== '' &&
      story.description && story.description.trim() !== '' &&
      story.moduleId && story.moduleId.trim() !== ''
    ).length
    return { completed, total }
  }

  const calculateFeaturesCompletion = () => {
    if (!features || !Array.isArray(features)) {
      return { completed: 0, total: 0 }
    }
    const total = features.length
    const completed = features.filter(feature => 
      feature && 
      feature.title && feature.title.trim() !== '' &&
      feature.description && feature.description.trim() !== '' &&
      feature.userStoryId && feature.userStoryId.trim() !== ''
    ).length
    return { completed, total }
  }

  const calculateBusinessRulesCompletion = () => {
    if (!businessRules || !businessRules.categories || !Array.isArray(businessRules.categories)) {
      return { completed: 0, total: 4 }
    }
    let total = 0
    let completed = 0
    businessRules.categories.forEach(category => {
      if (category && category.rules && Array.isArray(category.rules)) {
        total += category.rules.length
        completed += category.rules.filter(rule => 
          rule && 
          rule.name && rule.name.trim() !== '' &&
          rule.description && rule.description.trim() !== ''
        ).length
      }
    })
    return { completed, total: total > 0 ? total : 4 }
  }

  const calculateActionsCompletion = () => {
    if (!actionsInteractions || !actionsInteractions.selectedActions || !Array.isArray(actionsInteractions.selectedActions)) {
      return { completed: 0, total: 0 }
    }
    const total = actionsInteractions.selectedActions.length
    const completed = actionsInteractions.selectedActions.filter(action => 
      action && 
      action.name && action.name.trim() !== '' &&
      action.trigger && action.trigger.trim() !== ''
    ).length
    return { completed, total }
  }

  // Combined completion calculation for user stories and features
  const calculateStoriesAndFeaturesCompletion = () => {
    const storiesComp = calculateUserStoriesCompletion()
    const featuresComp = calculateFeaturesCompletion()
    
    const totalCompleted = storiesComp.completed + featuresComp.completed
    const totalItems = storiesComp.total + featuresComp.total
    
    return { completed: totalCompleted, total: totalItems }
  }

  const sections = [
    { 
      id: 'projectInfo', 
      label: 'Project Overview', 
      icon: '📋',
      description: 'Define project details and objectives',
      getCompletion: calculateProjectInfoCompletion
    },
    { 
      id: 'modules', 
      label: 'Modules', 
      icon: '📦',
      description: 'Define and organize project modules',
      getCompletion: calculateModulesCompletion
    },
    { 
      id: 'userStoriesFeatures', 
      label: 'User Stories & Features', 
      icon: '📚',
      description: 'Manage user stories and their features',
      getCompletion: calculateStoriesAndFeaturesCompletion
    },
    { 
      id: 'businessRules', 
      label: 'Business Rules', 
      icon: '⚖️',
      description: 'Define business logic and validation rules',
      getCompletion: calculateBusinessRulesCompletion
    },
    { 
      id: 'actions', 
      label: 'Actions & Interactions', 
      icon: '⚡',
      description: 'Configure user actions and system interactions',
      getCompletion: calculateActionsCompletion
    },
  ]

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Section Cards Navigation */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl">Project Setup{projectName ? `: ${projectName}` : ''}</h2>
          {userRole === 'project_owner' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => {
            const { completed, total } = section.getCompletion()
            const isComplete = completed === total && total > 0
            const isActive = activeSection === section.id
            const isLocked = isFromBRD && !unlockedSections.has(section.id)
            const progress = total > 0 ? (completed / total) * 100 : 0

            return (
              <Card
                key={section.id}
                className={cn(
                  "transition-all relative overflow-hidden",
                  !isLocked && "cursor-pointer hover:shadow-lg",
                  isActive && "border-primary border-2 shadow-lg shadow-primary/20",
                  isComplete && !isActive && "border-green-500/50",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isLocked && setActiveSection(section.id)}
              >
                {/* Progress bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      isComplete ? "bg-green-500" : "bg-primary"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {section.label}
                        {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {isLocked ? 'Complete previous section to unlock' : section.description}
                      </CardDescription>
                    </div>
                    <div className="px-3 py-1 rounded bg-gray-800/50 border border-gray-700/50 text-sm text-gray-400 flex-shrink-0">
                      {isLocked ? '🔒' : `${completed}/${total}`}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {activeSection === 'projectInfo' && (
          <ProjectInformationForm
            data={projectInformation}
            onChange={saveProjectInformation}
            isAnalyzing={isAnalyzingBRD}
            analysisProgress={brdAnalysisProgress}
            onSaveAndContinue={isFromBRD ? handleSaveAndContinue : undefined}
            isLocked={false}
            isProjectOverviewComplete={Boolean(
              projectInformation.vision &&
              projectInformation.purpose &&
              projectInformation.objectives
            )}
          />
        )}

        {activeSection === 'modules' && (
          <ModulesTable
            modules={modules}
            onChange={saveModules}
          />
        )}

        {activeSection === 'userStoriesFeatures' && (
          <UserStoriesAndFeatures
            modules={modules}
            userStories={userStories}
            features={features}
            onUserStoryEdit={(story) => {
              // Create a copy of the story and update it
              const updatedStories = userStories.map(s => 
                s.id === story.id ? story : s
              )
              saveUserStories(updatedStories)
            }}
            onFeatureEdit={(feature) => {
              // Create a copy of the feature and update it
              const updatedFeatures = features.map(f => 
                f.id === feature.id ? feature : f
              )
              saveFeatures(updatedFeatures)
            }}
            onUserStoryDelete={(storyId) => {
              const updatedStories = userStories.filter(s => s.id !== storyId)
              saveUserStories(updatedStories)
            }}
            onFeatureDelete={(featureId) => {
              const updatedFeatures = features.filter(f => f.id !== featureId)
              saveFeatures(updatedFeatures)
            }}
            onAddUserStory={(moduleId) => {
              // Create a new user story for the module
              const newStory: UserStory = {
                id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: 'New User Story',
                userRole: 'User',
                description: '',
                moduleId: moduleId,
                acceptanceCriteria: [],
                priority: 'Medium',
                estimatedEffort: '',
                status: 'Not Started'
              }
              saveUserStories([...userStories, newStory])
            }}
            onAddFeature={(userStoryId) => {
              // Create a new feature for the user story
              const userStory = userStories.find(s => s.id === userStoryId)
              if (userStory) {
                const newFeature: FeatureTask = {
                  id: `feature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  title: 'New Feature',
                  description: '',
                  userStoryId: userStoryId,
                  moduleId: userStory.moduleId,
                  technicalDetails: '',
                  dependencies: [],
                  estimatedHours: 0,
                  priority: 'Medium',
                  status: 'Not Started'
                }
                saveFeatures([...features, newFeature])
              }
            }}
            readOnly={userRole === 'viewer'}
          />
        )}

        {activeSection === 'businessRules' && (
          <BusinessRulesEditor
            config={businessRules}
            onChange={saveBusinessRules}
            availableModules={modules}
          />
        )}

        {activeSection === 'actions' && (
          <ActionsInteractionsEditor
            config={actionsInteractions}
            onChange={saveActionsInteractions}
            availableModules={modules}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-border/50">
          <Button
            onClick={() => {
              const currentIndex = sections.findIndex(s => s.id === activeSection)
              if (currentIndex > 0) {
                setActiveSection(sections[currentIndex - 1].id)
              }
            }}
            disabled={sections.findIndex(s => s.id === activeSection) === 0}
            variant="outline"
            className="gap-2 border-primary/50 hover:bg-primary/10"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Section {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length}
          </div>
          
          <Button
            onClick={() => {
              const currentIndex = sections.findIndex(s => s.id === activeSection)
              if (currentIndex < sections.length - 1) {
                setActiveSection(sections[currentIndex + 1].id)
              }
            }}
            disabled={sections.findIndex(s => s.id === activeSection) === sections.length - 1}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Generation Modal */}
      <AIGenerationModal
        open={showAIGenerationModal}
        onClose={() => setShowAIGenerationModal(false)}
        onComplete={handleAIGenerationComplete}
        projectId={projectId}
        projectOverview={getProjectOverviewForAPI()}
        brdContent={brdContentForGeneration}
      />

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectName}"? This will permanently delete:
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>All project information and settings</li>
                <li>All modules and features</li>
                <li>All user stories</li>
                <li>All business rules</li>
                <li>All generated prompts and documentation</li>
              </ul>
              <span className="text-destructive font-semibold block mt-2">
                This action cannot be undone.
              </span>
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
