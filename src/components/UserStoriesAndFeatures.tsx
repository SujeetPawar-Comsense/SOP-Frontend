import { useState, useEffect } from 'react'
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
import AIDynamicEnhancement from './AIDynamicEnhancement'
import FeatureManagementCard from './FeatureManagementCard'

interface UserStoriesAndFeaturesProps {
  modules: ModuleFeature[]
  userStories: UserStory[]
  features: FeatureTask[]
  projectId?: string
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
  projectId,
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

  // Monitor when features change
  useEffect(() => {
    console.log('🔄 Features updated in UserStoriesAndFeatures component')
    console.log('📊 Total features:', features?.length || 0)
    if (features && features.length > 0) {
      console.log('📝 Sample feature:', features[0])
      console.log('🔗 All feature-story mappings:', features.map(f => ({
        featureId: f.id,
        featureTitle: f.title,
        userStoryId: f.userStoryId,
        userStoryIdType: typeof f.userStoryId
      })))
    }
    
    if (userStories && userStories.length > 0) {
      console.log('📚 User story IDs:', userStories.map(s => ({
        storyId: s.id,
        storyIdType: typeof s.id,
        storyTitle: s.title
      })))
    }
  }, [features, userStories])

  // Debug logging
  console.log('UserStoriesAndFeatures - Total features received:', features?.length || 0)
  console.log('UserStoriesAndFeatures - Features:', features)
  console.log('UserStoriesAndFeatures - User stories:', userStories?.length || 0)
  console.log('UserStoriesAndFeatures - User story IDs:', userStories?.map(s => s.id))
  console.log('UserStoriesAndFeatures - Features with userStoryId:', features?.map(f => ({ 
    id: f.id, 
    userStoryId: f.userStoryId, 
    title: f.title 
  })))
  
  // Check for ID type mismatches
  if (features?.length > 0 && userStories?.length > 0) {
    const sampleFeature = features[0];
    const sampleStory = userStories[0];
    console.log('ID Type Check:');
    console.log('  Sample Story ID:', sampleStory.id, 'Type:', typeof sampleStory.id);
    console.log('  Sample Feature userStoryId:', sampleFeature.userStoryId, 'Type:', typeof sampleFeature.userStoryId);
  }

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
    const storyFeatures = features.filter(f => 
      f.userStoryId === userStoryId || 
      (f as any).user_story_id === userStoryId || // Check snake_case version too
      String(f.userStoryId) === String(userStoryId) // Ensure string comparison
    )
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
                  const storyFeatures = features.filter(f => {
                    const match = f.userStoryId === userStory.id || 
                                  (f as any).user_story_id === userStory.id || // Check snake_case version too
                                  String(f.userStoryId) === String(userStory.id) // Ensure string comparison
                    if (match) {
                      console.log(`✅ Feature ${f.id} matches story ${userStory.id}`)
                    }
                    return match
                  })
                  console.log(`Features for story ${userStory.id}:`, storyFeatures.length, storyFeatures)
                  if (storyFeatures.length === 0 && features.length > 0) {
                    console.log(`⚠️ No features found for story ${userStory.id}, but ${features.length} total features exist`)
                    console.log('Sample feature:', features[0])
                  }
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
                                  {projectId && (
                                    <AIDynamicEnhancement
                                      targetType="userStory"
                                      targetId={userStory.id}
                                      targetName={userStory.title}
                                      projectId={projectId}
                                      onEnhanced={(enhancedData) => {
                                        // Update the user story with enhanced data
                                        const updatedStory = {
                                          ...userStory,
                                          ...enhancedData,
                                          id: userStory.id // Preserve the ID
                                        }
                                        onUserStoryEdit?.(updatedStory)
                                      }}
                                      className="h-8"
                                    />
                                  )}
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
                          <div className="p-4 border-t border-border/30">
                            <FeatureManagementCard
                              userStoryTitle={userStory.title}
                              userStoryId={userStory.id}
                              features={storyFeatures}
                              projectId={projectId}
                              onFeatureAdd={(newFeature) => {
                                // Create a complete feature object
                                const feature: FeatureTask = {
                                  id: crypto.randomUUID(),
                                  ...newFeature as FeatureTask,
                                  userStoryId: userStory.id
                                }
                                onFeatureEdit?.(feature)
                              }}
                              onFeatureEdit={onFeatureEdit}
                              onFeatureDelete={onFeatureDelete}
                              onAIMagic={() => {
                                // Handle AI Magic for features
                                console.log('AI Magic for features of story:', userStory.id)
                              }}
                              readOnly={readOnly}
                            />
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
