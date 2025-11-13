import React, { useState } from 'react'
import { Button } from './ui/button'
import { Wand2, Loader2 } from 'lucide-react'
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
import { ModuleFeature } from './ExcelUtils'

interface AIGeneralEnhancementProps {
  modules: ModuleFeature[]
  projectId?: string
  onEnhanced: (enhancedModules: ModuleFeature[]) => void
  className?: string
}

export default function AIGeneralEnhancement({
  modules,
  projectId,
  onEnhanced,
  className = ''
}: AIGeneralEnhancementProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [enhancementRequest, setEnhancementRequest] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)

  const handleEnhance = async () => {
    if (!enhancementRequest.trim()) {
      toast.error('Please enter an enhancement request')
      return
    }

    if (!projectId) {
      toast.error('Project ID is required for AI enhancements')
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/brd/enhance-modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          projectId,
          modules,
          enhancementRequest
        })
      })

      if (!response.ok) {
        throw new Error('Failed to enhance modules')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        toast.success('Modules enhanced successfully!')
        onEnhanced(result.data)
        setShowDialog(false)
        setEnhancementRequest('')
      }
    } catch (error: any) {
      console.error('Failed to enhance modules:', error)
      toast.error('Failed to enhance modules. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className={`gap-2 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 ${className}`}
        disabled={!projectId}
      >
        <Wand2 className="h-4 w-4" />
        AI Magic
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              AI Magic - Enhance All Modules
            </DialogTitle>
            <DialogDescription>
              <div className="mt-2">
                Use AI to enhance all modules at once. You can add features, improve descriptions, 
                generate business rules, or refine dependencies across your entire module structure.
              </div>
              {modules.length > 0 && (
                <div className="mt-3 text-sm">
                  Currently working with <span className="font-semibold">{modules.length} module{modules.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="e.g., 'Add authentication features to relevant modules', 'Generate business rules for each module', 'Improve all module descriptions with more technical details'"
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
                'Enhance Modules'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
