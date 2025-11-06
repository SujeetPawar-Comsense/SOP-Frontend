import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Copy, 
  MessageSquare, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Code2, 
  Database, 
  Workflow,
  TestTube,
  FileText,
  Rocket,
  Upload,
  Send,
  Sparkles,
  Layout,
  Server,
  Shield
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { ModuleFeature } from './ExcelUtils'

interface OnboardingHubProps {
  projectName: string
  baData: any
  developerData: any
  onCopyPrompt: (prompt: string, type: string) => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface FeatureProgress {
  featureId: string
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  assignedTo?: string
  outputs: {
    code?: string
    notes?: string
    screenshots?: string[]
  }
  aiUsage: {
    promptsUsed: string[]
    chatCount: number
  }
}

export default function OnboardingHub({ projectName, baData, developerData, onCopyPrompt }: OnboardingHubProps) {
  const [activeSection, setActiveSection] = useState('features')
  const [selectedFeature, setSelectedFeature] = useState<ModuleFeature | null>(null)
  const [activePromptTab, setActivePromptTab] = useState('ui')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: `Welcome to ${projectName}! 👋\n\nI'm your AI assistant with full project context. I can help you with:\n\n• Understanding project architecture and standards\n• Generating code following design guidelines\n• API integration and database queries\n• Testing strategies and security best practices\n• Deployment and CI/CD workflows\n\nSelect a feature to get started, or ask me anything!`,
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [featureProgress, setFeatureProgress] = useState<Record<string, FeatureProgress>>({})
  
  const features: ModuleFeature[] = baData?.modulesFeatures || []
  const currentProgress = selectedFeature ? featureProgress[selectedFeature.id] : null

  const handleFeatureSelect = (feature: ModuleFeature) => {
    setSelectedFeature(feature)
    
    // Initialize progress if not exists
    if (!featureProgress[feature.id]) {
      setFeatureProgress({
        ...featureProgress,
        [feature.id]: {
          featureId: feature.id,
          status: feature.status === 'Completed' ? 'completed' : 
                  feature.status === 'In Progress' ? 'in-progress' : 'todo',
          outputs: {},
          aiUsage: {
            promptsUsed: [],
            chatCount: 0
          }
        }
      })
    }
  }

  const generateContextualPrompt = (category: string): string => {
    if (!selectedFeature) return ''

    const baseContext = `
Project: ${projectName}
Feature: ${selectedFeature.moduleName}
Description: ${selectedFeature.description}
Priority: ${selectedFeature.priority}
Dependencies: ${selectedFeature.dependencies}

Project Context:
${baData.projectOverview ? `\nBusiness Overview:\n${baData.projectOverview}\n` : ''}
${baData.businessRules ? `\nBusiness Rules:\n${baData.businessRules}\n` : ''}
`

    const designGuidelines = baData.uiuxGuidelines
    const security = developerData.securityGuidelines
    const testing = developerData.testingFramework
    const devops = developerData.devOpsDeployment
    const docs = developerData.documentation

    switch (category) {
      case 'ui':
        return `${baseContext}
UI/UX Guidelines:
- Primary Color: ${designGuidelines?.branding?.primaryColor || 'To be defined'}
- CSS Framework: ${designGuidelines?.technical?.cssFramework || 'Tailwind CSS'}
- Component Library: ${designGuidelines?.technical?.componentLibrary || 'shadcn/ui'}
- Design Style: ${designGuidelines?.ai?.designStylePrompt || 'Modern, clean design'}

Task:
Create the UI components for "${selectedFeature.moduleName}" following the project's design system.

Requirements:
1. Follow the design guidelines above
2. Ensure responsive design for mobile/tablet/desktop
3. Include proper accessibility (ARIA labels, keyboard navigation)
4. Use the specified component library
5. Follow the naming conventions and file structure

Generate:
- React component code
- Styling (Tailwind classes or CSS)
- Component props and types
- Example usage
`

      case 'api':
        return `${baseContext}
API & Service Layer Requirements:
- Authentication: ${security?.authentication?.method || 'JWT'}
- Authorization Model: ${security?.authorization?.model || 'RBAC'}
- Input Validation: ${security?.inputValidation?.validationFramework || 'Zod/Joi'}
- API Documentation: ${docs?.apiDocumentation?.format || 'OpenAPI'}

Task:
Create the API endpoints and service layer for "${selectedFeature.moduleName}".

Requirements:
1. Implement RESTful API endpoints with proper HTTP methods
2. Add authentication and authorization middleware
3. Implement input validation and sanitization
4. Include error handling and proper status codes
5. Add API documentation comments

Generate:
- API route handlers
- Service layer business logic
- Request/Response DTOs
- Validation schemas
- Error handling middleware
`

      case 'database':
        return `${baseContext}
Database & Schema Requirements:
- Data Protection: ${security?.dataProtection?.encryptionAtRest || 'AES-256'}
- Data Masking: ${security?.dataProtection?.dataMasking ? 'Enabled' : 'Disabled'}
- PII Handling: ${security?.dataProtection?.piiHandling || 'Encrypted storage'}

Task:
Create the database schema and data access layer for "${selectedFeature.moduleName}".

Requirements:
1. Design normalized database schema
2. Define relationships and foreign keys
3. Add indexes for performance
4. Implement data access layer (Repository pattern)
5. Include migration scripts
6. Add data validation at DB level

Generate:
- Database migration files
- Entity/Model definitions
- Repository/DAO classes
- Sample seed data
- Schema diagram (textual description)
`

      case 'integration':
        return `${baseContext}
Integration & Webhooks Requirements:
- API Input Validation: ${security?.inputValidation?.apiInputValidation || 'Required'}
- Secrets Management: ${security?.secureConfigs?.secretsManagement || 'Environment Variables'}
- Error Handling: Required with retry logic

Task:
Create integration layer for external services and webhooks for "${selectedFeature.moduleName}".

Requirements:
1. Implement API client with proper error handling
2. Add retry logic with exponential backoff
3. Secure API key/secret management
4. Implement webhook handlers
5. Add request/response logging
6. Handle rate limiting

Generate:
- API client service
- Webhook endpoint handlers
- Configuration for external services
- Error handling and retry logic
- Integration tests stubs
`

      case 'testing':
        return `${baseContext}
Testing Framework:
- Unit Testing: ${testing?.unitTesting?.framework || 'Jest'}
- Integration Testing: ${testing?.integrationTesting?.tool || 'Supertest'}
- E2E Testing: ${testing?.e2eTesting?.framework || 'Playwright'}
- Coverage Target: ${testing?.coverage?.threshold || '80%'}

Task:
Create comprehensive tests for "${selectedFeature.moduleName}".

Requirements:
1. Write unit tests with ${testing?.coverage?.threshold || '80%'} coverage
2. Create integration tests for API endpoints
3. Add E2E tests for critical user flows
4. Mock external dependencies
5. Follow test naming conventions

Generate:
- Unit test suite
- Integration test suite  
- E2E test scenarios
- Test fixtures and mocks
- Test data factories
`

      case 'documentation':
        return `${baseContext}
Documentation Requirements:
- API Format: ${docs?.apiDocumentation?.format || 'OpenAPI'}
- Auto-Generation: ${docs?.apiDocumentation?.autoGeneration ? 'Enabled' : 'Manual'}
- Code Examples: ${docs?.apiDocumentation?.codeExamples || 'JavaScript, Python, cURL'}

Task:
Create comprehensive documentation for "${selectedFeature.moduleName}".

Requirements:
1. Write API documentation in ${docs?.apiDocumentation?.format || 'OpenAPI'} format
2. Include code examples for each endpoint
3. Document request/response schemas
4. Add usage examples and best practices
5. Document error codes and handling

Generate:
- API documentation (OpenAPI/Swagger)
- README section for this feature
- Code examples in multiple languages
- Troubleshooting guide
- Architecture Decision Record (if applicable)
`

      case 'deployment':
        return `${baseContext}
DevOps & Deployment:
- CI/CD Pipeline: ${devops?.cicdPipeline?.pipelineSteps || 'build → test → deploy'}
- Container Registry: ${devops?.containerRegistry?.registry || 'Docker Hub'}
- IaC Tool: ${devops?.infrastructure?.iacTool || 'Terraform'}
- Monitoring: ${devops?.monitoring?.tools || 'Prometheus/Grafana'}

Task:
Create deployment configuration and scripts for "${selectedFeature.moduleName}".

Requirements:
1. Create Dockerfile (if applicable)
2. Add CI/CD pipeline configuration
3. Write deployment scripts
4. Configure environment variables
5. Add health check endpoints
6. Setup monitoring and alerts

Generate:
- Dockerfile
- CI/CD pipeline config (GitHub Actions/GitLab CI)
- Kubernetes manifests or deployment scripts
- Environment variable templates
- Health check implementation
- Monitoring dashboard config
`

      default:
        return baseContext
    }
  }

  const handleCopyPrompt = (category: string) => {
    const prompt = generateContextualPrompt(category)
    onCopyPrompt(prompt, `${category.toUpperCase()} prompt for ${selectedFeature?.moduleName}`)
    
    // Track prompt usage
    if (selectedFeature) {
      const progress = featureProgress[selectedFeature.id] || {
        featureId: selectedFeature.id,
        status: 'in-progress',
        outputs: {},
        aiUsage: { promptsUsed: [], chatCount: 0 }
      }
      
      setFeatureProgress({
        ...featureProgress,
        [selectedFeature.id]: {
          ...progress,
          aiUsage: {
            ...progress.aiUsage,
            promptsUsed: [...progress.aiUsage.promptsUsed, category]
          }
        }
      })
    }
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])

