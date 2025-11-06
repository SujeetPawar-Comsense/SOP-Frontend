import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Wand2, ArrowLeft, ArrowRight } from 'lucide-react'
import TechnologySelector from './TechnologySelector'
import { DesignSettings } from './DesignCustomizer'
import ValidatedTextarea from './ValidatedTextarea'

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

interface StepContentProps {
  activeStep: string
  sectionData: SectionData
  designSettings: DesignSettings
  onSectionChange: (section: keyof SectionData, value: string) => void
  onDesignChange: (settings: DesignSettings) => void
  onGenerateSectionPrompt: (section: keyof SectionData) => void
  onGenerateFinalPrompt: () => void
  onStepChange: (step: string) => void
}

export default function StepContent({
  activeStep,
  sectionData,
  designSettings,
  onSectionChange,
  onDesignChange,
  onGenerateSectionPrompt,
  onGenerateFinalPrompt,
  onStepChange
}: StepContentProps) {
  const steps = [
    'projectOverview',
    'featuresModules', 
    'techStack',
    'designGuidelines',
    'securityCompliance',
    'environmentSetup',
    'apiDatabase',
    'documentation',
    'notes'
  ]

  const currentStepIndex = steps.indexOf(activeStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      onStepChange(steps[currentStepIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(steps[currentStepIndex - 1])
    }
  }

  const sections = {
    projectOverview: { 
      key: 'projectOverview' as keyof SectionData, 
      title: 'Project Overview', 
      description: 'Project name, description, business goals, target users, and timeline',
      placeholder: 'Project Name:\n\nProject Description / Purpose:\n\nBusiness Goals:\n\nTarget Users / Audience:\n\nProject Timeline / Key Milestones:'
    },
    featuresModules: { 
      key: 'featuresModules' as keyof SectionData, 
      title: 'Features & Modules', 
      description: 'Feature list with priorities, dependencies, and implementation notes',
      placeholder: 'Module / Feature | Description | Priority | Dependencies | Notes\n------|------|------|------|------\nUser Authentication | Login, registration, password reset | High | Database | \nDashboard | Main user interface | High | User Authentication | '
    },
    techStack: { 
      key: 'techStack' as keyof SectionData, 
      title: 'Tech Stack', 
      description: 'Frontend, backend, database, APIs, DevOps tools, and testing frameworks',
      placeholder: 'Frontend:\n\nBackend:\n\nDatabase:\n\nAPI / Integrations:\n\nDevOps / Deployment Tools:\n\nTesting Frameworks:\n\nAI Tools to be used:'
    },
    designGuidelines: { 
      key: 'designGuidelines' as keyof SectionData, 
      title: 'Design Guidelines', 
      description: 'Brand colors, typography, UI/UX style, responsive design, and accessibility',
      placeholder: 'Brand Colors:\n\nTypography / Fonts:\n\nUI/UX Style Notes:\n\nResponsive Design Requirements:\n\nAccessibility Guidelines:'
    },
    securityCompliance: { 
      key: 'securityCompliance' as keyof SectionData, 
      title: 'Security & Compliance', 
      description: 'Authentication, encryption, data handling, and compliance requirements',
      placeholder: 'Authentication & Authorization:\n\nData Encryption:\n\nSensitive Data Handling:\n\nCompliance Requirements: (e.g., GDPR, HIPAA)\n\nCommon Security Practices:'
    },
    environmentSetup: { 
      key: 'environmentSetup' as keyof SectionData, 
      title: 'Environment Setup', 
      description: 'OS, IDE, tools, package managers, environment variables, and cloud services',
      placeholder: 'OS / IDE / Tools Required:\n\nPackage Managers / Dependency Managers:\n\nEnvironment Variables / Secrets:\n\nContainerization / Cloud Services:'
    },
    apiDatabase: { 
      key: 'apiDatabase' as keyof SectionData, 
      title: 'API & Database', 
      description: 'API endpoints, database schema, relationships, and sample data',
      placeholder: 'API List / Endpoints:\n\nDatabase Schema / Tables:\n\nRelationships / ER Diagram Links:\n\nSample Data / Seed Files:'
    },
    documentation: { 
      key: 'documentation' as keyof SectionData, 
      title: 'Documentation', 
      description: 'Existing docs, design files, architecture diagrams, and code repositories',
      placeholder: 'Existing Documentation Links:\n\nDesign Files / Figma Links:\n\nArchitecture Diagrams / Wireframes:\n\nCode Repositories:'
    },
    notes: { 
      key: 'notes' as keyof SectionData, 
      title: 'Notes & Context', 
      description: 'Special instructions, key contacts, and known limitations or risks',
      placeholder: 'Special instructions for developers:\n\nKey contacts for clarifications:\n\nKnown limitations or risks:'
    }
  }

  const getFieldDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      projectOverview: 'Define your project name, description, business goals, target audience, and timeline',
      featuresModules: 'List features in table format with priorities, dependencies, and notes',
      techStack: 'Specify all technologies including frontend, backend, database, and tools',
      designGuidelines: 'Define brand colors, typography, UI/UX style, and accessibility requirements',
      securityCompliance: 'Outline authentication, encryption, data handling, and compliance needs',
      environmentSetup: 'Detail development environment, tools, package managers, and cloud setup',
      apiDatabase: 'Document API endpoints, database schema, relationships, and seed data',
      documentation: 'Provide links to existing docs, design files, diagrams, and repositories',
      notes: 'Add special instructions, contacts, limitations, and additional context'
    }
    return descriptions[key] || ''
  }

  const renderStepContent = () => {
    const section = sections[activeStep as keyof typeof sections]
    if (!section) return null

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            {section.title}
          </h2>
          <p className="text-muted-foreground">{section.description}</p>
        </div>
        
        <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-primary/30 neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {section.title}
              <Button
                onClick={() => onGenerateSectionPrompt(section.key)}
                size="sm"
                variant="outline"
                className="gap-2 border-primary/50 hover:bg-primary/10 neon-glow"
              >
                <Wand2 className="w-4 h-4" />
                Generate with AI
              </Button>
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {section.key === 'techStack' ? (
              <TechnologySelector
                value={sectionData[section.key]}
                onChange={(value) => onSectionChange(section.key, value)}
                placeholder="Type to search and select technologies..."
              />
            ) : (
              <ValidatedTextarea
                id={section.key}
                label={`Enter your ${section.title.toLowerCase()}`}
                value={sectionData[section.key]}
                onChange={(value) => onSectionChange(section.key, value)}
                fieldType={section.key as any}
                placeholder={section.placeholder}
                description={getFieldDescription(section.key)}
                required={true}
                rows={section.key === 'featuresModules' ? 8 : 6}
              />
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {renderStepContent()}
      
      {/* Navigation */}
      <div className="flex justify-between items-center max-w-2xl mx-auto">
        <Button
          onClick={handlePrevious}
          disabled={isFirstStep}
          variant="outline"
          className="gap-2 border-primary/50 hover:bg-primary/10 neon-glow"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {steps.length}
        </div>
        
        <Button
          onClick={handleNext}
          disabled={isLastStep}
          className="gap-2 bg-primary hover:bg-primary/90 neon-glow"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}