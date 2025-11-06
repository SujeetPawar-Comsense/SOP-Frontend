import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { promptsAPI } from '../utils/api'

interface VibeEngineerDashboardProps {
  projectId: string
}

export default function VibeEngineerDashboard({ projectId }: VibeEngineerDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [prompts, setPrompts] = useState<any[]>([])

  // Load prompts data
  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    setLoading(true)
    try {
      // Load generated prompts
      const promptsResponse = await promptsAPI.get(projectId)
      if (promptsResponse.prompts) {
        setPrompts(promptsResponse.prompts)
      }
    } catch (error: any) {
      console.error('Failed to load project data:', error)
      toast.error('Failed to load project data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFullPrompt = async () => {
    setGenerating(true)
    try {
      await promptsAPI.generate(projectId, 'full-project', {})
      toast.success('AI prompt generated successfully!')
      await loadProjectData() // Reload to get the new prompt
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate prompt')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">AI-Generated Prompts</CardTitle>
          <CardDescription>
            Context-aware prompts to build features 3x faster with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGenerateFullPrompt}
            disabled={generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Full Project Prompt
              </>
            )}
          </Button>

          {prompts.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Generated Prompts</h3>
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="bg-card/50 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {prompt.promptType} - {new Date(prompt.createdAt).toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm bg-black/40 p-4 rounded-lg overflow-auto max-h-96">
                      {prompt.generatedPrompt}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        navigator.clipboard.writeText(prompt.generatedPrompt)
                        toast.success('Prompt copied to clipboard!')
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {prompts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No prompts generated yet.</p>
              <p className="text-sm mt-2">Click the button above to generate your first AI prompt.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
