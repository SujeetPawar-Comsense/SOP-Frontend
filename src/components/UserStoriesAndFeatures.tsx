import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  BookOpen
} from 'lucide-react'
import { ModuleFeature } from './ExcelUtils'
import { UserStory } from './UserStoriesEditor'
import { FeatureTask } from './FeaturesTasksEditor'
import { cn } from './ui/utils'

interface UserStoriesAndFeaturesProps {
  modules: ModuleFeature[]
  userStories: UserStory[]
  features: FeatureTask[]
  onUserStoryEdit?: (userStory: UserStory) => void
  onFeatureEdit?: (feature: FeatureTask) => void
  onUserStoryDelete?: (userStoryId: string) => void
  onFeatureDelete?: (featureId: string) => void
  onAddUserStory?: (moduleId: string) => void
  onAddFeature?: (userStoryId: string) => void
  readOnly?: boolean
}

export default function UserStoriesAndFeatures({
  modules,
  userStories,
  features,
  onUserStoryEdit,
  onFeatureEdit,
  onUserStoryDelete,
  onFeatureDelete,
  onAddUserStory,
  onAddFeature,
  readOnly = false
}: UserStoriesAndFeaturesProps) {
  const [expandedUserStories, setExpandedUserStories] = useState<Set<string>>(new Set())
  const [selectedUserStory, setSelectedUserStory] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  const toggleUserStory = (userStoryId: string) => {
    const newExpanded = new Set(expandedUserStories)
    if (newExpanded.has(userStoryId)) {
      newExpanded.delete(userStoryId)
    } else {
      newExpanded.add(userStoryId)
    }
    setExpandedUserStories(newExpanded)
    setSelectedUserStory(userStoryId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'destructive'
      case 'Medium':
        return 'secondary'
      case 'Low':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getUserStoryStats = (userStoryId: string) => {
    const storyFeatures = features.filter(f => f.userStoryId === userStoryId)
    const completedFeatures = storyFeatures.filter(f => f.status === 'Completed').length
    
    return {
      totalFeatures: storyFeatures.length,
      completedFeatures
    }
  }

  const getModuleName = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    return module?.moduleName || 'Unknown Module'
  }

  // Group user stories by module
  const storiesByModule = userStories.reduce((acc, story) => {
    const moduleId = story.moduleId || 'unassigned'
    if (!acc[moduleId]) {
      acc[moduleId] = []
    }
    acc[moduleId].push(story)
    return acc
  }, {} as Record<string, UserStory[]>)

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          User Stories & Features
        </CardTitle>
        <CardDescription>
          Manage all user stories and their associated features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userStories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No user stories available</p>
            <p className="text-sm mt-2">Start by adding user stories to your modules</p>
          </div>
        ) : (
          <>
            {/* Display user stories grouped by module */}
            {Object.entries(storiesByModule).map(([moduleId, moduleStories]) => (
              <div key={moduleId} className="space-y-2">
                {/* Module header */}
                <div className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {moduleId === 'unassigned' ? 'Unassigned' : getModuleName(moduleId)}
                  </Badge>
                  <span className="text-xs">({moduleStories.length} stories)</span>
                </div>
                
                {/* User stories for this module */}
                {moduleStories.map((userStory) => {
                  const isStoryExpanded = expandedUserStories.has(userStory.id)
                  const storyFeatures = features.filter(f => f.userStoryId === userStory.id)
                  const storyStats = getUserStoryStats(userStory.id)
                  const isStorySelected = selectedUserStory === userStory.id

                  return (
                    <div key={userStory.id} className="border rounded-lg border-border/50 overflow-hidden">
                      {/* User Story Header */}
                      <div
                        className={cn(
                          "p-4 cursor-pointer transition-colors hover:bg-accent/30",
                          isStorySelected && "bg-accent/20 border-l-4 border-l-cyan-400"
                        )}
                        onClick={() => toggleUserStory(userStory.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleUserStory(userStory.id)
                            }}
                          >
                            {isStoryExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <FileText className="w-5 h-5 text-cyan-400 mt-0.5" />
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-base flex items-center gap-2">
                                  {userStory.title}
                                  <Badge variant={getPriorityColor(userStory.priority)} className="text-xs">
                                    {userStory.priority}
                                  </Badge>
                                  {getStatusIcon(userStory.status)}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  As {userStory.userRole}: {userStory.description}
                                </p>
                                {userStory.acceptanceCriteria && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <strong>Acceptance Criteria:</strong> {userStory.acceptanceCriteria}
                                  </div>
                                )}
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>
                                    Features: {storyStats.completedFeatures}/{storyStats.totalFeatures}
                                  </span>
                                </div>
                              </div>
                              
                              {!readOnly && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onAddFeature?.(userStory.id)
                                    }}
                                    title="Add Feature"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onUserStoryEdit?.(userStory)
                                    }}
                                    title="Edit User Story"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onUserStoryDelete?.(userStory.id)
                                    }}
                                    title="Delete User Story"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <Collapsible open={isStoryExpanded}>
                        <CollapsibleContent>
                          <div className="pl-12 bg-accent/10 border-t border-border/30">
                            {storyFeatures.length === 0 ? (
                              <div className="py-4 px-4 text-sm text-muted-foreground">
                                No features in this user story
                              </div>
                            ) : (
                              storyFeatures.map((feature) => {
                                const isFeatureSelected = selectedFeature === feature.id
                                
                                return (
                                  <div
                                    key={feature.id}
                                    className={cn(
                                      "p-4 border-b border-border/20 last:border-b-0 cursor-pointer transition-colors hover:bg-accent/20",
                                      isFeatureSelected && "bg-accent/15 border-l-4 border-l-green-400"
                                    )}
                                    onClick={() => setSelectedFeature(feature.id)}
                                  >
                                    <div className="flex items-start gap-3">
                                      <Layers className="w-4 h-4 text-green-400 mt-0.5" />
                                      
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-medium text-sm flex items-center gap-2">
                                              {feature.title}
                                              <Badge variant={getPriorityColor(feature.priority)} className="text-xs scale-90">
                                                {feature.priority}
                                              </Badge>
                                              {getStatusIcon(feature.status)}
                                            </h5>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {feature.description}
                                            </p>
                                            {feature.estimatedHours && (
                                              <div className="text-xs text-muted-foreground mt-2">
                                                Est. {feature.estimatedHours}h
                                                {feature.assignee && ` • Assigned to: ${feature.assignee}`}
                                              </div>
                                            )}
                                          </div>
                                          
                                          {!readOnly && (
                                            <div className="flex gap-1">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  onFeatureEdit?.(feature)
                                                }}
                                                title="Edit Feature"
                                              >
                                                <Edit2 className="w-3 h-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  onFeatureDelete?.(feature.id)
                                                }}
                                                title="Delete Feature"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )
                })}
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}
