import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Loader2, Wand2, Sparkles, Code, Info } from 'lucide-react'
import { toast } from 'sonner'
import { promptsAPI, projectAPI } from '../utils/api'
import VibePromptGenerator from './VibePromptGenerator'

interface VibeEngineerDashboardProps {
  projectId: string
}

export default function VibeEngineerDashboard({ projectId }: VibeEngineerDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [prompts, setPrompts] = useState<any[]>([])
  const [projectData, setProjectData] = useState<any>(null)

  // Load prompts data
  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    setLoading(true)
    try {
      // Load project details
      const projectResponse = await projectAPI.getById(projectId)
      if (projectResponse.data) {
        setProjectData(projectResponse.data)
      }

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Vibe Engineer Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate AI prompts using STRUCT_TO_PROMPT to build components faster
        </p>
        {projectData && (
          <div className="flex gap-2 mt-3">
            <Badge variant="outline">
              <Code className="h-3 w-3 mr-1" />
              {projectData.name}
            </Badge>
            {projectData.application_type && (
              <Badge variant="secondary">
                {projectData.application_type}
              </Badge>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="struct-prompt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="struct-prompt">
            <Sparkles className="h-4 w-4 mr-2" />
            STRUCT_TO_PROMPT Generator
          </TabsTrigger>
          <TabsTrigger value="legacy">
            <Wand2 className="h-4 w-4 mr-2" />
            Legacy Prompts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="struct-prompt" className="mt-6">
          <VibePromptGenerator
            projectId={projectId}
            projectName={projectData?.name || 'Project'}
            applicationType={projectData?.application_type}
          />
        </TabsContent>

        <TabsContent value="legacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Legacy AI Prompts</CardTitle>
              <CardDescription>
                Basic prompt generation (deprecated - use STRUCT_TO_PROMPT instead)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGenerateFullPrompt}
                disabled={generating}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Legacy Prompt
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
