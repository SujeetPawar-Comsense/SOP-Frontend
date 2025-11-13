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

    fetchRecommendations()
  }, [projectId, userStoryId])
  
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
    
    selectedFeatures.forEach(featureName => {
      if (onFeatureAdd) {
        onFeatureAdd({
          title: featureName,
          description: `Implement ${featureName} for ${userStoryTitle}`,
          userStoryId: userStoryId,
          priority: 'Medium',
          status: 'Not Started',
          estimatedHours: 0
        })
      }
    })

    toast.success(`Added ${selectedFeatures.size} features`)
    setSelectedFeatures(new Set())
    setIsAddingFeatures(false)
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

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {userStoryTitle} - Feature Management
            </CardTitle>
            <CardDescription>
              Select from recommended features or add custom features for this user story
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
        {/* Add Custom Feature */}
        {!readOnly && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Add Custom Feature</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom feature name..."
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
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Recommended Features */}
        {!readOnly && (
          <div className="space-y-3">
            {isLoadingRecommendations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading recommendations...</span>
              </div>
            ) : recommendationError ? (
              <div className="text-center py-4 text-sm text-yellow-500">
                {recommendationError}
              </div>
            ) : availableRecommendedFeatures.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Recommended Features ({availableRecommendedFeatures.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Select All ({availableRecommendedFeatures.length})
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableRecommendedFeatures.map((feature) => (
                    <div
                      key={feature}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
                        selectedFeatures.has(feature) 
                          ? "border-primary bg-primary/10" 
                          : "border-border/50 bg-background/50"
                      )}
                      onClick={() => handleToggleFeature(feature)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedFeatures.has(feature)}
                          onCheckedChange={() => handleToggleFeature(feature)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm">{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {selectedFeatures.size > 0 && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFeatures(new Set())}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Features
                </Button>
                <Button
                  onClick={handleAddSelectedFeatures}
                  disabled={isAddingFeatures}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Add {selectedFeatures.size} Selected Feature{selectedFeatures.size !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Existing Features */}
        {features.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              Current Features ({features.length})
            </h3>
            <div className="space-y-2">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/10 transition-colors"
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
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      )}
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
                          className="h-8 w-8"
                          onClick={() => onFeatureEdit?.(feature)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onFeatureDelete?.(feature.id)}
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
        )}

        {features.length === 0 && availableRecommendedFeatures.length === 0 && !isLoadingRecommendations && (
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No features added yet</p>
            <p className="text-sm mt-2">Start by adding custom features above</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
