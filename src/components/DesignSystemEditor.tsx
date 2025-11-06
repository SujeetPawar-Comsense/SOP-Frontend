import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { DesignGuidelines } from './DesignGuidelinesExcelUtils'
import { Palette, Type, Layout, Box, Zap, Code2, Eye, Monitor, Settings, GitBranch, Sparkles, FileText, Download, Wand2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import AnimationEffectsEditor from './AnimationEffectsEditor'
import { AnimationEffectsConfig } from './AnimationEffectsExcelUtils'

interface DesignSystemEditorProps {
  guidelines: DesignGuidelines
  onChange: (guidelines: DesignGuidelines) => void
  availableModules?: Array<{ id: string; moduleName: string }>
}

export default function DesignSystemEditor({ guidelines, onChange, availableModules = [] }: DesignSystemEditorProps) {
  const [activeTab, setActiveTab] = useState('branding')
  const [showPreview, setShowPreview] = useState(false)

  const generateSampleHTML = () => {
    // Safety check for optional properties
    const shadowStyle = guidelines.interaction?.shadowStyle || 'Medium depth'
    const isSoftShadow = shadowStyle.includes('Soft')
    const spacingScale = guidelines.layout?.spacingScale || '8px, 16px, 24px, 32px, 48px'
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design System Sample - ${guidelines.branding?.brandImageryStyle || 'Style Guide'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      /* Colors */
      --primary-color: ${guidelines.branding?.primaryColor || '#00ff88'};
      --secondary-color: ${guidelines.branding?.secondaryColor || '#00d4ff'};
      --accent-color: ${guidelines.branding?.accentColor || '#8b5cf6'};
      --success-color: ${guidelines.branding?.successColor || '#22c55e'};
      --warning-color: ${guidelines.branding?.warningColor || '#f59e0b'};
      --error-color: ${guidelines.branding?.errorColor || '#ef4444'};
      
      /* Typography */
      --font-primary: ${guidelines.typography?.primaryFont || 'Inter, sans-serif'};
      --font-secondary: ${guidelines.typography?.secondaryFont || 'Inter, sans-serif'};
      --h1-size: ${guidelines.typography?.h1Size || '2.5rem'};
      --h2-size: ${guidelines.typography?.h2Size || '2rem'};
      --h3-size: ${guidelines.typography?.h3Size || '1.5rem'};
      --body-size: ${guidelines.typography?.bodySize || '1rem'};
      --line-height: ${guidelines.typography?.lineHeight || '1.5'};
      --letter-spacing: ${guidelines.typography?.letterSpacing || 'normal'};
      
      /* Layout */
      --border-radius: ${guidelines.branding?.borderRadius || '8px'};
      --spacing-unit: ${spacingScale.split(',')[0] || '8px'};
      
      /* Components */
      --button-shape: ${guidelines.components?.buttonShape === 'Rounded' ? 'var(--border-radius)' : '4px'};
      --shadow-sm: ${isSoftShadow ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.2)'};
      --shadow-md: ${isSoftShadow ? '0 4px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.2)'};
      --shadow-lg: ${isSoftShadow ? '0 8px 16px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.25)'};
    }

    body {
      font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: var(--body-size);
      line-height: var(--line-height);
      letter-spacing: var(--letter-spacing);
      background: ${guidelines.branding.colorMode === 'Dark' ? '#0f1629' : '#f8f9fa'};
      color: ${guidelines.branding.colorMode === 'Dark' ? '#e2e8f0' : '#1a202c'};
      padding: 2rem;
    }

    .container {
      max-width: ${guidelines.layout.maxWidth || '1200px'};
      margin: 0 auto;
      padding: ${guidelines.branding.visualDensity === 'Compact' ? '1rem' : guidelines.branding.visualDensity === 'Spacious' ? '3rem' : '2rem'};
    }

    h1 {
      font-size: var(--h1-size);
      font-family: var(--font-secondary), sans-serif;
      margin-bottom: 1.5rem;
      color: var(--primary-color);
      font-weight: ${guidelines.typography.fontWeight};
    }

    h2 {
      font-size: var(--h2-size);
      font-family: var(--font-secondary), sans-serif;
      margin: 2rem 0 1rem;
      font-weight: ${guidelines.typography.fontWeight};
    }

    h3 {
      font-size: var(--h3-size);
      margin: 1.5rem 0 0.75rem;
      font-weight: ${guidelines.typography.fontWeight};
    }

    p {
      margin-bottom: 1rem;
    }

    /* Color Palette */
    .color-palette {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .color-swatch {
      text-align: center;
    }

    .color-box {
      width: 100%;
      height: 100px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-md);
      margin-bottom: 0.5rem;
      transition: transform ${guidelines.interaction?.hoverEffect === 'Lift' ? '0.2s ease' : '0.3s ease'};
    }

    .color-box:hover {
      transform: ${guidelines.interaction?.hoverEffect === 'Lift' ? 'translateY(-4px)' : 'scale(1.05)'};
      box-shadow: var(--shadow-lg);
    }

    .color-label {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .color-value {
      font-size: 0.75rem;
      opacity: 0.7;
      font-family: monospace;
    }

    /* Typography Samples */
    .typography-sample {
      margin: 2rem 0;
      padding: 2rem;
      background: ${guidelines.branding?.colorMode === 'Dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
      border-radius: var(--border-radius);
      border: 1px solid ${guidelines.branding?.colorMode === 'Dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    }

    /* Buttons */
    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 2rem 0;
    }

    .btn {
      padding: ${guidelines.branding?.visualDensity === 'Compact' ? '0.5rem 1rem' : guidelines.branding?.visualDensity === 'Spacious' ? '0.875rem 2rem' : '0.625rem 1.5rem'};
      border-radius: var(--button-shape);
      border: none;
      font-family: var(--font-primary);
      font-size: var(--body-size);
      font-weight: 500;
      cursor: pointer;
      transition: all ${guidelines.interaction?.transitionSpeed || '0.2s ease'};
      box-shadow: var(--shadow-sm);
    }

    .btn:hover {
      transform: ${guidelines.interaction?.hoverEffect === 'Lift' ? 'translateY(-2px)' : 'scale(1.02)'};
      box-shadow: var(--shadow-md);
    }

    .btn-primary {
      background: var(--primary-color);
      color: ${guidelines.branding?.colorMode === 'Dark' ? '#0a0f1c' : '#ffffff'};
    }

    .btn-secondary {
      background: var(--secondary-color);
      color: #ffffff;
    }

    .btn-outline {
      background: transparent;
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
    }

    .btn-success {
      background: var(--success-color);
      color: #ffffff;
    }

    .btn-warning {
      background: var(--warning-color);
      color: #ffffff;
    }

    .btn-error {
      background: var(--error-color);
      color: #ffffff;
    }

    /* Cards */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .card {
      background: ${guidelines.branding?.colorMode === 'Dark' ? 'rgba(255,255,255,0.05)' : '#ffffff'};
      border-radius: var(--border-radius);
      padding: ${guidelines.branding?.visualDensity === 'Compact' ? '1rem' : guidelines.branding?.visualDensity === 'Spacious' ? '2rem' : '1.5rem'};
      box-shadow: var(--shadow-md);
      border: 1px solid ${guidelines.branding?.colorMode === 'Dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      transition: all ${guidelines.interaction?.transitionSpeed || '0.2s ease'};
    }

    .card:hover {
      transform: ${guidelines.interaction?.hoverEffect === 'Lift' ? 'translateY(-4px)' : 'scale(1.02)'};
      box-shadow: var(--shadow-lg);
    }

    .card h3 {
      margin-top: 0;
      color: var(--primary-color);
    }

    /* Spacing Scale */
    .spacing-demo {
      margin: 2rem 0;
    }

    .spacing-box {
      background: var(--primary-color);
      height: 40px;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      padding-left: 1rem;
      color: ${guidelines.branding?.colorMode === 'Dark' ? '#0a0f1c' : '#ffffff'};
      font-weight: 600;
      border-radius: 4px;
    }

    /* Form Elements */
    .form-demo {
      max-width: 500px;
      margin: 2rem 0;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input[type="text"],
    input[type="email"],
    textarea {
      width: 100%;
      padding: 0.75rem;
      border-radius: var(--border-radius);
      border: 1px solid ${guidelines.branding?.colorMode === 'Dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
      background: ${guidelines.branding?.colorMode === 'Dark' ? 'rgba(255,255,255,0.05)' : '#ffffff'};
      color: ${guidelines.branding?.colorMode === 'Dark' ? '#e2e8f0' : '#1a202c'};
      font-family: var(--font-primary);
      font-size: var(--body-size);
      transition: all 0.2s ease;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px ${guidelines.branding?.primaryColor || '#00ff88'}33;
    }

    /* Badge/Tag */
    .badge-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin: 2rem 0;
    }

    .badge {
      padding: 0.375rem 0.875rem;
      border-radius: ${guidelines.components?.chipStyle === 'Outlined' ? '999px' : 'var(--border-radius)'};
      font-size: 0.875rem;
      font-weight: 500;
      ${guidelines.components?.chipStyle === 'Outlined' ? 'border: 1.5px solid;' : ''}
    }

    .badge-primary {
      background: ${guidelines.components?.chipStyle === 'Outlined' ? 'transparent' : guidelines.branding?.primaryColor || '#00ff88'};
      color: ${guidelines.components?.chipStyle === 'Outlined' ? guidelines.branding?.primaryColor || '#00ff88' : (guidelines.branding?.colorMode === 'Dark' ? '#0a0f1c' : '#ffffff')};
      border-color: ${guidelines.branding?.primaryColor || '#00ff88'};
    }

    .badge-secondary {
      background: ${guidelines.components?.chipStyle === 'Outlined' ? 'transparent' : guidelines.branding?.secondaryColor || '#00d4ff'};
      color: ${guidelines.components?.chipStyle === 'Outlined' ? guidelines.branding?.secondaryColor || '#00d4ff' : '#ffffff'};
      border-color: ${guidelines.branding?.secondaryColor || '#00d4ff'};
    }

    .badge-accent {
      background: ${guidelines.components?.chipStyle === 'Outlined' ? 'transparent' : guidelines.branding?.accentColor || '#8b5cf6'};
      color: ${guidelines.components?.chipStyle === 'Outlined' ? guidelines.branding?.accentColor || '#8b5cf6' : '#ffffff'};
      border-color: ${guidelines.branding?.accentColor || '#8b5cf6'};
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      h1 {
        font-size: calc(var(--h1-size) * 0.75);
      }
      
      .color-palette {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Design System Sample</h1>
    <p>This is a live preview of your design system settings. All colors, typography, spacing, and component styles are generated from your configuration.</p>

    <h2>Color Palette</h2>
    <div class="color-palette">
      <div class="color-swatch">
        <div class="color-box" style="background-color: ${guidelines.branding?.primaryColor || '#00ff88'}"></div>
        <div class="color-label">Primary</div>
        <div class="color-value">${guidelines.branding?.primaryColor || '#00ff88'}</div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background-color: ${guidelines.branding?.secondaryColor || '#00d4ff'}"></div>
        <div class="color-label">Secondary</div>
        <div class="color-value">${guidelines.branding?.secondaryColor || '#00d4ff'}</div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background-color: ${guidelines.branding?.accentColor || '#8b5cf6'}"></div>
        <div class="color-label">Accent</div>
        <div class="color-value">${guidelines.branding?.accentColor || '#8b5cf6'}</div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background-color: ${guidelines.branding?.successColor || '#22c55e'}"></div>
        <div class="color-label">Success</div>
        <div class="color-value">${guidelines.branding?.successColor || '#22c55e'}</div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background-color: ${guidelines.branding?.warningColor || '#f59e0b'}"></div>
        <div class="color-label">Warning</div>
        <div class="color-value">${guidelines.branding?.warningColor || '#f59e0b'}</div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background-color: ${guidelines.branding?.errorColor || '#ef4444'}"></div>
        <div class="color-label">Error</div>
        <div class="color-value">${guidelines.branding?.errorColor || '#ef4444'}</div>
      </div>
    </div>

    <h2>Typography</h2>
    <div class="typography-sample">
      <h1>Heading 1 - ${guidelines.typography?.h1Size || '2.5rem'}</h1>
      <h2>Heading 2 - ${guidelines.typography?.h2Size || '2rem'}</h2>
      <h3>Heading 3 - ${guidelines.typography?.h3Size || '1.5rem'}</h3>
      <p>Body text (${guidelines.typography?.bodySize || '1rem'}) - ${guidelines.typography?.primaryFont || 'Inter, sans-serif'}</p>
      <p style="font-family: var(--font-secondary)">Secondary font - ${guidelines.typography?.secondaryFont || 'Inter, sans-serif'}</p>
      <p><small>Small text - Used for captions and helper text</small></p>
    </div>

    <h2>Buttons (${guidelines.components?.buttonShape || 'Rounded'} shape)</h2>
    <div class="button-group">
      <button class="btn btn-primary">Primary Button</button>
      <button class="btn btn-secondary">Secondary Button</button>
      <button class="btn btn-outline">Outline Button</button>
      <button class="btn btn-success">Success</button>
      <button class="btn btn-warning">Warning</button>
      <button class="btn btn-error">Error</button>
    </div>

    <h2>Cards & Components</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Card Component</h3>
        <p>Border radius: ${guidelines.branding?.borderRadius || '8px'}</p>
        <p>Shadow style: ${guidelines.interaction?.shadowStyle || 'Medium depth'}</p>
        <p>Hover: ${guidelines.interaction?.hoverEffect || 'Lift'}</p>
      </div>
      <div class="card">
        <h3>Visual Density</h3>
        <p>Density: ${guidelines.branding?.visualDensity || 'Comfortable'}</p>
        <p>This affects padding and spacing throughout the design system.</p>
      </div>
      <div class="card">
        <h3>Interaction</h3>
        <p>Transition: ${guidelines.interaction?.transitionSpeed || '0.2s ease'}</p>
        <p>Loading style: ${guidelines.interaction?.loadingStyle || 'Spinner'}</p>
      </div>
    </div>

    <h2>Tags / Badges (${guidelines.components?.chipStyle || 'Filled'} style)</h2>
    <div class="badge-group">
      <span class="badge badge-primary">Primary</span>
      <span class="badge badge-secondary">Secondary</span>
      <span class="badge badge-accent">Accent</span>
      <span class="badge badge-primary">Featured</span>
      <span class="badge badge-secondary">New</span>
    </div>

    <h2>Form Elements</h2>
    <div class="form-demo">
      <div class="form-group">
        <label>Text Input</label>
        <input type="text" placeholder="Enter your name">
      </div>
      <div class="form-group">
        <label>Email Input</label>
        <input type="email" placeholder="you@example.com">
      </div>
      <div class="form-group">
        <label>Text Area</label>
        <textarea rows="3" placeholder="Your message here..."></textarea>
      </div>
      <button class="btn btn-primary">Submit Form</button>
    </div>

    <h2>Spacing Scale</h2>
    <div class="spacing-demo">
      <p>Spacing scale: ${spacingScale}</p>
      ${spacingScale.split(',').slice(0, 5).map((space, i) => 
        `<div class="spacing-box" style="width: ${space.trim()}">${space.trim()}</div>`
      ).join('\n      ')}
    </div>

    <h2>Technical Details</h2>
    <div class="card">
      <h3>Framework & Tools</h3>
      <p><strong>CSS Framework:</strong> ${guidelines.technical?.cssFramework || 'Tailwind CSS'}</p>
      <p><strong>Component Library:</strong> ${guidelines.technical?.componentLibrary || 'Shadcn/ui'}</p>
      <p><strong>Icon Library:</strong> ${guidelines.technical?.iconLibrary || 'Lucide'}</p>
      <p><strong>Dark Mode:</strong> ${guidelines.technical?.darkModeSupport || 'Auto'}</p>
      <p><strong>Accessibility:</strong> ${guidelines.accessibility?.contrastRatio || 'WCAG AAA'}, Keyboard Nav: ${guidelines.accessibility?.keyboardNav ? 'Yes' : 'No'}</p>
    </div>
  </div>
</body>
</html>`

    return html
  }

  const handleViewSample = () => {
    setShowPreview(true)
  }

  const handleDownloadSample = () => {
    const html = generateSampleHTML()
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'design-system-sample.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Design system sample downloaded')
  }

  const updateBranding = (field: keyof typeof guidelines.branding, value: any) => {
    onChange({
      ...guidelines,
      branding: { ...guidelines.branding, [field]: value }
    })
  }

  const updateTypography = (field: keyof typeof guidelines.typography, value: any) => {
    onChange({
      ...guidelines,
      typography: { ...guidelines.typography, [field]: value }
    })
  }

  const updateLayout = (field: keyof typeof guidelines.layout, value: any) => {
    onChange({
      ...guidelines,
      layout: { ...guidelines.layout, [field]: value }
    })
  }

  const updateComponents = (field: keyof typeof guidelines.components, value: any) => {
    onChange({
      ...guidelines,
      components: { ...guidelines.components, [field]: value }
    })
  }

  const updateInteraction = (field: keyof typeof guidelines.interaction, value: any) => {
    onChange({
      ...guidelines,
      interaction: { ...guidelines.interaction, [field]: value }
    })
  }

  const updateTokens = (field: keyof typeof guidelines.tokens, value: any) => {
    onChange({
      ...guidelines,
      tokens: { ...guidelines.tokens, [field]: value }
    })
  }

  const updateAccessibility = (field: keyof typeof guidelines.accessibility, value: any) => {
    onChange({
      ...guidelines,
      accessibility: { ...guidelines.accessibility, [field]: value }
    })
  }

  const updateResponsive = (field: keyof typeof guidelines.responsive, value: any) => {
    onChange({
      ...guidelines,
      responsive: { ...guidelines.responsive, [field]: value }
    })
  }

  const updateTechnical = (field: keyof typeof guidelines.technical, value: any) => {
    onChange({
      ...guidelines,
      technical: { ...guidelines.technical, [field]: value }
    })
  }

  const updateWorkflow = (field: keyof typeof guidelines.workflow, value: any) => {
    onChange({
      ...guidelines,
      workflow: { ...guidelines.workflow, [field]: value }
    })
  }

  const updateAI = (field: keyof typeof guidelines.ai, value: any) => {
    onChange({
      ...guidelines,
      ai: { ...guidelines.ai, [field]: value }
    })
  }

  const updateDocumentation = (field: keyof typeof guidelines.documentation, value: any) => {
    onChange({
      ...guidelines,
      documentation: { ...guidelines.documentation, [field]: value }
    })
  }

  const updateAnimationEffects = (animationEffects: AnimationEffectsConfig) => {
    onChange({
      ...guidelines,
      animationEffects
    })
  }

  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6 gap-2 h-auto p-2 bg-card/50 border border-primary/20">
        <TabsTrigger value="branding" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Branding</span>
        </TabsTrigger>
        <TabsTrigger value="typography" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Type className="w-4 h-4" />
          <span className="hidden sm:inline">Typography</span>
        </TabsTrigger>
        <TabsTrigger value="layout" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Layout className="w-4 h-4" />
          <span className="hidden sm:inline">Layout</span>
        </TabsTrigger>
        <TabsTrigger value="components" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Box className="w-4 h-4" />
          <span className="hidden sm:inline">Components</span>
        </TabsTrigger>
        <TabsTrigger value="interaction" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Interaction</span>
        </TabsTrigger>
        <TabsTrigger value="technical" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Code2 className="w-4 h-4" />
          <span className="hidden sm:inline">Technical</span>
        </TabsTrigger>
      </TabsList>

      {/* Second row of tabs */}
      <TabsList className="grid w-full grid-cols-6 gap-2 h-auto p-2 mt-2 bg-card/50 border border-primary/20">
        <TabsTrigger value="tokens" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Tokens</span>
        </TabsTrigger>
        <TabsTrigger value="accessibility" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">A11y</span>
        </TabsTrigger>
        <TabsTrigger value="responsive" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Monitor className="w-4 h-4" />
          <span className="hidden sm:inline">Responsive</span>
        </TabsTrigger>
        <TabsTrigger value="workflow" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <GitBranch className="w-4 h-4" />
          <span className="hidden sm:inline">Workflow</span>
        </TabsTrigger>
        <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI Config</span>
        </TabsTrigger>
        <TabsTrigger value="documentation" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Docs</span>
        </TabsTrigger>
      </TabsList>

      {/* Branding Tab */}
      <TabsContent value="branding" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Branding & Visual Identity</CardTitle>
                <CardDescription>Logo, brand colors, and visual styling</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleViewSample}
                  size="sm"
                  variant="outline"
                  className="gap-2 border-primary/50 hover:bg-primary/10"
                >
                  <Eye className="w-4 h-4" />
                  View Sample
                </Button>
                <Button
                  onClick={handleDownloadSample}
                  size="sm"
                  variant="outline"
                  className="gap-2 border-primary/50 hover:bg-primary/10"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo URL / Path</Label>
              <Input
                value={guidelines.branding.logo}
                onChange={(e) => updateBranding('logo', e.target.value)}
                placeholder="https://... or /path/to/logo.svg"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Color Mode</Label>
              <Select value={guidelines.branding.colorMode} onValueChange={(v: any) => updateBranding('colorMode', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="Dark">Dark</SelectItem>
                  <SelectItem value="Both">Both (Light & Dark)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={guidelines.branding.primaryColor}
                  onChange={(e) => updateBranding('primaryColor', e.target.value)}
                  className="w-16 h-10 p-1 bg-input-background border-primary/30"
                />
                <Input
                  value={guidelines.branding.primaryColor}
                  onChange={(e) => updateBranding('primaryColor', e.target.value)}
                  className="flex-1 bg-input-background border-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={guidelines.branding.secondaryColor}
                  onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                  className="w-16 h-10 p-1 bg-input-background border-primary/30"
                />
                <Input
                  value={guidelines.branding.secondaryColor}
                  onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                  className="flex-1 bg-input-background border-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={guidelines.branding.accentColor}
                  onChange={(e) => updateBranding('accentColor', e.target.value)}
                  className="w-16 h-10 p-1 bg-input-background border-primary/30"
                />
                <Input
                  value={guidelines.branding.accentColor}
                  onChange={(e) => updateBranding('accentColor', e.target.value)}
                  className="flex-1 bg-input-background border-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Success Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={guidelines.branding.successColor}
                  onChange={(e) => updateBranding('successColor', e.target.value)}
                  className="w-16 h-10 p-1 bg-input-background border-primary/30"
                />
                <Input
                  value={guidelines.branding.successColor}
                  onChange={(e) => updateBranding('successColor', e.target.value)}
                  className="flex-1 bg-input-background border-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Warning Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={guidelines.branding.warningColor}
                  onChange={(e) => updateBranding('warningColor', e.target.value)}
                  className="w-16 h-10 p-1 bg-input-background border-primary/30"
                />
                <Input
                  value={guidelines.branding.warningColor}
                  onChange={(e) => updateBranding('warningColor', e.target.value)}
                  className="flex-1 bg-input-background border-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Error Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={guidelines.branding.errorColor}
                  onChange={(e) => updateBranding('errorColor', e.target.value)}
                  className="w-16 h-10 p-1 bg-input-background border-primary/30"
                />
                <Input
                  value={guidelines.branding.errorColor}
                  onChange={(e) => updateBranding('errorColor', e.target.value)}
                  className="flex-1 bg-input-background border-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visual Density</Label>
              <Select value={guidelines.branding.visualDensity} onValueChange={(v: any) => updateBranding('visualDensity', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Compact">Compact</SelectItem>
                  <SelectItem value="Comfortable">Comfortable</SelectItem>
                  <SelectItem value="Spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Border Radius</Label>
              <Input
                value={guidelines.branding.borderRadius}
                onChange={(e) => updateBranding('borderRadius', e.target.value)}
                placeholder="e.g., 8px, 0.5rem"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Gradient Style</Label>
              <Input
                value={guidelines.branding.gradientStyle}
                onChange={(e) => updateBranding('gradientStyle', e.target.value)}
                placeholder="e.g., Linear gradients with subtle transitions"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Brand Imagery Style</Label>
              <Input
                value={guidelines.branding.brandImageryStyle}
                onChange={(e) => updateBranding('brandImageryStyle', e.target.value)}
                placeholder="e.g., Modern, minimal, photo-based"
                className="bg-input-background border-primary/30"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Typography Tab */}
      <TabsContent value="typography" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Font families, sizes, and styling</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Font (Headings)</Label>
              <Input
                value={guidelines.typography.primaryFont}
                onChange={(e) => updateTypography('primaryFont', e.target.value)}
                placeholder="e.g., Inter, Roboto"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Secondary Font (Body)</Label>
              <Input
                value={guidelines.typography.secondaryFont}
                onChange={(e) => updateTypography('secondaryFont', e.target.value)}
                placeholder="e.g., Space Grotesk"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Monospace Font (Code)</Label>
              <Input
                value={guidelines.typography.monospaceFont}
                onChange={(e) => updateTypography('monospaceFont', e.target.value)}
                placeholder="e.g., JetBrains Mono"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Font Source</Label>
              <Input
                value={guidelines.typography.fontSource}
                onChange={(e) => updateTypography('fontSource', e.target.value)}
                placeholder="Google Fonts, Adobe Fonts, Custom"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>H1 Size</Label>
              <Input
                value={guidelines.typography.h1Size}
                onChange={(e) => updateTypography('h1Size', e.target.value)}
                placeholder="e.g., 2.5rem"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>H2 Size</Label>
              <Input
                value={guidelines.typography.h2Size}
                onChange={(e) => updateTypography('h2Size', e.target.value)}
                placeholder="e.g., 2rem"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>H3 Size</Label>
              <Input
                value={guidelines.typography.h3Size}
                onChange={(e) => updateTypography('h3Size', e.target.value)}
                placeholder="e.g., 1.5rem"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Body Size</Label>
              <Input
                value={guidelines.typography.bodySize}
                onChange={(e) => updateTypography('bodySize', e.target.value)}
                placeholder="e.g., 1rem"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Line Height</Label>
              <Input
                value={guidelines.typography.lineHeight}
                onChange={(e) => updateTypography('lineHeight', e.target.value)}
                placeholder="e.g., 1.5"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Letter Spacing</Label>
              <Input
                value={guidelines.typography.letterSpacing}
                onChange={(e) => updateTypography('letterSpacing', e.target.value)}
                placeholder="e.g., Normal, 0.05em"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Font Pairing Rules</Label>
              <Input
                value={guidelines.typography.fontPairing}
                onChange={(e) => updateTypography('fontPairing', e.target.value)}
                placeholder="e.g., Heading: Space Grotesk, Body: Inter"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Responsive Typography Scale
                <Switch
                  checked={guidelines.typography.responsiveScale}
                  onCheckedChange={(checked) => updateTypography('responsiveScale', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Accessibility Mode</Label>
              <Input
                value={guidelines.typography.accessibilityMode}
                onChange={(e) => updateTypography('accessibilityMode', e.target.value)}
                placeholder="Standard, Dyslexia-friendly, Large text"
                className="bg-input-background border-primary/30"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Layout Tab */}
      <TabsContent value="layout" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Layout & Structure</CardTitle>
            <CardDescription>Grid system, spacing, and responsive layout</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grid System</Label>
              <Select value={guidelines.layout.gridSystem} onValueChange={(v: any) => updateLayout('gridSystem', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8px">8px Grid</SelectItem>
                  <SelectItem value="10px">10px Grid</SelectItem>
                  <SelectItem value="12px">12px Grid</SelectItem>
                  <SelectItem value="16px">16px Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Column Layout</Label>
              <Select value={guidelines.layout.columnLayout} onValueChange={(v: any) => updateLayout('columnLayout', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12-column">12-column</SelectItem>
                  <SelectItem value="16-column">16-column</SelectItem>
                  <SelectItem value="Fluid">Fluid Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Container Width</Label>
              <Input
                value={guidelines.layout.containerWidth}
                onChange={(e) => updateLayout('containerWidth', e.target.value)}
                placeholder="e.g., 1280px max"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Spacing Scale</Label>
              <Input
                value={guidelines.layout.spacingScale}
                onChange={(e) => updateLayout('spacingScale', e.target.value)}
                placeholder="e.g., 4, 8, 12, 16, 24, 32"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select value={guidelines.layout.alignment} onValueChange={(v: any) => updateLayout('alignment', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Left">Left Aligned</SelectItem>
                  <SelectItem value="Center">Centered</SelectItem>
                  <SelectItem value="Justified">Justified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page Margins</Label>
              <Input
                value={guidelines.layout.pageMargins}
                onChange={(e) => updateLayout('pageMargins', e.target.value)}
                placeholder="e.g., 24px"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Breakpoints</Label>
              <Input
                value={guidelines.layout.breakpoints}
                onChange={(e) => updateLayout('breakpoints', e.target.value)}
                placeholder="XS: 320px, SM: 640px, MD: 768px, LG: 1024px, XL: 1280px"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Layout Pattern</Label>
              <Input
                value={guidelines.layout.layoutPattern}
                onChange={(e) => updateLayout('layoutPattern', e.target.value)}
                placeholder="Sidebar, Top-nav, Card-based"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>White Space Strategy</Label>
              <Select value={guidelines.layout.whiteSpaceStrategy} onValueChange={(v: any) => updateLayout('whiteSpaceStrategy', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minimal">Minimal</SelectItem>
                  <SelectItem value="Balanced">Balanced</SelectItem>
                  <SelectItem value="Generous">Generous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Section Padding</Label>
              <Input
                value={guidelines.layout.sectionPadding}
                onChange={(e) => updateLayout('sectionPadding', e.target.value)}
                placeholder="e.g., 48px vertical, 24px horizontal"
                className="bg-input-background border-primary/30"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Components Tab */}
      <TabsContent value="components" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Components & UI Elements</CardTitle>
            <CardDescription>Button styles, inputs, cards, and other UI components</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Button Variants</Label>
              <Input
                value={guidelines.components.buttonVariants}
                onChange={(e) => updateComponents('buttonVariants', e.target.value)}
                placeholder="Primary, Secondary, Ghost, Link"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Button Shape</Label>
              <Select value={guidelines.components.buttonShape} onValueChange={(v: any) => updateComponents('buttonShape', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rounded">Rounded</SelectItem>
                  <SelectItem value="Pill">Pill</SelectItem>
                  <SelectItem value="Square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Input Style</Label>
              <Input
                value={guidelines.components.inputStyle}
                onChange={(e) => updateComponents('inputStyle', e.target.value)}
                placeholder="Outlined, Filled, Underlined"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Card Elevation</Label>
              <Input
                value={guidelines.components.cardElevation}
                onChange={(e) => updateComponents('cardElevation', e.target.value)}
                placeholder="Level 2 shadow, subtle elevation"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Tab Style</Label>
              <Select value={guidelines.components.tabStyle} onValueChange={(v: any) => updateComponents('tabStyle', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Underline">Underline</SelectItem>
                  <SelectItem value="Filled">Filled</SelectItem>
                  <SelectItem value="Segmented">Segmented Controls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Navigation Style</Label>
              <Select value={guidelines.components.navigationStyle} onValueChange={(v: any) => updateComponents('navigationStyle', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Top">Top Navigation</SelectItem>
                  <SelectItem value="Side">Side Navigation</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modal Animation</Label>
              <Select value={guidelines.components.modalAnimation} onValueChange={(v: any) => updateComponents('modalAnimation', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fade">Fade</SelectItem>
                  <SelectItem value="Scale">Scale</SelectItem>
                  <SelectItem value="Slide">Slide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tooltip Delay</Label>
              <Input
                value={guidelines.components.tooltipDelay}
                onChange={(e) => updateComponents('tooltipDelay', e.target.value)}
                placeholder="e.g., 300ms"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Table Style</Label>
              <Input
                value={guidelines.components.tableStyle}
                onChange={(e) => updateComponents('tableStyle', e.target.value)}
                placeholder="Bordered, Striped, Hover effects"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Avatar Shape</Label>
              <Select value={guidelines.components.avatarShape} onValueChange={(v: any) => updateComponents('avatarShape', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Circle">Circle</SelectItem>
                  <SelectItem value="Square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chip/Tag Style</Label>
              <Select value={guidelines.components.chipStyle} onValueChange={(v: any) => updateComponents('chipStyle', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Outlined">Outlined</SelectItem>
                  <SelectItem value="Filled">Filled</SelectItem>
                  <SelectItem value="Gradient">Gradient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Toast Position</Label>
              <Input
                value={guidelines.components.toastPosition}
                onChange={(e) => updateComponents('toastPosition', e.target.value)}
                placeholder="Top-right, Bottom-left, etc."
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Skeleton Animation</Label>
              <Select value={guidelines.components.skeletonAnimation} onValueChange={(v: any) => updateComponents('skeletonAnimation', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pulse">Pulse</SelectItem>
                  <SelectItem value="Wave">Wave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Interaction Tab */}
      <TabsContent value="interaction" className="space-y-4 mt-4">
        <div className="space-y-4">
          

          <AnimationEffectsEditor
            config={guidelines.animationEffects}
            onChange={updateAnimationEffects}
            availableModules={availableModules}
          />
        </div>
      </TabsContent>

      {/* Tokens Tab */}
      <TabsContent value="tokens" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Design System & Tokens</CardTitle>
            <CardDescription>Design tokens, theming, and component library configuration</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Token Format</Label>
              <Select value={guidelines.tokens.tokenFormat} onValueChange={(v: any) => updateTokens('tokenFormat', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="YAML">YAML</SelectItem>
                  <SelectItem value="CSS Variables">CSS Variables</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Component Variants</Label>
              <Input
                value={guidelines.tokens.componentVariants}
                onChange={(e) => updateTokens('componentVariants', e.target.value)}
                placeholder="Small, Medium, Large, Disabled"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Theming Architecture</Label>
              <Select value={guidelines.tokens.themingArchitecture} onValueChange={(v: any) => updateTokens('themingArchitecture', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single Theme</SelectItem>
                  <SelectItem value="Multi-theme">Multi-theme Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Naming Convention</Label>
              <Select value={guidelines.tokens.namingConvention} onValueChange={(v: any) => updateTokens('namingConvention', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PascalCase">PascalCase</SelectItem>
                  <SelectItem value="kebab-case">kebab-case</SelectItem>
                  <SelectItem value="BEM">BEM</SelectItem>
                  <SelectItem value="Atomic">Atomic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>UI Kit Selection</Label>
              <Input
                value={guidelines.tokens.uiKit}
                onChange={(e) => updateTokens('uiKit', e.target.value)}
                placeholder="Tailwind, Chakra, Material, Ant Design, Custom"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Figma Component Library URL</Label>
              <Input
                value={guidelines.tokens.figmaLibrary}
                onChange={(e) => updateTokens('figmaLibrary', e.target.value)}
                placeholder="https://figma.com/..."
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Storybook Integration
                <Switch
                  checked={guidelines.tokens.storybookIntegration}
                  onCheckedChange={(checked) => updateTokens('storybookIntegration', checked)}
                />
              </Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Accessibility Tab */}
      <TabsContent value="accessibility" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Accessibility & Inclusivity</CardTitle>
            <CardDescription>WCAG compliance, keyboard navigation, and inclusive design</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contrast Ratio Target</Label>
              <Select value={guidelines.accessibility.contrastRatio} onValueChange={(v: any) => updateAccessibility('contrastRatio', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WCAG AA">WCAG AA (4.5:1)</SelectItem>
                  <SelectItem value="WCAG AAA">WCAG AAA (7:1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language Direction</Label>
              <Select value={guidelines.accessibility.languageDirection} onValueChange={(v: any) => updateAccessibility('languageDirection', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LTR">Left to Right</SelectItem>
                  <SelectItem value="RTL">Right to Left</SelectItem>
                  <SelectItem value="Both">Both Supported</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Keyboard Navigation
                <Switch
                  checked={guidelines.accessibility.keyboardNav}
                  onCheckedChange={(checked) => updateAccessibility('keyboardNav', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                ARIA Attributes
                <Switch
                  checked={guidelines.accessibility.ariaAttributes}
                  onCheckedChange={(checked) => updateAccessibility('ariaAttributes', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Screen Reader Text
                <Switch
                  checked={guidelines.accessibility.screenReaderText}
                  onCheckedChange={(checked) => updateAccessibility('screenReaderText', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Motion Reduction
                <Switch
                  checked={guidelines.accessibility.motionReduction}
                  onCheckedChange={(checked) => updateAccessibility('motionReduction', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Color Blind Mode</Label>
              <Input
                value={guidelines.accessibility.colorBlindMode}
                onChange={(e) => updateAccessibility('colorBlindMode', e.target.value)}
                placeholder="None, Deuteranopia, Protanopia"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                High Contrast Mode
                <Switch
                  checked={guidelines.accessibility.highContrast}
                  onCheckedChange={(checked) => updateAccessibility('highContrast', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Font Scaling (200% Zoom)
                <Switch
                  checked={guidelines.accessibility.fontScaling}
                  onCheckedChange={(checked) => updateAccessibility('fontScaling', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Clear Error Messages
                <Switch
                  checked={guidelines.accessibility.errorMessageClarity}
                  onCheckedChange={(checked) => updateAccessibility('errorMessageClarity', checked)}
                />
              </Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Responsive Tab */}
      <TabsContent value="responsive" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Responsive & Adaptive Design</CardTitle>
            <CardDescription>Breakpoints, mobile-first design, and device adaptation</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Breakpoint XS</Label>
              <Input
                value={guidelines.responsive.breakpointXS}
                onChange={(e) => updateResponsive('breakpointXS', e.target.value)}
                placeholder="320px"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Breakpoint SM</Label>
              <Input
                value={guidelines.responsive.breakpointSM}
                onChange={(e) => updateResponsive('breakpointSM', e.target.value)}
                placeholder="640px"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Breakpoint MD</Label>
              <Input
                value={guidelines.responsive.breakpointMD}
                onChange={(e) => updateResponsive('breakpointMD', e.target.value)}
                placeholder="768px"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Breakpoint LG</Label>
              <Input
                value={guidelines.responsive.breakpointLG}
                onChange={(e) => updateResponsive('breakpointLG', e.target.value)}
                placeholder="1024px"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Breakpoint XL</Label>
              <Input
                value={guidelines.responsive.breakpointXL}
                onChange={(e) => updateResponsive('breakpointXL', e.target.value)}
                placeholder="1280px"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Adaptive Layout Rules</Label>
              <Input
                value={guidelines.responsive.adaptiveLayout}
                onChange={(e) => updateResponsive('adaptiveLayout', e.target.value)}
                placeholder="Stack to grid, horizontal to vertical"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum Touch Target</Label>
              <Input
                value={guidelines.responsive.minTouchTarget}
                onChange={(e) => updateResponsive('minTouchTarget', e.target.value)}
                placeholder="44x44px"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Responsive Typography
                <Switch
                  checked={guidelines.responsive.responsiveTypography}
                  onCheckedChange={(checked) => updateResponsive('responsiveTypography', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Image Scaling</Label>
              <Input
                value={guidelines.responsive.imageScaling}
                onChange={(e) => updateResponsive('imageScaling', e.target.value)}
                placeholder="WebP with lazy load"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Grid Reflow Behavior</Label>
              <Input
                value={guidelines.responsive.gridReflow}
                onChange={(e) => updateResponsive('gridReflow', e.target.value)}
                placeholder="Horizontal to vertical collapse"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Device Preview Mode
                <Switch
                  checked={guidelines.responsive.devicePreview}
                  onCheckedChange={(checked) => updateResponsive('devicePreview', checked)}
                />
              </Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Technical Tab */}
      <TabsContent value="technical" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Technical UI Settings</CardTitle>
            <CardDescription>Framework selection, code generation, and export formats</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CSS Framework</Label>
              <Input
                value={guidelines.technical.cssFramework}
                onChange={(e) => updateTechnical('cssFramework', e.target.value)}
                placeholder="Tailwind, Bootstrap, Bulma"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Component Library</Label>
              <Input
                value={guidelines.technical.componentLibrary}
                onChange={(e) => updateTechnical('componentLibrary', e.target.value)}
                placeholder="Shadcn/ui, MUI, Chakra, AntD"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Icon Library</Label>
              <Input
                value={guidelines.technical.iconLibrary}
                onChange={(e) => updateTechnical('iconLibrary', e.target.value)}
                placeholder="Lucide, Feather, FontAwesome"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Token Export Format</Label>
              <Select value={guidelines.technical.tokenExportFormat} onValueChange={(v: any) => updateTechnical('tokenExportFormat', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="SCSS">SCSS</SelectItem>
                  <SelectItem value="CSS Vars">CSS Variables</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dark Mode Support</Label>
              <Select value={guidelines.technical.darkModeSupport} onValueChange={(v: any) => updateTechnical('darkModeSupport', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto (System-based)</SelectItem>
                  <SelectItem value="Manual">Manual Toggle</SelectItem>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lint Rules</Label>
              <Input
                value={guidelines.technical.lintRules}
                onChange={(e) => updateTechnical('lintRules', e.target.value)}
                placeholder="ESLint + Prettier, Stylelint"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Code Generation Style</Label>
              <Select value={guidelines.technical.codeGenStyle} onValueChange={(v: any) => updateTechnical('codeGenStyle', v)}>
                <SelectTrigger className="bg-input-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Atomic">Atomic CSS</SelectItem>
                  <SelectItem value="Utility-first">Utility-first</SelectItem>
                  <SelectItem value="BEM">BEM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Workflow Tab */}
      <TabsContent value="workflow" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Workflow, Prototyping & Collaboration</CardTitle>
            <CardDescription>Design handoff, versioning, and team collaboration</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Figma Project Link</Label>
              <Input
                value={guidelines.workflow.figmaProjectLink}
                onChange={(e) => updateWorkflow('figmaProjectLink', e.target.value)}
                placeholder="https://figma.com/..."
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Versioning Enabled
                <Switch
                  checked={guidelines.workflow.versioningEnabled}
                  onCheckedChange={(checked) => updateWorkflow('versioningEnabled', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Approval Workflow
                <Switch
                  checked={guidelines.workflow.approvalWorkflow}
                  onCheckedChange={(checked) => updateWorkflow('approvalWorkflow', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Design-to-Dev Handoff</Label>
              <Input
                value={guidelines.workflow.designToDevHandoff}
                onChange={(e) => updateWorkflow('designToDevHandoff', e.target.value)}
                placeholder="Figma to Code, Zeplin, InVision"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>Prototype Behavior</Label>
              <Input
                value={guidelines.workflow.prototypeBehavior}
                onChange={(e) => updateWorkflow('prototypeBehavior', e.target.value)}
                placeholder="Click-through, transitions"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Feedback & Annotations
                <Switch
                  checked={guidelines.workflow.feedbackEnabled}
                  onCheckedChange={(checked) => updateWorkflow('feedbackEnabled', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Accessibility Checklist
                <Switch
                  checked={guidelines.workflow.accessibilityChecklist}
                  onCheckedChange={(checked) => updateWorkflow('accessibilityChecklist', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Design QA Checklist
                <Switch
                  checked={guidelines.workflow.designQAChecklist}
                  onCheckedChange={(checked) => updateWorkflow('designQAChecklist', checked)}
                />
              </Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* AI Config Tab */}
      <TabsContent value="ai" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>AI-Specific Configurations</CardTitle>
            <CardDescription>AI prompts and automated design assistance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>AI Design Style Prompt</Label>
              <Textarea
                value={guidelines.ai.designStylePrompt}
                onChange={(e) => updateAI('designStylePrompt', e.target.value)}
                placeholder="Clean, modern SaaS dashboard with futuristic neon accents"
                className="bg-input-background border-primary/30 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>AI Layout Prompt</Label>
              <Textarea
                value={guidelines.ai.layoutPrompt}
                onChange={(e) => updateAI('layoutPrompt', e.target.value)}
                placeholder="Use 12-column responsive grid with 24px gaps"
                className="bg-input-background border-primary/30 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>AI Color Prompt</Label>
              <Textarea
                value={guidelines.ai.colorPrompt}
                onChange={(e) => updateAI('colorPrompt', e.target.value)}
                placeholder="Primary neon green (#00ff88) for trust, dark background for depth"
                className="bg-input-background border-primary/30 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>AI Component Prompt</Label>
              <Textarea
                value={guidelines.ai.componentPrompt}
                onChange={(e) => updateAI('componentPrompt', e.target.value)}
                placeholder="Accessible buttons with clear hover states and neon glow effects"
                className="bg-input-background border-primary/30 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  AI Theme Generator
                  <Switch
                    checked={guidelines.ai.themeGenerator}
                    onCheckedChange={(checked) => updateAI('themeGenerator', checked)}
                  />
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Wireframe Mode
                  <Switch
                    checked={guidelines.ai.wireframeMode}
                    onCheckedChange={(checked) => updateAI('wireframeMode', checked)}
                  />
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Usability Recommendations
                  <Switch
                    checked={guidelines.ai.usabilityRecommendations}
                    onCheckedChange={(checked) => updateAI('usabilityRecommendations', checked)}
                  />
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Consistency Checker
                  <Switch
                    checked={guidelines.ai.consistencyChecker}
                    onCheckedChange={(checked) => updateAI('consistencyChecker', checked)}
                  />
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Documentation Tab */}
      <TabsContent value="documentation" className="space-y-4 mt-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Documentation & Governance</CardTitle>
            <CardDescription>Design system documentation and governance rules</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Design System Docs</Label>
              <Input
                value={guidelines.documentation.designSystemDocs}
                onChange={(e) => updateDocumentation('designSystemDocs', e.target.value)}
                placeholder="Auto-generated, Storybook, Custom"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Change Logs Enabled
                <Switch
                  checked={guidelines.documentation.changeLogsEnabled}
                  onCheckedChange={(checked) => updateDocumentation('changeLogsEnabled', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Governance Rules</Label>
              <Input
                value={guidelines.documentation.governanceRules}
                onChange={(e) => updateDocumentation('governanceRules', e.target.value)}
                placeholder="Require review before merge"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Brand Guidelines Export
                <Switch
                  checked={guidelines.documentation.brandGuidelinesExport}
                  onCheckedChange={(checked) => updateDocumentation('brandGuidelinesExport', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Token Sync Enabled
                <Switch
                  checked={guidelines.documentation.tokenSyncEnabled}
                  onCheckedChange={(checked) => updateDocumentation('tokenSyncEnabled', checked)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Label>UI Testing Templates</Label>
              <Input
                value={guidelines.documentation.uiTestingTemplates}
                onChange={(e) => updateDocumentation('uiTestingTemplates', e.target.value)}
                placeholder="Cypress, Playwright templates"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label>UX Research Integration</Label>
              <Input
                value={guidelines.documentation.uxResearchIntegration}
                onChange={(e) => updateDocumentation('uxResearchIntegration', e.target.value)}
                placeholder="Upload usability test insights"
                className="bg-input-background border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Pattern Usage Analytics
                <Switch
                  checked={guidelines.documentation.patternUsageAnalytics}
                  onCheckedChange={(checked) => updateDocumentation('patternUsageAnalytics', checked)}
                />
              </Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    {/* Preview Dialog */}
    {showPreview && (
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col border-primary/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Design System Sample Preview
            </DialogTitle>
            <DialogDescription>
              Live preview of your design system. Download the HTML file to view it in a separate browser tab.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden border border-primary/20 rounded-lg">
            <iframe
              srcDoc={generateSampleHTML()}
              className="w-full h-full"
              style={{ minHeight: '500px' }}
              title="Design System Preview"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
              className="border-primary/30"
            >
              Close
            </Button>
            <Button
              onClick={handleDownloadSample}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}
