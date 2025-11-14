import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { toast } from 'sonner'
import { 
  Send,
  Loader2,
  FolderOpen,
  Shield,
  ClipboardCheck,
  FileText,
  Database,
  Rocket,
  X,
  Circle
} from 'lucide-react'
import { vibePromptsAPI } from '../utils/api'

interface VibePromptGeneratorProps {
  projectId: string
  projectName: string
  applicationType?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickQuestions = [
  {
    category: 'DESIGN',
    icon: FolderOpen,
    question: "What are the design system colors and fonts?",
    color: 'text-blue-400'
  },
  {
    category: 'SECURITY',
    icon: Shield,
    question: "How is authentication configured?",
    color: 'text-red-400'
  },
  {
    category: 'TESTING',
    icon: ClipboardCheck,
    question: "What testing frameworks are we using?",
    color: 'text-green-400'
  },
  {
    category: 'API',
    icon: FileText,
    question: "What's the API documentation format?",
    color: 'text-purple-400'
  },
  {
    category: 'DATABASE',
    icon: Database,
    question: "How should I handle database encryption?",
    color: 'text-yellow-400'
  },
  {
    category: 'DEVOPS',
    icon: Rocket,
    question: "What's the CI/CD pipeline setup?",
    color: 'text-cyan-400'
  }
]

export default function VibePromptGenerator({ projectId, projectName, applicationType }: VibePromptGeneratorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Welcome to ${projectName}! 👋\nI'm your AI assistant with full project context. I can help you with:\n- Understanding project architecture and standards\n- Generating code following design guidelines\n- API integration and database queries\n- Testing strategies and security best practices\n- Deployment and CI/CD workflows\n\nSelect a feature to get started, or ask me anything!`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input.trim()
    if (!messageText) return

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Generate AI response using vibe prompts API
      // For now, we'll use a simple response, but this can be connected to an actual AI chat API
      const response = await generateAIResponse(messageText)
      
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error('Error generating response:', error)
      toast.error('Failed to get AI response')
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = async (question: string): Promise<string> => {
    // This is a placeholder - you can integrate with an actual AI chat API
    // For now, we'll generate a context-aware prompt and return a helpful response
    try {
      // Try to generate a prompt based on the question category
      const questionLower = question.toLowerCase()
      
      if (questionLower.includes('design') || questionLower.includes('color') || questionLower.includes('font')) {
        return `Based on the project context, here's information about the design system:\n\n- **Color Palette**: The project uses a modern dark theme with primary colors (green/cyan accents) for interactive elements\n- **Typography**: Clean, modern sans-serif fonts optimized for readability\n- **Design Principles**: Consistent spacing, rounded corners, and subtle shadows for depth\n- **Component Library**: Built using shadcn/ui components with custom theming\n\nWould you like more specific details about any particular aspect of the design system?`
      } else if (questionLower.includes('security') || questionLower.includes('authentication') || questionLower.includes('auth')) {
        return `Security Configuration:\n\n- **Authentication**: Supabase Auth with email/password and OAuth support\n- **Password Reset**: Secure token-based password recovery flow\n- **Session Management**: JWT tokens with automatic refresh\n- **Authorization**: Role-based access control (project_owner, vibe_engineer)\n- **Data Protection**: All sensitive data encrypted at rest and in transit\n\nFor specific security implementation details, I can help you generate code examples.`
      } else if (questionLower.includes('test') || questionLower.includes('testing')) {
        return `Testing Strategy:\n\n- **Unit Tests**: Jest/Vitest for component and function testing\n- **Integration Tests**: Testing API endpoints and database interactions\n- **E2E Tests**: Playwright or Cypress for full user flows\n- **Test Coverage**: Aim for 80%+ coverage on critical paths\n- **CI/CD Integration**: Automated test runs on pull requests\n\nI can help you generate test cases for specific features or modules.`
      } else if (questionLower.includes('api') || questionLower.includes('endpoint') || questionLower.includes('documentation')) {
        return `API Documentation Format:\n\n- **RESTful Design**: Standard REST conventions with clear resource naming\n- **Request/Response**: JSON format with consistent error handling\n- **Authentication**: Bearer token in Authorization header\n- **Versioning**: API versioning strategy (e.g., /api/v1/...)\n- **Documentation**: OpenAPI/Swagger specifications\n- **Error Codes**: Standardized HTTP status codes with descriptive messages\n\nWould you like me to generate API endpoint examples for a specific module?`
      } else if (questionLower.includes('database') || questionLower.includes('encryption') || questionLower.includes('db')) {
        return `Database Configuration:\n\n- **Database**: PostgreSQL via Supabase\n- **Encryption**: Data encrypted at rest, TLS for connections\n- **Migrations**: Version-controlled schema migrations\n- **Backups**: Automated daily backups with point-in-time recovery\n- **Indexing**: Optimized indexes for query performance\n- **Relationships**: Foreign keys and constraints for data integrity\n\nI can help you design database schemas or write migration scripts.`
      } else if (questionLower.includes('devops') || questionLower.includes('ci/cd') || questionLower.includes('pipeline') || questionLower.includes('deploy')) {
        return `CI/CD Pipeline Setup:\n\n- **Version Control**: Git-based workflow with feature branches\n- **CI**: Automated testing on every commit\n- **Build**: Docker containerization for consistent environments\n- **Deployment**: Staging and production environments\n- **Monitoring**: Application performance and error tracking\n- **Rollback**: Quick rollback capability for failed deployments\n\nI can help you create CI/CD configuration files or deployment scripts.`
      } else {
        return `I understand you're asking about: "${question}"\n\nBased on the project context for ${projectName}${applicationType ? ` (${applicationType})` : ''}, I can help you with:\n\n- Understanding the project architecture\n- Generating code following project standards\n- Explaining specific features or modules\n- Providing implementation guidance\n\nCould you provide more details about what specifically you'd like help with?`
      }
    } catch (error) {
      return `I understand you're asking about: "${question}"\n\nI'm here to help with your ${projectName} project. Could you provide more details about what you need assistance with?`
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Welcome to ${projectName}! 👋\nI'm your AI assistant with full project context. I can help you with:\n- Understanding project architecture and standards\n- Generating code following design guidelines\n- API integration and database queries\n- Testing strategies and security best practices\n- Deployment and CI/CD workflows\n\nSelect a feature to get started, or ask me anything!`,
        timestamp: new Date()
      }
    ])
    toast.success('Chat cleared')
  }

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question)
  }

  // Calculate context info (mock data for now)
  const contextInfo = {
    features: 12, // This could be fetched from actual project data
    configured: true,
    categories: ['Security', 'Testing', 'DevOps']
  }

  return (
    <div className="w-full h-full flex flex-col border-2 border-primary/20 rounded-lg bg-card/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Project Assistant</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Context-aware AI assistant for {projectName}
              {applicationType && ` (${applicationType})`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1.5">
            <Circle className="h-2 w-2 fill-green-400" />
            Online
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
            </div>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 mb-4 pr-4 border-2 border-primary/20 rounded-lg bg-background/30 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 border-2 ${
                  message.role === 'assistant'
                    ? 'bg-card/50 border-green-500/30 shadow-lg shadow-green-500/10'
                    : 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center border border-primary/30">
                      <span className="text-xs font-bold text-primary-foreground">AI</span>
                          </div>
                    <span className="text-sm font-medium text-foreground">AI Assistant</span>
                  </div>
                )}
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {message.content}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card/50 border-2 border-green-500/30 rounded-lg p-4 shadow-lg shadow-green-500/10">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Type your question... (Press Enter to send)"
            className="flex-1 bg-background/50 border-2 border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
                                </Button>
                              </div>
        
        {/* Context Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Context:</span>
          <Badge variant="outline" className="text-xs border-primary/20">
            {contextInfo.features} features
          </Badge>
          {contextInfo.configured && (
            <Badge variant="outline" className="text-xs border-primary/20">
              Configured
            </Badge>
          )}
          {contextInfo.categories.map((cat, idx) => (
            <Badge key={idx} variant="outline" className="text-xs border-primary/20">
              {cat}
            </Badge>
                      ))}
                    </div>
      </div>

      {/* Quick Questions */}
      <div className="mt-6 pt-6 border-t-2 border-primary/20">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          One-click AI assistance by category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickQuestions.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.category}
                variant="outline"
                onClick={() => handleQuickQuestion(item.question)}
                disabled={isLoading}
                className="h-auto p-4 flex flex-col items-start gap-2 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {item.category}
                  </span>
                </div>
                <span className="text-sm text-left text-foreground">
                  {item.question}
                </span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
