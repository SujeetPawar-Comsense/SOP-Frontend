import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Copy, Check, Wand2, X, Edit3, Save } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { Textarea } from './ui/textarea'

interface GeneratedPromptModalProps {
  isOpen: boolean
  onClose: () => void
  category: string
  prompt: string
  onPromptUpdate: (updatedPrompt: string) => void
}

export default function GeneratedPromptModal({
  isOpen,
  onClose,
  category,
  prompt,
  onPromptUpdate
}: GeneratedPromptModalProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState(prompt)

  useEffect(() => {
    setEditedPrompt(prompt)
    setIsEditing(false)
  }, [prompt])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedPrompt : prompt)
      setCopied(true)
      toast.success('Prompt copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleSave = () => {
    onPromptUpdate(editedPrompt)
    setIsEditing(false)
    toast.success('Prompt updated successfully!')
  }

  const handleCancel = () => {
    setEditedPrompt(prompt)
    setIsEditing(false)
  }

  const getCategoryColor = (cat: string) => {
    const colors = {
      objective: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      framework: 'bg-green-500/20 text-green-400 border-green-500/30',
      checkpoints: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      debugging: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      context: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    }
    return colors[cat as keyof typeof colors] || 'bg-primary/20 text-primary border-primary/30'
  }

  const getCategoryIcon = (cat: string) => {
    return <Wand2 className="w-4 h-4" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-card/95 backdrop-blur-sm border-primary/30 neon-glow">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={`${getCategoryColor(category)} neon-glow`}>
                {getCategoryIcon(category)}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
              <DialogTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Generated Prompt
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 border-primary/50 hover:bg-primary/10 neon-glow"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2 border-primary/50 hover:bg-primary/10 neon-glow"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="gap-2 border-muted/50 hover:bg-muted/10"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="gap-2 bg-primary hover:bg-primary/90 neon-glow"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
          <DialogDescription>
            {isEditing 
              ? 'Edit your generated prompt to better fit your needs'
              : 'Review and copy your AI-generated prompt for this category'
            }
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-card/50 border-primary/20 neon-glow">
          <CardContent className="p-0">
            {isEditing ? (
              <Textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="min-h-[400px] resize-none border-0 bg-transparent focus:ring-0 focus:outline-none text-sm leading-relaxed"
                placeholder="Edit your prompt here..."
              />
            ) : (
              <div className="p-6 max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {prompt}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {!isEditing && (
          <div className="flex items-center justify-between pt-4 border-t border-primary/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {prompt.split(' ').length} words
              </Badge>
              <Badge variant="outline" className="text-xs">
                {prompt.length} characters
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-muted/50 hover:bg-muted/10"
              >
                Close
              </Button>
              <Button
                onClick={handleCopy}
                className="gap-2 bg-primary hover:bg-primary/90 neon-glow"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}