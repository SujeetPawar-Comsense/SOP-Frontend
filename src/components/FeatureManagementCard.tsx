import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { 
  Wand2, 
  Plus, 
  Trash2, 
  Edit2,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Check,
  Loader2
} from 'lucide-react'
import { FeatureTask } from './FeaturesTasksEditor'
import { cn } from './ui/utils'
import { toast } from 'sonner'
import { supabase } from '../utils/supabaseClient'

interface FeatureManagementCardProps {
  userStoryTitle: string
  userStoryId: string
  features: FeatureTask[]
  projectId?: string
  onFeatureAdd?: (feature: Partial<FeatureTask>) => void
  onFeatureEdit?: (feature: FeatureTask) => void
  onFeatureDelete?: (featureId: string) => void
  onAIMagic?: () => void
  readOnly?: boolean
}

export default function FeatureManagementCard({
  userStoryTitle,
  userStoryId,
  features,
  projectId,
  onFeatureAdd,
  onFeatureEdit,
  onFeatureDelete,
  onAIMagic,
  readOnly = false
}: FeatureManagementCardProps) {
  const [customFeatureName, setCustomFeatureName] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set())
  const [isAddingFeatures, setIsAddingFeatures] = useState(false)
  const [recommendedFeatures, setRecommendedFeatures] = useState<string[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [recommendationError, setRecommendationError] = useState<string | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Fetch recommendations from API
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!projectId || !userStoryId) return

      setIsLoadingRecommendations(true)
      setRecommendationError(null)
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          throw new Error('No authentication token')
        }

        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'
        const response = await fetch(
          `${apiUrl}/api/projects/${projectId}/features/recommendations/${userStoryId}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }

        const data = await response.json()
        if (data.success && data.recommendations) {
          setRecommendedFeatures(data.recommendations)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        setRecommendationError('Failed to load feature recommendations')
        // Fallback to some default recommendations
        setRecommendedFeatures([
          'Data validation',
          'Error handling',
          'Loading states',
          'Success feedback',
          'Responsive design',
          'Accessibility features'
        ])
      } finally {
        setIsLoadingRecommendations(false)
      }
    }

    if (showRecommendations) {
      fetchRecommendations()
    }
  }, [projectId, userStoryId, showRecommendations])
  
  // Filter out already added features
  const existingFeatureTitles = features.map(f => f.title.toLowerCase())
  const availableRecommendedFeatures = recommendedFeatures.filter(
    rf => !existingFeatureTitles.includes(rf.toLowerCase())
  )

  const handleAddCustomFeature = () => {
    if (!customFeatureName.trim()) {
      toast.error('Please enter a feature name')
      return
    }

    if (onFeatureAdd) {
      onFeatureAdd({
        title: customFeatureName,
        description: '',
        userStoryId: userStoryId,
        priority: 'Medium',
        status: 'Not Started',
        estimatedHours: 0
      })
      setCustomFeatureName('')
      toast.success('Feature added successfully')
    }
  }

  const handleToggleFeature = (featureName: string) => {
    const newSelected = new Set(selectedFeatures)
    if (newSelected.has(featureName)) {
      newSelected.delete(featureName)
    } else {
      newSelected.add(featureName)
    }
    setSelectedFeatures(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedFeatures.size === availableRecommendedFeatures.length) {
      setSelectedFeatures(new Set())
    } else {
      setSelectedFeatures(new Set(availableRecommendedFeatures))
    }
  }

  const handleAddSelectedFeatures = () => {
    if (selectedFeatures.size === 0) {
      toast.error('Please select at least one feature')
      return
    }

    setIsAddingFeatures(true)
    const featuresToAdd = Array.from(selectedFeatures)
    
    featuresToAdd.forEach((featureName) => {
      if (onFeatureAdd) {
        onFeatureAdd({
          title: featureName,
          description: '',
          userStoryId: userStoryId,
          priority: 'Medium',
          status: 'Not Started',
          estimatedHours: 0
        })
      }
    })

    setSelectedFeatures(new Set())
    setIsAddingFeatures(false)
    toast.success(`Added ${featuresToAdd.length} features successfully`)
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

  const getPriorityColor = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
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

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Features for: {userStoryTitle}
            </CardTitle>
            <CardDescription>
              {features.length > 0 
                ? `${features.length} feature${features.length !== 1 ? 's' : ''} defined for this user story`
                : 'No features defined yet for this user story'
              }
            </CardDescription>
          </div>
          {!readOnly && projectId && (
            <Button
              onClick={onAIMagic}
              className="gap-2 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              <Wand2 className="w-4 h-4" />
              AI Magic
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Features - Show First and Prominently */}
        {features.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Current Features ({features.length})
            </h3>
            <div className="space-y-2">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="p-4 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{feature.title}</h4>
                        <Badge variant={getPriorityColor(feature.priority)} className="text-xs">
                          {feature.priority}
                        </Badge>
                        {getStatusIcon(feature.status)}
                      </div>
                      {feature.description && (
                        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        {feature.estimatedHours > 0 && (
                          <span>Est: {feature.estimatedHours}h</span>
                        )}
                        <span>Status: {feature.status}</span>
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onFeatureEdit?.(feature)}
                          title="Edit Feature"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onFeatureDelete?.(feature.id)}
                          title="Delete Feature"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No features found for this user story</p>
            <p className="text-sm mt-2">Features may not be loaded yet or need to be added</p>
          </div>
        )}

        {/* Add Custom Feature - Show after existing features */}
        {!readOnly && (
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Add New Feature</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter feature name..."
                value={customFeatureName}
                onChange={(e) => setCustomFeatureName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomFeature()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddCustomFeature}
                className="gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </Button>
            </div>
          </div>
        )}

        {/* Recommended Features - Collapsible */}
        {!readOnly && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="w-full justify-between"
            >
              <span className="text-sm font-semibold text-muted-foreground">
                Suggested Features
              </span>
              <span className="text-xs">
                {showRecommendations ? 'Hide' : 'Show'}
              </span>
            </Button>
            
            {showRecommendations && (
              <>
                {isLoadingRecommendations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading suggestions...</span>
                  </div>
                ) : availableRecommendedFeatures.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Select features to add ({availableRecommendedFeatures.length} available)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="text-xs"
                      >
                        Select All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {availableRecommendedFeatures.map((feature) => (
                        <div
                          key={feature}
                          className={cn(
                            "p-2 rounded border cursor-pointer transition-all text-sm",
                            selectedFeatures.has(feature) 
                              ? "border-primary bg-primary/10" 
                              : "border-border/50 hover:border-primary/50"
                          )}
                          onClick={() => handleToggleFeature(feature)}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedFeatures.has(feature)}
                              onCheckedChange={() => handleToggleFeature(feature)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-xs">{feature}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedFeatures.size > 0 && (
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFeatures(new Set())}
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleAddSelectedFeatures}
                          disabled={isAddingFeatures}
                          size="sm"
                          className="gap-2"
                        >
                          <Plus className="w-3 h-3" />
                          Add {selectedFeatures.size} Selected
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No additional suggestions available
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}