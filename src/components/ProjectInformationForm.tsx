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
}

export default function ProjectInformationForm({ data, onChange, isProjectOverviewComplete, isGenerating, onAIGeneration }: ProjectInformationFormProps) {
  // Track original saved values for each field
  const [savedValues, setSavedValues] = useState<ProjectInformation>(data)
  
  // Track current editing values (local state before save)
  const [editingValues, setEditingValues] = useState<ProjectInformation>(data)
  
  // Track which field is being cancelled (for confirmation dialog)
  const [cancellingField, setCancellingField] = useState<keyof ProjectInformation | null>(null)

  // Sync local state when data prop changes (e.g., from file parsing)
  useEffect(() => {
    setSavedValues(data)
    setEditingValues(data)
  }, [data])

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
            <Textarea
              id="projectScope"
              value={editingValues.projectScope}
              onChange={(e) => handleFieldChange('projectScope', e.target.value)}
              placeholder="Define what is included and excluded from the project scope..."
              rows={4}
              className="resize-none border-primary/30 focus:border-primary/50"
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

      {/* AI Generation Button */}
      {isProjectOverviewComplete && onAIGeneration && (
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