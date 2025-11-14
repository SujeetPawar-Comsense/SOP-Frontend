import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Progress } from './ui/progress'
import { CheckCircle2, Circle, Loader2, X } from 'lucide-react'
import { Button } from './ui/button'

interface GenerationStep {
  id: string
  label: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  message?: string
}

interface AIGenerationModalProps {
  open: boolean
  onClose: () => void
  onComplete: (data: any) => void
  projectId: string
  projectOverview: any
  brdContent?: string
}

export default function AIGenerationModal({ 
  open, 
  onClose, 
  onComplete,
  projectId,
  projectOverview,
  brdContent
}: AIGenerationModalProps) {
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'user-stories', label: 'Generating User Stories...', status: 'pending' },
    { id: 'modules', label: 'Modules & Features', status: 'pending' },
    { id: 'business-rules', label: 'Business Rules', status: 'pending' },
  ])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    // Reset hasStarted when modal closes
    if (!open) {
      setHasStarted(false)
      setError(null)
      setGeneratedData(null)
      setCurrentStepIndex(0)
      setSteps([
        { id: 'user-stories', label: 'Generating User Stories...', status: 'pending' },
        { id: 'modules', label: 'Modules & Features', status: 'pending' },
        { id: 'business-rules', label: 'Business Rules', status: 'pending' },
      ])
      return
    }

    // Only start generation once when modal opens and projectOverview is available
    if (open && projectOverview && !hasStarted) {
      setHasStarted(true)
      startGeneration()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]) // Only depend on 'open' to prevent multiple calls when projectOverview changes

  const startGeneration = async () => {
    // Prevent duplicate calls - if already started, return
    if (hasStarted && steps.some(s => s.status === 'in-progress' || s.status === 'completed')) {
      console.log('Generation already in progress, skipping duplicate call')
      return
    }

    setError(null)
    setCurrentStepIndex(0)
    
    // Update first step to in-progress
    updateStepStatus(0, 'in-progress')

    try {
      // Get the auth token from Supabase
      const { supabase } = await import('../utils/supabaseClient')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid authentication session found')
      }

      // Call the parse endpoint with full BRD_PARSER_SYSTEM_PROMPT
      const response = await fetch(`http://localhost:3000/api/brd/parse-full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          projectId,
          projectOverview,
          brdContent
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate project structure')
      }

      const result = await response.json()

      // Simulate progressive updates for better UX
      await simulateProgressiveUpdates(result.parsedBRD)

      setGeneratedData(result.parsedBRD)
      
      // Call onComplete with the generated data
      setTimeout(() => {
        onComplete(result.parsedBRD)
      }, 1000)

    } catch (err: any) {
      setError(err.message || 'An error occurred during generation')
      updateStepStatus(currentStepIndex, 'error', err.message)
    }
  }

  const simulateProgressiveUpdates = async (data: any) => {
    // Step 1: User Stories
    updateStepStatus(0, 'in-progress', 'Analyzing requirements and creating user stories...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    updateStepStatus(0, 'completed', `Generated ${data.modules?.reduce((acc: number, m: any) => acc + (m.userStories?.length || 0), 0) || 0} user stories`)

    // Step 2: Modules & Features
    setCurrentStepIndex(1)
    updateStepStatus(1, 'in-progress', 'Organizing modules and features...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    updateStepStatus(1, 'completed', `Created ${data.modules?.length || 0} modules with features`)

    // Step 3: Business Rules
    setCurrentStepIndex(2)
    updateStepStatus(2, 'in-progress', 'Extracting business rules...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    updateStepStatus(2, 'completed', `Identified ${data.businessRules?.length || 0} business rules`)
  }

  const updateStepStatus = (index: number, status: GenerationStep['status'], message?: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message } : step
    ))
  }

  const getStepIcon = (status: GenerationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />
      case 'error':
        return <X className="w-5 h-5 text-destructive" />
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const progress = ((steps.filter(s => s.status === 'completed').length) / steps.length) * 100

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            AI Generation in Progress
          </DialogTitle>
          <DialogDescription>
            Generating content for your project sections...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                  step.status === 'in-progress' ? 'bg-primary/10 border border-primary/30' :
                  step.status === 'completed' ? 'bg-green-500/10 border border-green-500/30' :
                  step.status === 'error' ? 'bg-destructive/10 border border-destructive/30' :
                  'bg-muted/30 border border-transparent'
                }`}
              >
                <div className="mt-0.5">
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <p className={`font-medium ${
                      step.status === 'in-progress' ? 'text-primary' :
                      step.status === 'completed' ? 'text-green-500' :
                      step.status === 'error' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {step.message && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.message}
                    </p>
                  )}
                  {step.status === 'in-progress' && (
                    <div className="flex gap-1 mt-2">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-100" />
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-200" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          {(error || steps.every(s => s.status === 'completed')) && (
            <div className="flex justify-end gap-2">
              {error && (
                <Button variant="outline" onClick={() => startGeneration()}>
                  Retry
                </Button>
              )}
              <Button 
                onClick={onClose}
                className={steps.every(s => s.status === 'completed') ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {steps.every(s => s.status === 'completed') ? 'Continue' : 'Close'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
