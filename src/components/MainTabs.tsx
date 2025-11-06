import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Settings, FileText, Wand2, HelpCircle, Copy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import StepContent from './StepContent'
import DesignCustomizer, { DesignSettings } from './DesignCustomizer'
import StepProgressBar from './StepProgressBar'
import DesignStepProgressBar from './DesignStepProgressBar'
import DesignStepContent from './DesignStepContent'

interface SectionData {
  projectOverview: string
  featuresModules: string
  techStack: string
  designGuidelines: string
  securityCompliance: string
  environmentSetup: string
  apiDatabase: string
  documentation: string
  notes: string
}

interface MainTabsProps {
  sectionData: SectionData
  designSettings: DesignSettings
  onSectionChange: (section: keyof SectionData, value: string) => void
  onDesignChange: (settings: DesignSettings) => void
  onGenerateSectionPrompt: (section: keyof SectionData) => void
  onGenerateFinalPrompt: () => void
  generatedPrompts: GeneratedPrompts
  finalPrompt: string
  defaultInstructions: string[]
  sections: Array<{ key: keyof SectionData; title: string; description: string }>
  copyToClipboard: (text: string, type: string) => Promise<void>
}

interface GeneratedPrompts {
  projectOverview: string
  featuresModules: string
  techStack: string
  designGuidelines: string
  securityCompliance: string
  environmentSetup: string
  apiDatabase: string
  documentation: string
  notes: string
}

export default function MainTabs({
  sectionData,
  designSettings,
  onSectionChange,
  onDesignChange,
  onGenerateSectionPrompt,
  onGenerateFinalPrompt,
  generatedPrompts,
  finalPrompt,
  defaultInstructions,
  sections,
  copyToClipboard
}: MainTabsProps) {
  const [activeStep, setActiveStep] = useState<string>('projectOverview')
  const [activeDesignStep, setActiveDesignStep] = useState(0)

  return (
    <div className="w-full space-y-8">
      <Tabs defaultValue="context" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur-sm border-primary/30">
          <TabsTrigger value="context" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <FileText className="w-4 h-4" />
            Project Context Setup
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Settings className="w-4 h-4" />
            Design Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="context" className="space-y-8 mt-6">
          {/* Step Progress Bar */}
          <StepProgressBar 
            sectionData={sectionData} 
            designSettings={designSettings}
            activeStep={activeStep}
          />
          
          {/* Step Content */}
          <StepContent
            activeStep={activeStep}
            sectionData={sectionData}
            designSettings={designSettings}
            onSectionChange={onSectionChange}
            onDesignChange={onDesignChange}
            onGenerateSectionPrompt={onGenerateSectionPrompt}
            onGenerateFinalPrompt={onGenerateFinalPrompt}
            onStepChange={setActiveStep}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-8 mt-6">
          {/* Design Step Progress Bar */}
          <DesignStepProgressBar 
            designSettings={designSettings}
            activeStep={activeDesignStep}
            onStepClick={setActiveDesignStep}
          />
          
          {/* Design Step Content */}
          <DesignStepContent
            activeStep={activeDesignStep}
            designSettings={designSettings}
            onDesignChange={onDesignChange}
            onStepChange={setActiveDesignStep}
          />
        </TabsContent>
      </Tabs>
      
      {/* Generate Final Prompt Section - Common for both tabs */}
      <div className="max-w-2xl mx-auto">
        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              <Wand2 className="w-5 h-5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Generate Master Prompt
              </span>
            </CardTitle>
            <CardDescription className="text-center">
              {Object.values(sectionData).every(value => value.trim() !== '') 
                ? "All sections are complete. Ready to generate your comprehensive prompt!"
                : "Complete all sections first to generate the master prompt"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onGenerateFinalPrompt}
              size="lg"
              className="w-full gap-2 neon-glow bg-primary hover:bg-primary/90"
              disabled={!Object.values(sectionData).every(value => value.trim() !== '')}
            >
              <Wand2 className="w-5 h-5" />
              Generate Final Prompt
            </Button>
            
            {!Object.values(sectionData).every(value => value.trim() !== '') && (
              <div className="mt-4 p-3 bg-card/50 border border-primary/20 rounded-md">
                <p className="text-sm text-muted-foreground text-center">
                  Missing sections: {Object.entries(sectionData)
                    .filter(([_, value]) => value.trim() === '')
                    .map(([key]) => {
                      const section = sections.find(s => s.key === key)
                      return section ? section.title : key
                    })
                    .join(', ')
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Help Button for Default Instructions */}
        <div className="flex justify-center mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full w-8 h-8 p-0 neon-glow hover:bg-primary/10"
                title="View default requirements and generated prompts"
              >
                <HelpCircle className="w-5 h-5 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-primary/30">
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                  Generated Prompts & Default Requirements
                </DialogTitle>
                <DialogDescription>
                  View your generated prompts and the default requirements that will be included
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                {/* Individual Section Prompts */}
                {sections.map((section) => (
                  generatedPrompts[section.key] && (
                    <Card key={`popup-prompt-${section.key}`} className="bg-card/80 backdrop-blur-sm border-primary/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                            {section.title} Prompt
                          </span>
                          <Button
                            onClick={() => copyToClipboard(generatedPrompts[section.key], `${section.title} prompt`)}
                            size="sm"
                            variant="ghost"
                            className="gap-2 neon-glow hover:bg-primary/10"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="whitespace-pre-wrap text-sm bg-background/50 border border-primary/20 p-4 rounded-md overflow-auto max-h-[200px]">
                          {generatedPrompts[section.key]}
                        </pre>
                      </CardContent>
                    </Card>
                  )
                ))}

                {/* Final Master Prompt */}
                {finalPrompt && (
                  <Card className="border-primary bg-primary/5 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                          Master Prompt
                        </span>
                        <Button
                          onClick={() => copyToClipboard(finalPrompt, 'Master prompt')}
                          size="sm"
                          variant="outline"
                          className="gap-2 border-primary/50 hover:bg-primary/10"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Complete prompt ready for application development
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm bg-background/80 border border-primary/20 p-4 rounded-md overflow-auto max-h-[400px]">
                        {finalPrompt}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Default Instructions Preview */}
                <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                      Default Requirements Included
                    </CardTitle>
                    <CardDescription>
                      These requirements will be automatically included in your master prompt
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {defaultInstructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
