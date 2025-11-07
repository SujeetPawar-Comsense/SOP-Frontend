import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../utils/supabaseClient'
import BRDParseResultsView from './BRDParseResultsView'

interface BRDUploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (projectId: string) => void
}

export default function BRDUploadModal({ open, onClose, onSuccess }: BRDUploadModalProps) {
  const [brdContent, setBrdContent] = useState('')
  const [projectName, setProjectName] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseResult, setParseResult] = useState<any>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)

    // Read file content
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setBrdContent(content)
      toast.success(`File "${file.name}" loaded successfully`)
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
    }
    reader.readAsText(file)
  }

  const handleParseBRD = async () => {
    if (!brdContent.trim()) {
      toast.error('Please paste or upload BRD content')
      return
    }

    setParsing(true)
    setParseResult(null)

    try {
      // Get current user's token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Please login first')
        setParsing(false)
        return
      }

      console.log('🤖 Sending BRD to AI for parsing...')

      // Call backend BRD parsing API
      const response = await fetch('http://localhost:3000/api/brd/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          brdContent,
          projectName: projectName.trim() || undefined
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to parse BRD')
      }

      console.log('✅ BRD parsed successfully:', result)
      setParseResult(result)

      toast.success('BRD parsed successfully! Project created.')

      // Close modal and notify parent
      setTimeout(() => {
        onSuccess(result.project.id)
        handleClose()
      }, 1500)

    } catch (error: any) {
      console.error('❌ Error parsing BRD:', error)
      toast.error(error.message || 'Failed to parse BRD')
    } finally {
      setParsing(false)
    }
  }

  const handleClose = () => {
    setBrdContent('')
    setProjectName('')
    setUploadedFile(null)
    setParseResult(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            🤖 AI-Powered BRD Parsing
          </DialogTitle>
          <DialogDescription>
            Upload or paste your Business Requirements Document. AI will automatically extract modules, user stories, and features.
          </DialogDescription>
        </DialogHeader>

        {!parseResult ? (
          <div className="space-y-6 mt-4">
            {/* Project Name Override */}
            <div>
              <Label htmlFor="project-name">Project Name (Optional)</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Leave empty to use name from BRD"
                className="mt-2 bg-input-background border-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI will extract the project name from your BRD if not provided
              </p>
            </div>

            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-primary/20">
                <TabsTrigger value="paste">
                  <FileText className="w-4 h-4 mr-2" />
                  Paste Content
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </TabsTrigger>
              </TabsList>

              <TabsContent value="paste" className="space-y-4">
                <div>
                  <Label htmlFor="brd-content">BRD Content</Label>
                  <Textarea
                    id="brd-content"
                    value={brdContent}
                    onChange={(e) => setBrdContent(e.target.value)}
                    placeholder="Paste your Business Requirements Document here...

Example:
Business Requirements Document

Project: E-commerce Platform

1. Project Overview
Vision: Become the leading platform for small businesses...

2. Modules

2.1 User Management
- User registration
- User login
- Password reset

2.2 Product Catalog
- Browse products
- Search functionality
..."
                    className="mt-2 min-h-[300px] font-mono text-sm bg-black/40 border-primary/30"
                  />
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Upload BRD File</Label>
                  <div className="mt-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".txt,.md,.doc,.docx"
                      onChange={handleFileUpload}
                      className="bg-input-background border-primary/30"
                    />
                    {uploadedFile && (
                      <p className="text-sm text-primary mt-2">
                        📄 {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: .txt, .md, .doc, .docx
                  </p>
                </div>

                {brdContent && (
                  <div>
                    <Label>Preview (first 500 characters)</Label>
                    <div className="mt-2 p-4 bg-black/40 border border-primary/20 rounded-lg">
                      <p className="text-sm font-mono whitespace-pre-wrap">
                        {brdContent.substring(0, 500)}
                        {brdContent.length > 500 && '...'}
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Character Count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {brdContent.length > 0 && `${brdContent.length.toLocaleString()} characters`}
              </span>
              <span>
                {brdContent.length > 0 && `~${Math.ceil(brdContent.length / 4)} tokens (estimated)`}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleParseBRD}
                disabled={parsing || !brdContent.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 neon-glow"
                size="lg"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Parsing with AI...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Parse BRD with AI
                  </>
                )}
              </Button>

              <Button
                onClick={handleClose}
                variant="outline"
                disabled={parsing}
                className="border-primary/30"
              >
                Cancel
              </Button>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">🤖 AI will extract:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ Project overview and objectives</li>
                <li>✅ Modules and their descriptions</li>
                <li>✅ User stories with acceptance criteria</li>
                <li>✅ Features and tasks</li>
                <li>✅ Business rules and constraints</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Note: Requires OpenRouter/OpenAI API key configured in backend
              </p>
            </div>
          </div>
        ) : (
          <BRDParseResultsView
            parsedBRD={parseResult.parsedBRD}
            project={parseResult.project}
            onClose={() => {
              onSuccess(parseResult.project.id)
              handleClose()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

