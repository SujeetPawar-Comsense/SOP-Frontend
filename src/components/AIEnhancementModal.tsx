import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Sparkles, Loader2, CheckCircle2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../utils/supabaseClient'

interface AIEnhancementModalProps {
  open: boolean
  onClose: () => void
  onApply: (enhancedData: any) => void
  sectionType: 'module' | 'userStory' | 'feature'
  sectionTitle: string
  projectId: string
  currentData?: any
}

export default function AIEnhancementModal({
  open,
  onClose,
  onApply,
  sectionType,
  sectionTitle,
  projectId,
  currentData
}: AIEnhancementModalProps) {
  const [enhancementRequest, setEnhancementRequest] = useState('')
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedResult, setEnhancedResult] = useState<any>(null)

  const handleEnhance = async () => {
    if (!enhancementRequest.trim()) {
      toast.error('Please describe what you want to add or change')
      return
    }

    setEnhancing(true)
    setEnhancedResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Please login first')
        setEnhancing(false)
        return
      }

      console.log('🤖 Sending enhancement request to AI...')

      const response = await fetch('http://localhost:3000/api/brd/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          projectId,
          enhancementRequest,
          targetType: sectionType
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to enhance section')
      }

      console.log('✅ Enhancement received:', result)
      setEnhancedResult(result.enhancement)
      toast.success('AI enhancement generated successfully!')

    } catch (error: any) {
      console.error('❌ Error enhancing section:', error)
      toast.error(error.message || 'Failed to enhance section')
    } finally {
      setEnhancing(false)
    }
  }

  const handleApply = () => {
    if (enhancedResult && enhancedResult.updatedObject) {
      onApply(enhancedResult.updatedObject)
      handleClose()
      toast.success('Enhanced content applied!')
    }
  }

  const handleCopyJSON = () => {
    if (enhancedResult && enhancedResult.updatedObject) {
      navigator.clipboard.writeText(JSON.stringify(enhancedResult.updatedObject, null, 2))
      toast.success('Enhanced JSON copied to clipboard!')
    }
  }

  const handleClose = () => {
    setEnhancementRequest('')
    setEnhancedResult(null)
    onClose()
  }

  const getSectionTypeLabel = () => {
    switch (sectionType) {
      case 'module': return 'Module'
      case 'userStory': return 'User Story'
      case 'feature': return 'Feature'
      default: return 'Section'
    }
  }

  const getPlaceholder = () => {
    switch (sectionType) {
      case 'module':
        return `Examples:\n- Add a new user story for social media login\n- Add user stories for password reset and email verification\n- Expand this module with admin management features`
      case 'userStory':
        return `Examples:\n- Add features for email verification\n- Include API endpoint for this functionality\n- Add testing requirements\n- Expand acceptance criteria`
      case 'feature':
        return `Examples:\n- Add more detailed implementation steps\n- Include error handling requirements\n- Add validation rules\n- Specify edge cases`
      default:
        return 'Describe what you want to add or change...'
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-cyan-500/50">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            AI Enhancement - {getSectionTypeLabel()}
          </DialogTitle>
          <DialogDescription>
            Describe what you want to add or change to "{sectionTitle}". AI will intelligently enhance this section while preserving the structure.
          </DialogDescription>
        </DialogHeader>

        {!enhancedResult ? (
          <div className="space-y-6 mt-4">
            {/* Current Section Info */}
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 text-cyan-400">Enhancing: {sectionTitle}</h4>
              <p className="text-xs text-muted-foreground">
                Type: {getSectionTypeLabel()}
              </p>
            </div>

            {/* Enhancement Request */}
            <div>
              <Label htmlFor="enhancement-request">
                What would you like to add or change?
              </Label>
              <Textarea
                id="enhancement-request"
                value={enhancementRequest}
                onChange={(e) => setEnhancementRequest(e.target.value)}
                placeholder={getPlaceholder()}
                className="mt-2 min-h-[200px] bg-black/40 border-cyan-500/30"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Be specific about what you want. AI will analyze your request and update the {getSectionTypeLabel().toLowerCase()} accordingly.
              </p>
            </div>

            {/* Examples */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">💡 AI can help you:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {sectionType === 'module' && (
                  <>
                    <li>✅ Add new user stories to this module</li>
                    <li>✅ Expand the module description</li>
                    <li>✅ Add related features automatically</li>
                  </>
                )}
                {sectionType === 'userStory' && (
                  <>
                    <li>✅ Add new features to this story</li>
                    <li>✅ Expand acceptance criteria</li>
                    <li>✅ Add technical tasks</li>
                  </>
                )}
                {sectionType === 'feature' && (
                  <>
                    <li>✅ Add implementation details</li>
                    <li>✅ Specify edge cases</li>
                    <li>✅ Add testing requirements</li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleEnhance}
                disabled={enhancing || !enhancementRequest.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-primary hover:from-cyan-700 hover:to-primary/90 neon-glow"
                size="lg"
              >
                {enhancing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI is thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Enhance with AI
                  </>
                )}
              </Button>

              <Button
                onClick={handleClose}
                variant="outline"
                disabled={enhancing}
                className="border-cyan-500/30"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* Enhanced Result */
          <div className="space-y-6 mt-4">
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle2 className="w-12 h-12 text-cyan-400 mb-3" />
              <h3 className="text-lg font-semibold mb-1">Enhancement Complete!</h3>
              <p className="text-sm text-muted-foreground text-center">
                AI has enhanced your {getSectionTypeLabel().toLowerCase()} based on your request
              </p>
            </div>

            {/* Enhanced Content Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Enhanced {getSectionTypeLabel()}:</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyJSON}
                  className="gap-2 border-cyan-500/30"
                >
                  <Copy className="w-4 h-4" />
                  Copy JSON
                </Button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto p-4 bg-black/60 border border-cyan-500/30 rounded-lg">
                <pre className="text-xs text-cyan-100 whitespace-pre-wrap font-mono">
                  {JSON.stringify(enhancedResult.updatedObject, null, 2)}
                </pre>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 text-cyan-400">What changed:</h4>
              <p className="text-sm text-muted-foreground">
                {enhancedResult.message || 'AI has updated the content based on your request'}
              </p>
              
              {sectionType === 'module' && enhancedResult.updatedObject.userStories && (
                <p className="text-sm text-muted-foreground mt-2">
                  📝 User Stories: {enhancedResult.updatedObject.userStories.length}
                </p>
              )}
              
              {sectionType === 'userStory' && enhancedResult.updatedObject.features && (
                <p className="text-sm text-muted-foreground mt-2">
                  🔧 Features: {enhancedResult.updatedObject.features.length}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleApply}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-primary hover:from-cyan-700 hover:to-primary/90 neon-glow"
                size="lg"
              >
                Apply Enhancement
              </Button>

              <Button
                onClick={handleClose}
                variant="outline"
                className="border-cyan-500/30"
              >
                Cancel
              </Button>
            </div>

            {/* Info */}
            <p className="text-xs text-center text-muted-foreground">
              Review the enhanced content above. Click "Apply Enhancement" to save changes or "Cancel" to discard.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