    // Simulate context-aware AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(chatInput)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }])

      // Track chat usage
      if (selectedFeature) {
        const progress = featureProgress[selectedFeature.id] || {
          featureId: selectedFeature.id,
          status: 'in-progress',
          outputs: {},
          aiUsage: { promptsUsed: [], chatCount: 0 }
        }
        
        setFeatureProgress({
          ...featureProgress,
          [selectedFeature.id]: {
            ...progress,
            aiUsage: {
              ...progress.aiUsage,
              chatCount: progress.aiUsage.chatCount + 1
            }
          }
        })
      }
    }, 800)

    setChatInput('')
  }

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase()
    
    // Context-aware responses based on project data
    if (lowerQuestion.includes('color') || lowerQuestion.includes('theme') || lowerQuestion.includes('design')) {
      const guidelines = baData.uiuxGuidelines
      return `Based on the project's design system:\n\n🎨 **Colors:**\n- Primary: ${guidelines?.branding?.primaryColor || '#00ff88'}\n- Secondary: ${guidelines?.branding?.secondaryColor || '#00d4ff'}\n\n📐 **Typography:**\n- Primary Font: ${guidelines?.typography?.primaryFont || 'Inter'}\n- H1 Size: ${guidelines?.typography?.h1Size || '2.5rem'}\n\n🔧 **Technical:**\n- Framework: ${guidelines?.technical?.cssFramework || 'Tailwind CSS'}\n- Component Library: ${guidelines?.technical?.componentLibrary || 'shadcn/ui'}\n\nUse these in your implementation to maintain consistency!`
    }
    
    if (lowerQuestion.includes('auth') || lowerQuestion.includes('security') || lowerQuestion.includes('login')) {
      const security = developerData.securityGuidelines
      return `Here's the authentication setup for this project:\n\n🔐 **Authentication:**\n- Method: ${security?.authentication?.method || 'JWT'}\n- Token Expiry: ${security?.authentication?.tokenExpiry || '1 hour'}\n- MFA: ${security?.authentication?.mfaEnabled ? 'Enabled ✅' : 'Disabled'}\n\n🛡️ **Authorization:**\n- Model: ${security?.authorization?.model || 'RBAC'}\n- Role Hierarchy: ${security?.authorization?.roleHierarchy || 'Admin > User > Guest'}\n\n📝 **Implementation Tips:**\n1. Store JWT in HTTP-only cookies\n2. Implement token refresh logic\n3. Add proper error handling for auth failures\n4. Use middleware for protected routes`
    }
    
    if (lowerQuestion.includes('test') || lowerQuestion.includes('coverage')) {
      const testing = developerData.testingFramework
      return `Testing configuration for this project:\n\n🧪 **Unit Testing:**\n- Framework: ${testing?.unitTesting?.framework || 'Jest'}\n- Coverage Target: ${testing?.unitTesting?.coverageTarget || '80%'}\n- Mocking: ${testing?.unitTesting?.mockingLibrary || 'Jest mocks'}\n\n🔗 **Integration Testing:**\n- Tool: ${testing?.integrationTesting?.tool || 'Supertest'}\n\n🎭 **E2E Testing:**\n- Framework: ${testing?.e2eTesting?.framework || 'Playwright'}\n- Critical Flows: ${testing?.e2eTesting?.criticalFlows || 'User registration, checkout'}\n\n✅ **Best Practices:**\n- Write tests BEFORE implementation (TDD)\n- Mock external dependencies\n- Use descriptive test names\n- Maintain test data factories`
    }
    
    if (lowerQuestion.includes('api') || lowerQuestion.includes('endpoint') || lowerQuestion.includes('rest')) {
      const docs = developerData.documentation
      return `API development guidelines:\n\n📡 **API Standards:**\n- Documentation Format: ${docs?.apiDocumentation?.format || 'OpenAPI'}\n- Versioning: URL-based (e.g., /api/v1/)\n- Response Format: JSON\n\n🔧 **Implementation:**\n1. Use RESTful conventions (GET, POST, PUT, DELETE)\n2. Return proper HTTP status codes\n3. Include error messages in standard format\n4. Add request validation\n5. Implement rate limiting\n\n📝 **Example Response:**\n\`\`\`json\n{\n  "success": true,\n  "data": { ... },\n  "message": "Operation completed successfully"\n}\n\`\`\`\n\n❌ **Error Response:**\n\`\`\`json\n{\n  "success": false,\n  "error": "Validation failed",\n  "details": ["Email is required"]\n}\n\`\`\``
    }
    
    if (lowerQuestion.includes('database') || lowerQuestion.includes('schema') || lowerQuestion.includes('model')) {
      const security = developerData.securityGuidelines
      return `Database configuration and best practices:\n\n💾 **Data Protection:**\n- Encryption at Rest: ${security?.dataProtection?.encryptionAtRest || 'AES-256'}\n- Encryption in Transit: ${security?.dataProtection?.encryptionInTransit || 'TLS 1.3'}\n- PII Handling: ${security?.dataProtection?.piiHandling || 'Encrypted, access-controlled'}\n\n📊 **Schema Design:**\n1. Normalize to 3NF (avoid data redundancy)\n2. Use appropriate indexes for queries\n3. Define foreign key constraints\n4. Add timestamps (created_at, updated_at)\n5. Use UUIDs for primary keys (security)\n\n🔒 **Security:**\n- Never store passwords in plain text (use bcrypt)\n- Encrypt sensitive fields (SSN, credit cards)\n- Implement row-level security\n- Use prepared statements (prevent SQL injection)`
    }
    
    if (lowerQuestion.includes('deploy') || lowerQuestion.includes('ci/cd') || lowerQuestion.includes('pipeline')) {
      const devops = developerData.devOpsDeployment
      return `Deployment and CI/CD setup:\n\n🚀 **Pipeline Steps:**\n${devops?.cicdPipeline?.pipelineSteps || 'build → test → scan → deploy → notify'}\n\n🏗️ **Infrastructure:**\n- IaC Tool: ${devops?.infrastructure?.iacTool || 'Terraform'}\n- Container Registry: ${devops?.containerRegistry?.registry || 'ECR'}\n- Deployment Strategy: ${devops?.releaseStrategy?.strategy || 'Blue-Green'}\n\n📊 **Monitoring:**\n- Tools: ${devops?.monitoring?.tools || 'Prometheus, Grafana'}\n- Alerting: ${devops?.alerting?.channels || 'Slack, PagerDuty'}\n\n✅ **Checklist:**\n- [ ] Write Dockerfile\n- [ ] Configure CI/CD pipeline\n- [ ] Set environment variables\n- [ ] Add health check endpoint\n- [ ] Configure monitoring/alerts`
    }
    
    if (selectedFeature) {
      return `For the **${selectedFeature.moduleName}** feature:\n\n📋 **Details:**\n- Description: ${selectedFeature.description}\n- Priority: ${selectedFeature.priority}\n- Dependencies: ${selectedFeature.dependencies}\n- Current Status: ${selectedFeature.status}\n\n💡 **Next Steps:**\n1. Review the feature requirements\n2. Use the AI Prompt tabs to generate implementation code\n3. Copy prompts to your AI tool (Cursor, ChatGPT, etc.)\n4. Implement the feature following generated guidelines\n5. Upload your code and mark the feature as complete\n\nIs there a specific aspect of this feature you'd like help with?`
    }
    
    // Generic helpful response
    return `I'm here to help! I have full context of:\n\n✅ Business requirements and features\n✅ UI/UX design guidelines\n✅ Security and compliance standards\n✅ Testing framework configuration\n✅ DevOps and deployment setup\n✅ Documentation requirements\n✅ AI tool configuration\n\nYou can ask me about:\n- Project architecture and tech stack\n- How to implement specific features\n- Design system colors, fonts, components\n- API endpoints and database schema\n- Testing strategies and coverage\n- Security best practices\n- Deployment and CI/CD\n\nWhat would you like to know?`
  }

  const updateFeatureStatus = (status: FeatureProgress['status']) => {
    if (!selectedFeature) return
    
    setFeatureProgress({
      ...featureProgress,
      [selectedFeature.id]: {
        ...featureProgress[selectedFeature.id],
        status
      }
    })
    
    toast.success(`Feature status updated to: ${status}`)
  }

  const saveFeatureOutput = (field: 'code' | 'notes', value: string) => {
    if (!selectedFeature) return
    
    const progress = featureProgress[selectedFeature.id] || {
      featureId: selectedFeature.id,
      status: 'in-progress',
      outputs: {},
      aiUsage: { promptsUsed: [], chatCount: 0 }
    }
    
    setFeatureProgress({
      ...featureProgress,
      [selectedFeature.id]: {
        ...progress,
        outputs: {
          ...progress.outputs,
          [field]: value
        }
      }
    })
  }

  const promptCategories = [
    { id: 'ui', label: 'UI Components', icon: Layout, description: 'Frontend components and styling' },
    { id: 'api', label: 'API / Service', icon: Server, description: 'Backend endpoints and business logic' },
    { id: 'database', label: 'Database', icon: Database, description: 'Schema and data access layer' },
    { id: 'integration', label: 'Integration', icon: Workflow, description: 'External APIs and webhooks' },
    { id: 'testing', label: 'Testing', icon: TestTube, description: 'Unit, integration, E2E tests' },
    { id: 'documentation', label: 'Documentation', icon: FileText, description: 'API docs and guides' },
    { id: 'deployment', label: 'Deployment', icon: Rocket, description: 'CI/CD and infrastructure' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'In Progress':
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'Review':
      case 'review':
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Completed':
      case 'completed':
        return 'default'
      case 'In Progress':
      case 'in-progress':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (features.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl mb-2">No Features Available Yet</h3>
            <p className="text-muted-foreground mb-6">
              The Business Analyst needs to define features in the Modules & Features section first.
            </p>
            <p className="text-sm text-muted-foreground">
              Once features are added, you'll be able to select them and get AI-powered development assistance!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
          AI-Assisted Developer Workspace
        </h2>
        <p className="text-muted-foreground">
          Feature-based development assistance and project-wide AI guidance
        </p>
      </div>

      {/* Section Navigation - BA Dashboard Style */}
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={activeSection === 'features' ? 'default' : 'outline'}
              onClick={() => setActiveSection('features')}
              className={`gap-2 ${activeSection === 'features' ? 'bg-primary hover:bg-primary/90 neon-glow' : 'border-primary/30'}`}
            >
              <Code2 className="w-4 h-4" />
              Features & Modules
            </Button>
            <Button
              variant={activeSection === 'ai-assistant' ? 'default' : 'outline'}
              onClick={() => setActiveSection('ai-assistant')}
              className={`gap-2 ${activeSection === 'ai-assistant' ? 'bg-primary hover:bg-primary/90 neon-glow' : 'border-primary/30'}`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Assistance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Section Content */}
      {activeSection === 'features' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FeaturesWorkspace
            features={features}
            selectedFeature={selectedFeature}
            featureProgress={featureProgress}
            promptCategories={promptCategories}
            activePromptTab={activePromptTab}
            currentProgress={currentProgress}
            onFeatureSelect={handleFeatureSelect}
            onCopyPrompt={handleCopyPrompt}
            onUpdateStatus={updateFeatureStatus}
            onSaveOutput={saveFeatureOutput}
            setActivePromptTab={setActivePromptTab}
            getStatusIcon={getStatusIcon}
            getStatusBadgeVariant={getStatusBadgeVariant}
          />
        </div>
      )}

      {activeSection === 'ai-assistant' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AIAssistanceWorkspace
            projectName={projectName}
            baData={baData}
            developerData={developerData}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            setChatMessages={setChatMessages}
            onSendMessage={handleSendMessage}
          />
        </div>
      )}
    </div>
  )
}

