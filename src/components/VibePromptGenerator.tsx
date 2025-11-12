import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { toast } from 'sonner'
import { 
  Wand2, 
  Code, 
  Database, 
  TestTube, 
  Server, 
  FileText, 
  History,
  Copy,
  Trash2,
  Download,
  Sparkles,
  Loader2,
  Info
} from 'lucide-react'
import { vibePromptsAPI, DevelopmentType, VibePrompt } from '../utils/api'

interface VibePromptGeneratorProps {
  projectId: string
  projectName: string
  applicationType?: string
}

const developmentTypes: { value: DevelopmentType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'Frontend', label: 'Frontend', icon: <Code className="h-4 w-4" />, description: 'UI/UX implementation with React, Vue, or Angular' },
  { value: 'Backend API', label: 'Backend API', icon: <Server className="h-4 w-4" />, description: 'Server-side logic and REST/GraphQL endpoints' },
  { value: 'Database Schema', label: 'Database Schema', icon: <Database className="h-4 w-4" />, description: 'Data models and relationships' },
  { value: 'Unit Tests', label: 'Unit Tests', icon: <TestTube className="h-4 w-4" />, description: 'Component-level testing' },
  { value: 'Integration Tests', label: 'Integration Tests', icon: <TestTube className="h-4 w-4" />, description: 'System-wide testing' },
  { value: 'Batch Application', label: 'Batch Application', icon: <Server className="h-4 w-4" />, description: 'Scheduled or batch processing jobs' },
  { value: 'Microservices', label: 'Microservices', icon: <Server className="h-4 w-4" />, description: 'Distributed service architecture' },
  { value: 'CI/CD Pipeline', label: 'CI/CD Pipeline', icon: <Server className="h-4 w-4" />, description: 'Deployment automation and pipelines' },
  { value: 'Documentation', label: 'Documentation', icon: <FileText className="h-4 w-4" />, description: 'Technical and user documentation' }
]

export default function VibePromptGenerator({ projectId, projectName, applicationType }: VibePromptGeneratorProps) {
  const [selectedType, setSelectedType] = useState<DevelopmentType>('Frontend')
  const [previousPrompts, setPreviousPrompts] = useState<Record<string, VibePrompt[]>>({})
  const [selectedPreviousOutputs, setSelectedPreviousOutputs] = useState<string[]>([])
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState('generate')

  // Load prompt history
  useEffect(() => {
    loadPromptHistory()
  }, [projectId])

  const loadPromptHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const result = await vibePromptsAPI.getAll(projectId)
      setPreviousPrompts(result.prompts || {})
    } catch (error: any) {
      console.error('Error loading prompt history:', error)
      toast.error('Failed to load prompt history')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleGeneratePrompt = async () => {
    setIsGenerating(true)
    try {
      const result = await vibePromptsAPI.generate(
        projectId,
        selectedType,
        selectedPreviousOutputs
      )
      
      setGeneratedPrompt(result.prompt.generated_prompt)
      toast.success(`${selectedType} prompt generated successfully!`)
      
      // Reload history to include new prompt
      await loadPromptHistory()
      
      // Switch to view tab
      setActiveTab('view')
    } catch (error: any) {
      console.error('Error generating prompt:', error)
      toast.error(error.message || 'Failed to generate prompt')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    toast.success('Prompt copied to clipboard!')
  }

  const handleDownloadPrompt = (prompt: string, type: string) => {
    const blob = new Blob([prompt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.replace(/\s+/g, '_')}_${type.replace(/\s+/g, '_')}_prompt.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Prompt downloaded!')
  }

  const handleDeletePrompt = async (promptId: string) => {
    try {
      await vibePromptsAPI.delete(promptId)
      toast.success('Prompt deleted successfully')
      await loadPromptHistory()
    } catch (error: any) {
      console.error('Error deleting prompt:', error)
      toast.error('Failed to delete prompt')
    }
  }

  const togglePreviousOutput = (promptText: string) => {
    setSelectedPreviousOutputs(prev => 
      prev.includes(promptText) 
        ? prev.filter(p => p !== promptText)
        : [...prev, promptText]
    )
  }

  const selectedTypeInfo = developmentTypes.find(t => t.value === selectedType)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Vibe Engineer Prompt Generator
        </CardTitle>
        <CardDescription>
          Generate AI prompts using STRUCT_TO_PROMPT for {projectName}
          {applicationType && (
            <Badge variant="outline" className="ml-2">
              {applicationType}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">
              <Wand2 className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="view">
              <FileText className="h-4 w-4 mr-2" />
              View Current
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            {/* Development Type Selection */}
            <div className="space-y-2">
              <Label>Development Type</Label>
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as DevelopmentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {developmentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTypeInfo && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {selectedTypeInfo.description}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Previous Outputs Selection */}
            <div className="space-y-2">
              <Label>Previous Outputs (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Select previous prompts to maintain consistency and build upon existing context
              </p>
              <ScrollArea className="h-[200px] border rounded-lg p-4">
                {Object.entries(previousPrompts).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No previous prompts available. Generate your first prompt to get started!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(previousPrompts).map(([devType, prompts]) => (
                      <div key={devType} className="space-y-2">
                        <h4 className="font-medium text-sm">{devType}</h4>
                        {prompts.map((prompt) => (
                          <div key={prompt.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={prompt.id}
                              checked={selectedPreviousOutputs.includes(prompt.generated_prompt)}
                              onCheckedChange={() => togglePreviousOutput(prompt.generated_prompt)}
                            />
                            <label
                              htmlFor={prompt.id}
                              className="text-sm text-muted-foreground cursor-pointer"
                            >
                              Generated {new Date(prompt.created_at).toLocaleDateString()}
                              {prompt.context?.previousOutputsCount > 0 && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {prompt.context.previousOutputsCount} deps
                                </Badge>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {selectedPreviousOutputs.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected {selectedPreviousOutputs.length} previous output(s)
                </p>
              )}
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGeneratePrompt} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating {selectedType} Prompt...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate {selectedType} Prompt
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="view" className="space-y-4">
            {generatedPrompt ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Generated Prompt</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyPrompt(generatedPrompt)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPrompt(generatedPrompt, selectedType)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No prompt generated yet. Go to the Generate tab to create your first prompt.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : Object.entries(previousPrompts).length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No prompt history available. Generated prompts will appear here.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {Object.entries(previousPrompts).map(([devType, prompts]) => (
                    <div key={devType} className="space-y-2">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {developmentTypes.find(t => t.value === devType)?.icon}
                        {devType}
                        <Badge variant="secondary">{prompts.length}</Badge>
                      </h3>
                      {prompts.map((prompt) => (
                        <Card key={prompt.id}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-sm">
                                  {prompt.context?.developmentType || devType}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  Generated {new Date(prompt.created_at).toLocaleString()}
                                  {prompt.context?.previousOutputsCount > 0 && (
                                    <span className="ml-2">
                                      • {prompt.context.previousOutputsCount} dependencies
                                    </span>
                                  )}
                                </CardDescription>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setGeneratedPrompt(prompt.generated_prompt)
                                    setActiveTab('view')
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyPrompt(prompt.generated_prompt)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePrompt(prompt.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {prompt.generated_prompt}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
