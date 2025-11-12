import React, { useState } from 'react'
import { Button } from './ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'
import { supabase } from '../utils/supabaseClient'

interface AIDynamicEnhancementProps {
  targetType: 'module' | 'userStory' | 'feature'
  targetId: string
  targetName?: string
  projectId: string
  onEnhanced: (enhancedData: any) => void
  className?: string
}

export default function AIDynamicEnhancement({
  targetType,
  targetId,
  targetName,
  projectId,
  onEnhanced,
  className = ''
}: AIDynamicEnhancementProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [enhancementRequest, setEnhancementRequest] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)

  const handleEnhance = async () => {
    if (!enhancementRequest.trim()) {
      toast.error('Please enter an enhancement request')
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/brd/enhance-dynamic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          projectId,
          targetType,
          targetId,
          enhancementRequest
        })
      })

      if (!response.ok) {
        throw new Error('Failed to enhance')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        toast.success(`${targetType} enhanced successfully!`)
        onEnhanced(result.data)
        setShowDialog(false)
        setEnhancementRequest('')
      }
    } catch (error: any) {
      console.error('Failed to enhance:', error)
      toast.error('Failed to enhance. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const getPlaceholder = () => {
    switch (targetType) {
      case 'module':
        return 'e.g., "Add authentication and authorization features to this module"'
      case 'userStory':
        return 'e.g., "Add more detailed acceptance criteria for testing"'
      case 'feature':
        return 'e.g., "Make this feature more detailed with specific implementation steps"'
      default:
        return 'Describe how you want to enhance this item...'
    }
  }

  const getTitle = () => {
    switch (targetType) {
      case 'module':
        return 'Enhance Module'
      case 'userStory':
        return 'Enhance User Story'
      case 'feature':
        return 'Enhance Feature'
      default:
        return 'Enhance'
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowDialog(true)}
        className={`gap-2 ${className}`}
      >
        <Sparkles className="h-4 w-4" />
        AI Magic
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription>
              {targetName && <div className="font-medium mt-1">"{targetName}"</div>}
              <div className="mt-2">
                Use AI to enhance this {targetType} with additional details, features, or improvements.
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder={getPlaceholder()}
              value={enhancementRequest}
              onChange={(e) => setEnhancementRequest(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isEnhancing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnhance}
              disabled={isEnhancing || !enhancementRequest.trim()}
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