// Features Workspace Component
interface FeaturesWorkspaceProps {
  features: ModuleFeature[]
  selectedFeature: ModuleFeature | null
  featureProgress: Record<string, FeatureProgress>
  promptCategories: any[]
  activePromptTab: string
  currentProgress: FeatureProgress | null
  onFeatureSelect: (feature: ModuleFeature) => void
  onCopyPrompt: (category: string) => void
  onUpdateStatus: (status: FeatureProgress['status']) => void
  onSaveOutput: (field: 'code' | 'notes', value: string) => void
  setActivePromptTab: (tab: string) => void
  getStatusIcon: (status: string) => JSX.Element
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline"
}

function FeaturesWorkspace({
  features,
  selectedFeature,
  featureProgress,
  promptCategories,
  activePromptTab,
  currentProgress,
  onFeatureSelect,
  onCopyPrompt,
  onUpdateStatus,
  onSaveOutput,
  setActivePromptTab,
  getStatusIcon,
  getStatusBadgeVariant
}: FeaturesWorkspaceProps) {
  // State for feature search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc')
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  // Use only BA-defined features
  const allFeatures = features

  // Apply filters
  const filteredFeatures = allFeatures.filter(feature => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = feature.moduleName.toLowerCase().includes(query)
      const matchesDesc = feature.description.toLowerCase().includes(query)
      const matchesDeps = feature.dependencies?.toLowerCase().includes(query)
      if (!matchesName && !matchesDesc && !matchesDeps) return false
    }

    // Priority filter
    if (filterPriority !== 'all' && feature.priority !== filterPriority) return false

    // Status filter
    if (filterStatus !== 'all' && feature.status !== filterStatus) return false

    return true
  })

  // Apply sorting
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.moduleName.localeCompare(b.moduleName)
      case 'name-desc':
        return b.moduleName.localeCompare(a.moduleName)
      case 'priority-high':
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
      case 'priority-low':
        const priorityOrderLow = { 'Low': 0, 'Medium': 1, 'High': 2 }
        return (priorityOrderLow[a.priority as keyof typeof priorityOrderLow] || 3) - (priorityOrderLow[b.priority as keyof typeof priorityOrderLow] || 3)
      case 'status':
        return (a.status || '').localeCompare(b.status || '')
      default:
        return 0
    }
  })

  // Apply pagination
  const totalPages = Math.ceil(sortedFeatures.length / itemsPerPage)
  const paginatedFeatures = itemsPerPage === 999 
    ? sortedFeatures 
    : sortedFeatures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset to page 1 when filters change
  useState(() => {
    setCurrentPage(1)
  })

  if (allFeatures.length === 0) {
    return (
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl mb-2">No Features Available Yet</h3>
          <p className="text-muted-foreground mb-6">
            The Business Analyst needs to define features in the Modules & Features section first.
          </p>
          <p className="text-sm text-muted-foreground">
            Once features are added, you'll be able to select them and get AI-powered development assistance!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Features Grid */}
      <div>
        {/* Advanced Controls Bar */}
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm mb-4">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search & Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Global Search */}
                <div className="relative">
                  <Input
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-input-background border-primary/30 pl-9"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Priority Filter */}
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="bg-input-background border-primary/30">
                    <SelectValue placeholder="Filter by Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High Priority</SelectItem>
                    <SelectItem value="Medium">Medium Priority</SelectItem>
                    <SelectItem value="Low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-input-background border-primary/30">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Reference">Reference/Templates</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Options */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-input-background border-primary/30">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="priority-high">Priority (High First)</SelectItem>
                    <SelectItem value="priority-low">Priority (Low First)</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions & View Controls Row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {/* Bulk Selection */}
                  <Button
                    variant={selectedFeatureIds.length > 0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (selectedFeatureIds.length === filteredFeatures.length) {
                        setSelectedFeatureIds([])
                      } else {
                        setSelectedFeatureIds(filteredFeatures.map(f => f.id))
                      }
                    }}
                    className="gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedFeatureIds.length > 0 ? `Selected (${selectedFeatureIds.length})` : 'Select All'}
                  </Button>

                  {selectedFeatureIds.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast.success(`Exported ${selectedFeatureIds.length} features`)
                          setSelectedFeatureIds([])
                        }}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Export Selected
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFeatureIds([])}
                        className="gap-2"
                      >
                        Clear
                      </Button>
                    </>
                  )}

                  {/* Reset Filters */}
                  {(searchQuery || filterPriority !== 'all' || filterStatus !== 'all' || sortBy !== 'name-asc') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('')
                        setFilterPriority('all')
                        setFilterStatus('all')
                        setSortBy('name-asc')
                      }}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reset Filters
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Showing {paginatedFeatures.length} of {filteredFeatures.length} features</span>
                  <span>•</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => {
                    setItemsPerPage(Number(v))
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="w-20 h-8 bg-input-background border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="999">All</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>per page</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* All Features (BA-Defined) */}
          {paginatedFeatures.map((feature) => {
            const progress = featureProgress[feature.id]
            const isActive = selectedFeature?.id === feature.id
            const isChecked = selectedFeatureIds.includes(feature.id)
            
            return (
              <Card
                key={feature.id}
                className={`cursor-pointer transition-all hover:scale-[1.02] relative group ${
                  isActive
                    ? 'border-primary bg-primary/10 neon-glow'
                    : 'border-primary/20 hover:border-primary/50 hover:bg-card/50'
                } ${isChecked ? 'ring-2 ring-primary/50' : ''}`}
                onClick={(e) => {
                  // Don't select if clicking checkbox
                  if ((e.target as HTMLElement).closest('.checkbox-wrapper')) return
                  
                  onFeatureSelect(feature)
                  // Auto-scroll to detail section
                  setTimeout(() => {
                    document.getElementById('feature-detail-section')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }, 100)
                }}
              >
                <CardContent className="p-4">
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 right-2 checkbox-wrapper opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation()
                        if (isChecked) {
                          setSelectedFeatureIds(selectedFeatureIds.filter(id => id !== feature.id))
                        } else {
                          setSelectedFeatureIds([...selectedFeatureIds, feature.id])
                        }
                      }}
                      className="w-4 h-4 rounded border-primary/50 bg-input-background cursor-pointer"
                    />
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 pr-6">
                      {getStatusIcon(progress?.status || feature.status)}
                      <h4 className="font-medium line-clamp-1 text-sm">{feature.moduleName}</h4>
                    </div>
                    <Badge 
                      variant={getStatusBadgeVariant(feature.priority)} 
                      className="text-xs flex-shrink-0"
                    >
                      {feature.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                    {feature.description}
                  </p>

                  {progress && (
                    <div className="flex gap-3 text-xs text-muted-foreground border-t border-primary/10 pt-2">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {progress.aiUsage.promptsUsed.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {progress.aiUsage.chatCount}
                      </span>
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <p className="text-xs flex items-center gap-1 text-primary">
                        <Sparkles className="w-3 h-3" />
                        Selected - View details below
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-9 h-9"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredFeatures.length === 0 && (
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg mb-2">No features found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setFilterPriority('all')
                  setFilterStatus('all')
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feature Detail Section */}
      <div id="feature-detail-section" className="scroll-mt-6">
        {!selectedFeature ? (
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Select a Feature to Get Started</h3>
              <p className="text-muted-foreground">
                Choose a feature from the grid above to access AI prompts, implementation tools, and tracking
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Feature Overview */}
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm neon-glow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                      {selectedFeature.moduleName}
                    </CardTitle>
                    <CardDescription className="mt-2">{selectedFeature.description}</CardDescription>
                  </div>
                  <Select
                    value={currentProgress?.status || 'todo'}
                    onValueChange={(value: any) => onUpdateStatus(value)}
                  >
                    <SelectTrigger className="w-[180px] bg-input-background border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Priority</Label>
                    <p className="text-sm">{selectedFeature.priority}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Dependencies</Label>
                    <p className="text-sm">{selectedFeature.dependencies}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Business Impact</Label>
                    <p className="text-sm">{selectedFeature.businessImpact}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Original Status</Label>
                    <p className="text-sm">{selectedFeature.status}</p>
                  </div>
                </div>

                {/* Module-Specific Recommended Features */}
                {(() => {
                  const getRecommendedFeatures = (moduleName: string): string[] => {
                    const featureMap: Record<string, string[]> = {
                      'Login & Authentication': [
                        'JWT token management',
                        'OAuth 2.0 integration (Google, Facebook)',
                        'Two-factor authentication (2FA)',
                        'Password reset flow',
                        'Email verification',
                        'Session timeout handling',
                        'Remember me functionality',
                        'Account lockout after failed attempts'
                      ],
                      'Product Catalogue': [
                        'Grid & list view toggle',
                        'Advanced search with autocomplete',
                        'Multi-level category navigation',
                        'Filter by price, brand, rating',
                        'Sort by relevance, price, popularity',
                        'Product image gallery with zoom',
                        'Quick view modal',
                        'Recently viewed products',
                        'Product comparison feature'
                      ],
                      'Shopping Cart': [
                        'Add/remove items with animations',
                        'Quantity selector with stock validation',
                        'Cart persistence (localStorage/session)',
                        'Real-time price calculation',
                        'Promo code/coupon application',
                        'Save for later functionality',
                        'Mini cart preview',
                        'Cart item recommendations'
                      ],
                      'Checkout Module': [
                        'Multi-step checkout wizard',
                        'Shipping address autocomplete',
                        'Multiple delivery options',
                        'Automatic tax calculation',
                        'Order summary with breakdown',
                        'Guest checkout option',
                        'Saved addresses management',
                        'Shipping cost estimation'
                      ],
                      'Payment Processing': [
                        'Stripe payment integration',
                        'PayPal checkout',
                        'Apple Pay / Google Pay support',
                        'Credit card form validation',
                        'PCI-DSS compliance',
                        'Payment retry mechanism',
                        'Refund processing',
                        'Payment status tracking',
                        'Secure payment confirmation'
                      ],
                      'Order Management': [
                        'Order history with filters',
                        'Real-time order tracking',
                        'Order details view',
                        'Invoice download (PDF)',
                        'Order cancellation flow',
                        'Reorder functionality',
                        'Return/refund requests',
                        'Order status notifications'
                      ],
                      'User Profile': [
                        'Profile information editor',
                        'Multiple saved addresses',
                        'Payment method management',
                        'Wishlist with sharing',
                        'Notification preferences',
                        'Order history access',
                        'Account security settings',
                        'Profile picture upload'
                      ],
                      'Inventory Management': [
                        'Real-time stock level display',
                        'Low stock alerts (admin)',
                        'Out-of-stock notifications',
                        'Bulk inventory updates',
                        'Stock reservation during checkout',
                        'Inventory history tracking',
                        'SKU management',
                        'Warehouse location tracking'
                      ],
                      'Product Reviews & Ratings': [
                        'Star rating system',
                        'Written review submission',
                        'Review moderation queue',
                        'Helpful/not helpful voting',
                        'Verified purchase badges',
                        'Review images upload',
                        'Review sorting & filtering',
                        'Review response by seller'
                      ],
                      'Search & Recommendations': [
                        'AI-powered search engine',
                        'Search autocomplete',
                        'Spell correction & suggestions',
                        'Personalized recommendations',
                        'Trending products section',
                        'Recently viewed items',
                        'Similar products',
                        'Frequently bought together'
                      ],
                      'Admin Dashboard': [
                        'Product CRUD operations',
                        'Order management panel',
                        'User management',
                        'Sales analytics & reports',
                        'Inventory control dashboard',
                        'Promotional campaign manager',
                        'Revenue tracking',
                        'Customer insights'
                      ],
                      'Notifications & Alerts': [
                        'Email notifications',
                        'SMS alerts integration',
                        'Push notifications',
                        'Order confirmation emails',
                        'Shipping update notifications',
                        'Promotional message campaigns',
                        'Abandoned cart reminders',
                        'Price drop alerts'
                      ]
                    }
                    
                    return featureMap[moduleName] || []
                  }

                  const recommendedFeatures = getRecommendedFeatures(selectedFeature.moduleName)

                  if (recommendedFeatures.length === 0) return null

                  return (
                    <div className="border-t border-primary/20 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <Label className="text-sm text-primary">Recommended Features ({recommendedFeatures.length})</Label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {recommendedFeatures.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-md bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            {/* AI Prompt Workspace & Implementation Output - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* AI Prompt Generator */}
              <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Prompt Generator
                  </CardTitle>
                  <CardDescription>Context-aware prompts for each layer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activePromptTab} onValueChange={setActivePromptTab}>
                    <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1 h-auto p-1 bg-card/50 border border-primary/20">
                      {promptCategories.map((cat) => (
                        <TabsTrigger
                          key={cat.id}
                          value={cat.id}
                          className="p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          title={cat.description}
                        >
                          <cat.icon className="w-4 h-4" />
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {promptCategories.map((cat) => {
                      // Generate the actual prompt content
                      const generatePromptContent = () => {
                        if (!selectedFeature) return ''
                        
                        let promptContent = `# ${cat.label} Prompt for ${selectedFeature.moduleName}\n\n`
                        promptContent += `## Feature Overview\n`
                        promptContent += `**Module:** ${selectedFeature.moduleName}\n`
                        promptContent += `**Description:** ${selectedFeature.description}\n`
                        promptContent += `**Priority:** ${selectedFeature.priority}\n`
                        promptContent += `**Business Impact:** ${selectedFeature.businessImpact}\n`
                        promptContent += `**Dependencies:** ${selectedFeature.dependencies}\n\n`

                        // Category-specific content
                        switch (cat.id) {
                          case 'architecture':
                            promptContent += `## Architecture Guidance\n\n`
                            promptContent += `Create a detailed architectural design for the **${selectedFeature.moduleName}** feature that includes:\n\n`
                            promptContent += `1. **Component Structure**\n`
                            promptContent += `   - Break down into logical components\n`
                            promptContent += `   - Define component responsibilities\n`
                            promptContent += `   - Specify props and state management\n\n`
                            promptContent += `2. **Data Flow**\n`
                            promptContent += `   - API endpoints and data models\n`
                            promptContent += `   - State management approach (Context, Redux, etc.)\n`
                            promptContent += `   - Data fetching and caching strategies\n\n`
                            promptContent += `3. **Integration Points**\n`
                            promptContent += `   - How it connects with: ${selectedFeature.dependencies}\n`
                            promptContent += `   - Shared utilities and services\n\n`
                            promptContent += `4. **Performance Considerations**\n`
                            promptContent += `   - Code splitting strategies\n`
                            promptContent += `   - Lazy loading requirements\n`
                            promptContent += `   - Optimization opportunities\n`
                            break

                          case 'design':
                            promptContent += `## Design Implementation\n\n`
                            promptContent += `Design and implement the UI for **${selectedFeature.moduleName}** following these guidelines:\n\n`
                            promptContent += `1. **Component Design**\n`
                            promptContent += `   - Use Tailwind CSS for styling\n`
                            promptContent += `   - Follow the project's design system\n`
                            promptContent += `   - Ensure mobile responsiveness\n\n`
                            promptContent += `2. **User Experience**\n`
                            promptContent += `   - Loading states and error handling\n`
                            promptContent += `   - Form validation and feedback\n`
                            promptContent += `   - Accessibility (ARIA labels, keyboard navigation)\n\n`
                            promptContent += `3. **Visual Hierarchy**\n`
                            promptContent += `   - Primary, secondary, and tertiary actions\n`
                            promptContent += `   - Content organization and spacing\n`
                            promptContent += `   - Color usage for status indicators\n\n`
                            promptContent += `4. **Interactive Elements**\n`
                            promptContent += `   - Hover states and transitions\n`
                            promptContent += `   - Click/tap feedback\n`
                            promptContent += `   - Animation and micro-interactions\n`
                            break

                          case 'security':
                            promptContent += `## Security Implementation\n\n`
                            promptContent += `Implement security measures for **${selectedFeature.moduleName}**:\n\n`
                            promptContent += `1. **Authentication & Authorization**\n`
                            promptContent += `   - User authentication requirements\n`
                            promptContent += `   - Role-based access control\n`
                            promptContent += `   - Token management and validation\n\n`
                            promptContent += `2. **Data Protection**\n`
                            promptContent += `   - Input validation and sanitization\n`
                            promptContent += `   - XSS and CSRF prevention\n`
                            promptContent += `   - Secure data transmission\n\n`
                            promptContent += `3. **API Security**\n`
                            promptContent += `   - Rate limiting and throttling\n`
                            promptContent += `   - API key/token security\n`
                            promptContent += `   - Request validation\n\n`
                            promptContent += `4. **Compliance**\n`
                            promptContent += `   - Data privacy requirements\n`
                            promptContent += `   - Audit logging\n`
                            promptContent += `   - Security headers\n`
                            break

                          case 'testing':
                            promptContent += `## Testing Strategy\n\n`
                            promptContent += `Create comprehensive tests for **${selectedFeature.moduleName}**:\n\n`
                            promptContent += `1. **Unit Tests**\n`
                            promptContent += `   - Test individual functions and components\n`
                            promptContent += `   - Mock dependencies: ${selectedFeature.dependencies}\n`
                            promptContent += `   - Edge cases and error scenarios\n\n`
                            promptContent += `2. **Integration Tests**\n`
                            promptContent += `   - Test component interactions\n`
                            promptContent += `   - API integration testing\n`
                            promptContent += `   - State management testing\n\n`
                            promptContent += `3. **E2E Tests**\n`
                            promptContent += `   - User flow scenarios\n`
                            promptContent += `   - Critical path testing\n`
                            promptContent += `   - Cross-browser compatibility\n\n`
                            promptContent += `4. **Coverage Goals**\n`
                            promptContent += `   - Aim for 80%+ code coverage\n`
                            promptContent += `   - Focus on business logic\n`
                            promptContent += `   - Test error handling\n`
                            break

                          case 'devops':
                            promptContent += `## DevOps & Deployment\n\n`
                            promptContent += `Setup CI/CD for **${selectedFeature.moduleName}**:\n\n`
                            promptContent += `1. **Build Pipeline**\n`
                            promptContent += `   - Automated builds on commit\n`
                            promptContent += `   - Linting and type checking\n`
                            promptContent += `   - Bundle optimization\n\n`
                            promptContent += `2. **Testing Pipeline**\n`
                            promptContent += `   - Run unit and integration tests\n`
                            promptContent += `   - Security scanning\n`
                            promptContent += `   - Performance testing\n\n`
                            promptContent += `3. **Deployment Strategy**\n`
                            promptContent += `   - Environment configuration (dev, staging, prod)\n`
                            promptContent += `   - Feature flags for gradual rollout\n`
                            promptContent += `   - Rollback procedures\n\n`
                            promptContent += `4. **Monitoring**\n`
                            promptContent += `   - Error tracking setup\n`
                            promptContent += `   - Performance monitoring\n`
                            promptContent += `   - Usage analytics\n`
                            break

                          case 'documentation':
                            promptContent += `## Documentation Requirements\n\n`
                            promptContent += `Create documentation for **${selectedFeature.moduleName}**:\n\n`
                            promptContent += `1. **Code Documentation**\n`
                            promptContent += `   - JSDoc comments for functions\n`
                            promptContent += `   - Component prop documentation\n`
                            promptContent += `   - Complex logic explanations\n\n`
                            promptContent += `2. **User Documentation**\n`
                            promptContent += `   - Feature overview and benefits\n`
                            promptContent += `   - Step-by-step usage guide\n`
                            promptContent += `   - Common use cases\n\n`
                            promptContent += `3. **Developer Guide**\n`
                            promptContent += `   - Setup and configuration\n`
                            promptContent += `   - API documentation\n`
                            promptContent += `   - Troubleshooting guide\n\n`
                            promptContent += `4. **Examples**\n`
                            promptContent += `   - Code snippets\n`
                            promptContent += `   - Integration examples\n`
                            promptContent += `   - Best practices\n`
                            break

                          case 'review':
                            promptContent += `## Code Review Checklist\n\n`
                            promptContent += `Review criteria for **${selectedFeature.moduleName}**:\n\n`
                            promptContent += `1. **Code Quality**\n`
                            promptContent += `   - Follows coding standards and conventions\n`
                            promptContent += `   - No code smells or anti-patterns\n`
                            promptContent += `   - Proper error handling\n\n`
                            promptContent += `2. **Performance**\n`
                            promptContent += `   - Efficient algorithms\n`
                            promptContent += `   - No unnecessary re-renders\n`
                            promptContent += `   - Optimized bundle size\n\n`
                            promptContent += `3. **Security**\n`
                            promptContent += `   - Input validation\n`
                            promptContent += `   - No sensitive data exposure\n`
                            promptContent += `   - Secure dependencies\n\n`
                            promptContent += `4. **Testing**\n`
                            promptContent += `   - Adequate test coverage\n`
                            promptContent += `   - Tests passing\n`
                            promptContent += `   - Edge cases covered\n\n`
                            promptContent += `5. **Documentation**\n`
                            promptContent += `   - Code comments where needed\n`
                            promptContent += `   - README updated\n`
                            promptContent += `   - API docs current\n`
                            break
                        }

                        promptContent += `\n---\n\n`
                        promptContent += `## AI Assistant Instructions\n\n`
                        promptContent += `Please provide a detailed implementation following the guidelines above. Include:\n`
                        promptContent += `- Specific code examples in TypeScript/React\n`
                        promptContent += `- Configuration files and setup instructions\n`
                        promptContent += `- Best practices and recommendations\n`
                        promptContent += `- Potential gotchas and how to avoid them\n\n`
                        promptContent += `**Priority Level:** ${selectedFeature.priority}\n`
                        promptContent += `**Expected Impact:** ${selectedFeature.businessImpact}\n`

                        return promptContent
                      }

                      const promptText = generatePromptContent()

                      return (
                        <TabsContent key={cat.id} value={cat.id} className="mt-4 space-y-3">
                          {/* Category Header */}
                          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg">
                            <div className="p-2 rounded-lg bg-primary/20">
                              <cat.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{cat.label}</h4>
                              <p className="text-xs text-muted-foreground">{cat.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs border-primary/30">
                              {selectedFeature?.priority}
                            </Badge>
                          </div>

                          {/* Prompt Preview */}
                          <Card className="border-primary/20 bg-card/50">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  Generated Prompt Preview
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {promptText.split('\n').length} lines
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {promptText.length} chars
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="relative">
                                <div className="max-h-[400px] overflow-y-auto p-4 bg-background/80 border border-primary/20 rounded-lg font-mono text-xs leading-relaxed">
                                  <pre className="whitespace-pre-wrap text-foreground">{promptText}</pre>
                                </div>
                                
                                {/* Copy Button Overlay */}
                                <Button
                                  onClick={() => {
                                    onCopyPrompt(promptText, `${cat.label} prompt`)
                                    toast.success(`${cat.label} prompt copied!`)
                                  }}
                                  size="sm"
                                  className="absolute top-2 right-2 gap-2 bg-primary/90 hover:bg-primary shadow-lg"
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy Prompt
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => {
                                onCopyPrompt(promptText, `${cat.label} prompt`)
                                toast.success(`${cat.label} prompt copied to clipboard!`)
                              }}
                              className="flex-1 gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90"
                            >
                              <Copy className="w-4 h-4" />
                              Generate Code
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                const blob = new Blob([promptText], { type: 'text/plain' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `${selectedFeature?.moduleName}-${cat.id}-prompt.txt`
                                a.click()
                                URL.revokeObjectURL(url)
                                toast.success('Prompt downloaded!')
                              }}
                              className="gap-2 border-primary/30"
                            >
                              <Upload className="w-4 h-4 rotate-180" />
                              
                            </Button>
                          </div>

                          {/* Context Info */}
                          <div className="flex items-start gap-2 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-md">
                            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                              This prompt includes full project context, feature details, dependencies, and {cat.label.toLowerCase()} best practices. 
                              Use it with your AI assistant for context-aware code generation.
                            </p>
                          </div>
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Implementation Output & Progress */}
              <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Implementation Output
                  </CardTitle>
                  <CardDescription>Track your code and progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Code / Implementation Notes</Label>
                    <Textarea
                      value={currentProgress?.outputs?.code || ''}
                      onChange={(e) => onSaveOutput('code', e.target.value)}
                      placeholder="Paste your implementation code, file paths, or implementation details..."
                      className="min-h-[120px] bg-input-background border-primary/30 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Developer Notes</Label>
                    <Textarea
                      value={currentProgress?.outputs?.notes || ''}
                      onChange={(e) => onSaveOutput('notes', e.target.value)}
                      placeholder="Add notes about challenges, decisions, or questions..."
                      className="min-h-[80px] bg-input-background border-primary/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 border border-primary/20 rounded-md">
                    <div>
                      <Label className="text-xs text-muted-foreground">AI Prompts Used</Label>
                      <p className="text-lg font-medium">{currentProgress?.aiUsage.promptsUsed.length || 0}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <p className="text-lg font-medium capitalize">{currentProgress?.status.replace('-', ' ') || 'Todo'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// AI Assistance Workspace Component
interface AIAssistanceWorkspaceProps {
  projectName: string
  baData: any
  developerData: any
  chatMessages: ChatMessage[]
  chatInput: string
  setChatInput: (value: string) => void
  setChatMessages: (messages: ChatMessage[]) => void
  onSendMessage: () => void
}

function AIAssistanceWorkspace({
  projectName,
  baData,
  developerData,
  chatMessages,
  chatInput,
  setChatInput,
  setChatMessages,
  onSendMessage
}: AIAssistanceWorkspaceProps) {
  const suggestedQuestions = [
    {
      icon: Layout,
      question: "What are the design system colors and fonts?",
      category: "Design"
    },
    {
      icon: Shield,
      question: "How is authentication configured?",
      category: "Security"
    },
    {
      icon: TestTube,
      question: "What testing frameworks are we using?",
      category: "Testing"
    },
    {
      icon: Server,
      question: "What's the API documentation format?",
      category: "API"
    },
    {
      icon: Database,
      question: "How should I handle database encryption?",
      category: "Database"
    },
    {
      icon: Rocket,
      question: "What's the CI/CD pipeline setup?",
      category: "DevOps"
    }
  ]

  const projectContext = {
    overview: baData.projectOverview || 'Not defined yet',
    features: baData.modulesFeatures?.length || 0,
    designSystem: baData.uiuxGuidelines?.branding?.primaryColor ? 'Configured' : 'Not configured',
    security: developerData.securityGuidelines?.authentication?.method || 'Not configured',
    testing: developerData.testingFramework?.unitTesting?.framework || 'Not configured',
    devops: developerData.devOpsDeployment?.cicdPipeline?.pipelineSteps ? 'Configured' : 'Not configured'
  }

  return (
    <div className="space-y-6">
      {/* 1. Project Context - Full Width */}
      <div>
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-primary/10 via-cyan-500/5 to-transparent border-b border-primary/20">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20 neon-glow">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <span>Project Context</span>
            </CardTitle>
            <CardDescription>AI-powered with full project knowledge</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Context Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Features Counter */}
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
                <div className="flex items-center gap-2 mb-1">
                  <Layout className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Features</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-primary group-hover:scale-110 transition-transform inline-block">{projectContext.features}</span>
                  <span className="text-xs text-muted-foreground">defined</span>
                </div>
              </div>

              {/* Design System Status */}
              <div className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                projectContext.designSystem === 'Configured' 
                  ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40' 
                  : 'bg-muted/20 border-muted-foreground/20 hover:border-muted-foreground/40'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className={`w-4 h-4 ${projectContext.designSystem === 'Configured' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs text-muted-foreground">Design</span>
                </div>
                <div className="flex items-center gap-1">
                  {projectContext.designSystem === 'Configured' ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={`text-xs ${projectContext.designSystem === 'Configured' ? 'text-primary' : 'text-muted-foreground'}`}>
                    {projectContext.designSystem === 'Configured' ? 'Ready' : 'Setup'}
                  </span>
                </div>
              </div>

              {/* Security Status */}
              <div className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                projectContext.security !== 'Not configured'
                  ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40' 
                  : 'bg-muted/20 border-muted-foreground/20 hover:border-muted-foreground/40'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className={`w-4 h-4 ${projectContext.security !== 'Not configured' ? 'text-cyan-400' : 'text-muted-foreground'}`} />
                  <span className="text-xs text-muted-foreground">Security</span>
                </div>
                <div className="flex items-center gap-1">
                  {projectContext.security !== 'Not configured' ? (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={`text-xs ${projectContext.security !== 'Not configured' ? 'text-cyan-400' : 'text-muted-foreground'}`}>
                    {projectContext.security !== 'Not configured' ? 'Secured' : 'Setup'}
                  </span>
                </div>
              </div>

              {/* Testing Status */}
              <div className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                projectContext.testing !== 'Not configured'
                  ? 'bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40' 
                  : 'bg-muted/20 border-muted-foreground/20 hover:border-muted-foreground/40'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <TestTube className={`w-4 h-4 ${projectContext.testing !== 'Not configured' ? 'text-purple-400' : 'text-muted-foreground'}`} />
                  <span className="text-xs text-muted-foreground">Testing</span>
                </div>
                <div className="flex items-center gap-1">
                  {projectContext.testing !== 'Not configured' ? (
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={`text-xs ${projectContext.testing !== 'Not configured' ? 'text-purple-400' : 'text-muted-foreground'}`}>
                    {projectContext.testing !== 'Not configured' ? 'Ready' : 'Setup'}
                  </span>
                </div>
              </div>
            </div>

            {/* DevOps Pipeline Status */}
            <div className={`p-4 rounded-lg border ${
              projectContext.devops === 'Configured'
                ? 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/20' 
                : 'bg-muted/20 border-muted-foreground/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className={`w-4 h-4 ${projectContext.devops === 'Configured' ? 'text-orange-400' : 'text-muted-foreground'}`} />
                  <span className="text-sm">DevOps Pipeline</span>
                </div>
                <Badge variant={projectContext.devops === 'Configured' ? 'default' : 'outline'} className="text-xs">
                  {projectContext.devops}
                </Badge>
              </div>
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    projectContext.devops === 'Configured' 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400 w-full' 
                      : 'w-0'
                  }`}
                />
              </div>
            </div>

            {/* Context Completeness */}
            <div className="pt-3 border-t border-primary/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Context Completeness</span>
                <span className="text-primary">
                  {Math.round((
                    [
                      projectContext.features > 0,
                      projectContext.designSystem === 'Configured',
                      projectContext.security !== 'Not configured',
                      projectContext.testing !== 'Not configured',
                      projectContext.devops === 'Configured'
                    ].filter(Boolean).length / 5
                  ) * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>AI has access to all configured sections</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. AI Project Assistant - Full Width */}
      <div>
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm ai-chat-card">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-cyan-500/5 to-transparent border-b border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 neon-glow">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                    AI Project Assistant
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-primary">Online</span>
                  </div>
                </CardTitle>
                <CardDescription className="mt-1.5">
                  Context-aware AI assistant for {projectName}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setChatMessages([])
                  toast.success('Chat history cleared')
                }}
                className="gap-2 border-primary/20 hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col h-[600px]">
              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background/50 to-background/30">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-md">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 neon-glow">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg">Start a Conversation</h3>
                        <p className="text-sm text-muted-foreground">
                          Ask me anything about architecture, design patterns, security best practices, testing strategies, or deployment workflows.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center pt-2">
                        <Badge variant="outline" className="text-xs border-primary/30">Full Context</Badge>
                        <Badge variant="outline" className="text-xs border-cyan-500/30">Smart Suggestions</Badge>
                        <Badge variant="outline" className="text-xs border-purple-500/30">Code Examples</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl p-4 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
                            : 'bg-card border border-primary/20 shadow-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className={`text-xs font-medium ${message.role === 'user' ? 'text-primary-foreground/80' : 'text-primary'}`}>
                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(message.content)
                              toast.success('Message copied')
                            }}
                            className={`h-auto p-1 opacity-0 hover:opacity-100 transition-opacity ${
                              message.role === 'user' ? 'hover:bg-primary-foreground/10' : 'hover:bg-primary/10'
                            }`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
                          <span className={`text-xs ${message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-primary/20 bg-card/80 backdrop-blur-sm p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        onSendMessage()
                      }
                    }}
                    placeholder="Type your question... (Press Enter to send)"
                    className="ai-chat-input bg-input-background border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <Button
                    onClick={onSendMessage}
                    disabled={!chatInput.trim()}
                    className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>
                      Context: {projectContext.features} features • {projectContext.designSystem} • Security • Testing • DevOps
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Enter</kbd>
                    <span>to send</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Quick Questions - Full Width */}
      <div>
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Quick Questions
            </CardTitle>
            <CardDescription>One-click AI assistance by category</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Group questions by category in a responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(
                suggestedQuestions.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = []
                  acc[item.category].push(item)
                  return acc
                }, {} as Record<string, typeof suggestedQuestions>)
              ).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-primary/40" />
                    <span className="text-xs text-primary uppercase tracking-wider px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                      {category}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/20 to-primary/40" />
                  </div>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <Button
                        key={idx}
                        onClick={() => {
                          setChatInput(item.question)
                          // Auto-scroll to chat
                          setTimeout(() => {
                            const chatCard = document.querySelector('.ai-chat-card')
                            chatCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            setTimeout(() => {
                              document.querySelector<HTMLInputElement>('.ai-chat-input')?.focus()
                            }, 300)
                          }, 100)
                        }}
                        variant="outline"
                        className="w-full justify-start text-left border-primary/20 hover:bg-primary/10 hover:border-primary/40 h-auto py-3 transition-all group"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                            <item.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs leading-relaxed line-clamp-2">{item.question}</div>
                          </div>
                          <Send className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
