import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { cn } from './ui/utils'
import ProjectInformationForm, { ProjectInformation, createDefaultProjectInformation } from './ProjectInformationForm'
import UserStoriesEditor, { UserStory } from './UserStoriesEditor'
import ModulesTable from './ModulesTableSimple'
import { ModuleFeature } from './ExcelUtils'
import FeaturesTasksEditor, { FeatureTask } from './FeaturesTasksEditor'
import BusinessRulesEditor from './BusinessRulesEditor'
import { BusinessRulesConfig, createDefaultBusinessRulesConfig } from './BusinessRulesExcelUtils'
import ActionsInteractionsEditor from './ActionsInteractionsEditor'
import { ActionsInteractionsConfig, createDefaultActionsInteractionsConfig } from './ActionsInteractionsExcelUtils'
import { apiClient } from '../utils/api'
import { UserRole } from './RoleSelector'

interface ProjectLeadDashboardProps {
  projectId: string
  userRole: UserRole
}

export default function ProjectLeadDashboard({ projectId, userRole }: ProjectLeadDashboardProps) {
  const [activeSection, setActiveSection] = useState('projectInfo')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
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

  const loadProjectData = async () => {
    setLoading(true)
    try {
      // Load project information
      const projectResponse = await apiClient.get(`/projects/${projectId}`)
      if (projectResponse.project.name) {
        setProjectInformation(prev => ({
          ...prev,
          ...projectResponse.project
        }))
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
      await apiClient.put(`/projects/${projectId}`, data)
      setProjectInformation(data)
      toast.success('Project information saved')
    } catch (error: any) {
      toast.error('Failed to save project information')
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

  const sections = [
    { 
      id: 'projectInfo', 
      label: 'Project Overview', 
      icon: '📋',
      getCompletion: calculateProjectInfoCompletion
    },
    { 
      id: 'modules', 
      label: 'Modules', 
      icon: '📦',
      getCompletion: calculateModulesCompletion
    },
    { 
      id: 'userStories', 
      label: 'User Stories', 
      icon: '📝',
      getCompletion: calculateUserStoriesCompletion
    },
    { 
      id: 'features', 
      label: 'Features/Tasks', 
      icon: '🔧',
      getCompletion: calculateFeaturesCompletion
    },
    { 
      id: 'businessRules', 
      label: 'Business Rules', 
      icon: '⚖️',
      getCompletion: calculateBusinessRulesCompletion
    },
    { 
      id: 'actions', 
      label: 'Actions & Interactions', 
      icon: '⚡',
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
        <h2 className="text-2xl mb-4">Project Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => {
            const { completed, total } = section.getCompletion()
            const isComplete = completed === total && total > 0
            const isActive = activeSection === section.id
            const progress = total > 0 ? (completed / total) * 100 : 0

            return (
              <Card
                key={section.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg relative overflow-hidden",
                  isActive && "border-primary border-2 shadow-lg shadow-primary/20",
                  isComplete && !isActive && "border-green-500/50"
                )}
                onClick={() => setActiveSection(section.id)}
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
                      <CardTitle className="text-base">{section.label}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {section.description}
                      </CardDescription>
                    </div>
                    <div className="px-3 py-1 rounded bg-gray-800/50 border border-gray-700/50 text-sm text-gray-400 flex-shrink-0">
                      {completed}/{total}
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
          />
        )}

        {activeSection === 'modules' && (
          <ModulesTable
            modules={modules}
            onChange={saveModules}
          />
        )}

        {activeSection === 'userStories' && (
          <UserStoriesEditor
            userStories={userStories}
            onChange={saveUserStories}
            modules={modules}
          />
        )}

        {activeSection === 'features' && (
          <FeaturesTasksEditor
            features={features}
            onChange={saveFeatures}
            userStories={userStories}
            modules={modules}
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
    </div>
  )
}
