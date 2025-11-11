import { useState, useEffect } from 'react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Check, X, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

export interface ProjectInformation {
  // Section 1: Business Intent
  vision: string
  purpose: string
  objectives: string
  projectScope: string
  
  // Section 2: Requirements
  functionalRequirements: string
  nonFunctionalRequirements: string
  integrationRequirements: string
  reportingRequirements: string
}

export const createDefaultProjectInformation = (): ProjectInformation => ({
  vision: '',
  purpose: '',
  objectives: '',
  projectScope: '',
  functionalRequirements: '',
  nonFunctionalRequirements: '',
  integrationRequirements: '',
  reportingRequirements: ''
})

interface ProjectInformationFormProps {
  data: ProjectInformation
  onChange: (data: ProjectInformation) => void
  isProjectOverviewComplete?: boolean
  isGenerating?: boolean
  onAIGeneration?: () => void
  isAnalyzing?: boolean
  analysisProgress?: string
  onSaveAndContinue?: () => void
  isLocked?: boolean
}

export default function ProjectInformationForm({ 
  data, 
  onChange, 
  isProjectOverviewComplete, 
  isGenerating, 
  onAIGeneration,
  isAnalyzing = false,
  analysisProgress,
  onSaveAndContinue,
  isLocked = false
}: ProjectInformationFormProps) {
  // Track original saved values for each field
  const [savedValues, setSavedValues] = useState<ProjectInformation>(data)
  
  // Track current editing values (local state before save)
  const [editingValues, setEditingValues] = useState<ProjectInformation>(data)
  
  // Track which field is being cancelled (for confirmation dialog)
  const [cancellingField, setCancellingField] = useState<keyof ProjectInformation | null>(null)
  
  // Track if viewing scope as JSON or formatted
  const [viewScopeAsJson, setViewScopeAsJson] = useState(false)

  // Sync local state when data prop changes (e.g., from file parsing)
  useEffect(() => {
    setSavedValues(data)
    setEditingValues(data)
  }, [data])
  
  // Helper to parse project scope safely
  const parseProjectScope = (scopeStr: string) => {
    try {
      const parsed = JSON.parse(scopeStr)
      return parsed
    } catch {
      return null
    }
  }
  
  // Helper to format scope for display
  const formatScopeForDisplay = (scopeData: any) => {
    if (!scopeData) return ''
    
    let formatted = ''
    
    if (scopeData.inScope && scopeData.inScope.length > 0) {
      formatted += '✅ IN SCOPE:\n'
      scopeData.inScope.forEach((item: string) => {
        formatted += `• ${item}\n`
      })
    }
    
    if (scopeData.outOfScope && scopeData.outOfScope.length > 0) {
      formatted += '\n❌ OUT OF SCOPE:\n'
      scopeData.outOfScope.forEach((item: string) => {
        formatted += `• ${item}\n`
      })
    }
    
    return formatted
  }

  const handleFieldChange = (field: keyof ProjectInformation, value: string) => {
    setEditingValues({
      ...editingValues,
      [field]: value
    })
  }

  const handleSave = (field: keyof ProjectInformation) => {
    // Update saved values
    const newSavedValues = {
      ...savedValues,
      [field]: editingValues[field]
    }
    setSavedValues(newSavedValues)
    
    // Propagate to parent component
    onChange(newSavedValues)
    
    // Show success toast
    toast.success('Saved successfully')
  }

  const handleCancelClick = (field: keyof ProjectInformation) => {
    // Check if there are unsaved changes
    if (editingValues[field] !== savedValues[field]) {
      // Show confirmation dialog
      setCancellingField(field)
    }
  }

  const handleConfirmCancel = () => {
    if (cancellingField) {
      // Revert to saved value
      setEditingValues({
        ...editingValues,
        [cancellingField]: savedValues[cancellingField]
      })
      setCancellingField(null)
    }
  }

  const handleCloseDialog = () => {
    setCancellingField(null)
  }

  const hasChanges = (field: keyof ProjectInformation) => {
    return editingValues[field] !== savedValues[field]
  }

  // Show analyzing overlay if analyzing
  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/20 bg-background/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analyzing BRD Document</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {analysisProgress || 'Processing your Business Requirements Document to extract project overview information...'}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                </div>
                <span>This may take a few moments</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Business Intent */}
      <Card className="border-primary/20 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            Section 1: Business Intent
          </CardTitle>
          <CardDescription>
            Captures the overall vision, purpose, objectives, and project scope. Establishes why the project exists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vision */}
          <div className="space-y-2">
            <Label htmlFor="vision" className="text-base">
              Vision
            </Label>
            <Textarea
              id="vision"
              value={editingValues.vision}
              onChange={(e) => handleFieldChange('vision', e.target.value)}
              placeholder="Describe the long-term vision for this project..."
              rows={4}
              className="resize-none border-primary/30 focus:border-primary/50"
            />
            <div className="flex justify-end">
              {hasChanges('vision') && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelClick('vision')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleSave('vision')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-base">
              Purpose
            </Label>
            <Textarea
              id="purpose"
              value={editingValues.purpose}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              placeholder="Explain the primary purpose and goals of this project..."
              rows={4}
              className="resize-none border-primary/30 focus:border-primary/50"
            />
            <div className="flex justify-end">
              {hasChanges('purpose') && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelClick('purpose')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleSave('purpose')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <Label htmlFor="objectives" className="text-base">
              Objectives
            </Label>
            <Textarea
              id="objectives"
              value={editingValues.objectives}
              onChange={(e) => handleFieldChange('objectives', e.target.value)}
              placeholder="List the specific, measurable objectives for this project..."
              rows={4}
              className="resize-none border-primary/30 focus:border-primary/50"
            />
            <div className="flex justify-end">
              {hasChanges('objectives') && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelClick('objectives')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleSave('objectives')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Project Scope */}
          <div className="space-y-2">
            <Label htmlFor="projectScope" className="text-base">
              Project Scope
            </Label>
            {(() => {
              // Try to parse as JSON and display formatted
              try {
                const scopeData = JSON.parse(editingValues.projectScope || '{}')
                const hasData = scopeData.inScope?.length > 0 || scopeData.outOfScope?.length > 0
                
                if (hasData) {
                  return (
                    <div className="space-y-4 p-4 border border-primary/30 rounded-lg bg-black/20">
                      {scopeData.inScope && scopeData.inScope.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-400 mb-2">✅ In Scope:</h4>
                          <ul className="space-y-1">
                            {scopeData.inScope.map((item: string, idx: number) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {scopeData.outOfScope && scopeData.outOfScope.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-400 mb-2">❌ Out of Scope:</h4>
                          <ul className="space-y-1">
                            {scopeData.outOfScope.map((item: string, idx: number) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-red-400 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex justify-end pt-2 border-t border-primary/20">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const jsonStr = JSON.stringify(scopeData, null, 2)
                            handleFieldChange('projectScope', jsonStr)
                          }}
                          className="text-xs"
                        >
                          Edit as JSON
                        </Button>
                      </div>
                    </div>
                  )
                }
              } catch (e) {
                // Not valid JSON or empty, show textarea
              }
              
              // Fallback to textarea
              return (
                <>
                  <Textarea
                    id="projectScope"
                    value={editingValues.projectScope}
                    onChange={(e) => handleFieldChange('projectScope', e.target.value)}
                    placeholder='Define what is included and excluded from the project scope...\n\nYou can use plain text or JSON format:\n{\n  "inScope": ["Feature 1", "Feature 2"],\n  "outOfScope": ["Feature 3"]\n}'
                    rows={6}
                    className="resize-none border-primary/30 focus:border-primary/50 font-mono text-sm"
                  />
                  <div className="flex justify-end">
                    {hasChanges('projectScope') && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelClick('projectScope')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSave('projectScope')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Requirements */}
      <Card className="border-primary/20 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            Section 2: Requirements
          </CardTitle>
          <CardDescription>
            Encompasses functional, non-functional, integration, and reporting requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Functional Requirements */}
          <div className="space-y-2">
            <Label htmlFor="functionalRequirements" className="text-base">
              Functional Requirements
            </Label>
            <Textarea
              id="functionalRequirements"
              value={editingValues.functionalRequirements}
              onChange={(e) => handleFieldChange('functionalRequirements', e.target.value)}
              placeholder="Describe the functional requirements and features needed..."
              rows={4}
              className="resize-none border-primary/30 focus:border-primary/50"
            />
            <div className="flex justify-end">
              {hasChanges('functionalRequirements') && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelClick('functionalRequirements')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleSave('functionalRequirements')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Non-Functional Requirements */}
          <div className="space-y-2">
            <Label htmlFor="nonFunctionalRequirements" className="text-base">
              Non-Functional Requirements
            </Label>
            <Textarea
              id="nonFunctionalRequirements"
              value={editingValues.nonFunctionalRequirements}
              onChange={(e) => handleFieldChange('nonFunctionalRequirements', e.target.value)}
              placeholder="Specify performance, scalability, security, and usability requirements..."
              rows={4}
              className="resize-none border-primary/30 focus:border-primary/50"
            />
            <div className="flex justify-end">
              {hasChanges('nonFunctionalRequirements') && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelClick('nonFunctionalRequirements')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleSave('nonFunctionalRequirements')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Integration Requirements */}
          <div className="space-y-2">
            <Label htmlFor="integrationRequirements" className="text-base">
              Integration Requirements
            </Label>
            <Textarea
              id="integrationRequirements"
              value={editingValues.integrationRequirements}
              onChange={(e) => handleFieldChange('integrationRequirements', e.target.value)}
              placeholder="List third-party integrations, APIs, and system connections required..."
              rows={4}
              className="resize-none border-primary/30 focus:border-primary/50"
            />
            <div className="flex justify-end">
              {hasChanges('integrationRequirements') && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelClick('integrationRequirements')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleSave('integrationRequirements')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Reporting Requirements */}
          <div className="space-y-2">
            <Label htmlFor="reportingRequirements" className="text-base">
              Reporting Requirements
            </Label>
            <Textarea
              id="reportingRequirements"
              value={editingValues.reportingRequirements}
              onChange={(e) => handleFieldChange('reportingRequirements', e.target.value)}
              placeholder="Define analytics, dashboards, and reporting capabilities needed..."
              rows={4}
              className="resize-none border-primary/30 focus:border-primary/50"
            />
            <div className="flex justify-end">
              {hasChanges('reportingRequirements') && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelClick('reportingRequirements')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleSave('reportingRequirements')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save and Continue Button - shown when BRD data is loaded */}
      {onSaveAndContinue && !isLocked && isProjectOverviewComplete && (
        <div className="flex justify-center">
          <Button
            onClick={onSaveAndContinue}
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 transition-all shadow-lg"
          >
            <Save className="w-5 h-5" />
            Save and Continue
          </Button>
        </div>
      )}

      {/* AI Generation Button - shown when not in BRD flow */}
      {isProjectOverviewComplete && onAIGeneration && !onSaveAndContinue && (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onAIGeneration}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save & Auto-Generate
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to save and let AI generate user stories, modules, features, and business rules.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={cancellingField !== null} onOpenChange={handleCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the changes to this field?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}