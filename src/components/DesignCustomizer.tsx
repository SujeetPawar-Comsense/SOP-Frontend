import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Palette, Zap, ArrowRightLeft, ImageIcon } from 'lucide-react'

export interface DesignSettings {
  theme: {
    type: string
    primaryColor?: string
    secondaryColor?: string
    typography?: string
    backgroundStyle?: string
  }
  animations: {
    type: string
    interactionType?: string
    speed?: string
    easing?: string
  }
  transitions: {
    type: string
    direction?: string
    duration?: string
    easingCurve?: string
  }
  logo: {
    type: string
    appPurpose?: string
    colors?: string
    style?: string
  }
}

interface DesignCustomizerProps {
  designSettings: DesignSettings
  onChange: (settings: DesignSettings) => void
}

export default function DesignCustomizer({ designSettings, onChange }: DesignCustomizerProps) {
  const updateDesignSetting = (
    category: keyof DesignSettings,
    field: string,
    value: string
  ) => {
    onChange({
      ...designSettings,
      [category]: {
        ...designSettings[category],
        [field]: value
      }
    })
  }

  const themeOptions = [
    { value: 'minimalist', label: 'Minimalist', description: 'Clean, simple, lots of white space' },
    { value: 'corporate', label: 'Corporate', description: 'Professional, structured, business-focused' },
    { value: 'playful', label: 'Playful', description: 'Vibrant colors, rounded corners, fun elements' },
    { value: 'futuristic', label: 'Futuristic', description: 'Dark themes, neon accents, modern tech feel' },
    { value: 'custom', label: 'Custom', description: 'Define your own theme parameters' }
  ]

  const animationOptions = [
    { value: 'subtle', label: 'Subtle micro-interactions', description: 'Gentle hover effects and state changes' },
    { value: 'bold', label: 'Bold, playful animations', description: 'Eye-catching movements and transitions' },
    { value: 'professional', label: 'Professional & smooth transitions', description: 'Polished, business-appropriate animations' },
    { value: 'custom', label: 'Custom', description: 'Define your own animation specifications' }
  ]

  const transitionOptions = [
    { value: 'fade', label: 'Fade-in/out', description: 'Smooth opacity transitions' },
    { value: 'slide', label: 'Slide-in/out', description: 'Sliding movement between pages' },
    { value: 'zoom', label: 'Zoom effect', description: 'Scale-based page transitions' },
    { value: 'none', label: 'None', description: 'Instant page changes' },
    { value: 'custom', label: 'Custom', description: 'Define your own transition effects' }
  ]

  const logoOptions = [
    { value: 'abstract', label: 'Abstract icon', description: 'Geometric shapes and patterns' },
    { value: 'lettermark', label: 'Lettermark', description: 'Typography-based logo with initials' },
    { value: 'symbol-text', label: 'Symbol + Text', description: 'Icon combined with company name' },
    { value: 'minimal', label: 'Minimal geometric', description: 'Simple, clean geometric design' },
    { value: 'custom', label: 'Custom', description: 'Specify your own logo requirements' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-lg">Design Customization</h3>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </CardTitle>
          <CardDescription>Choose the overall visual style for your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {themeOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer p-3 border rounded-lg transition-colors ${
                  designSettings.theme.type === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={designSettings.theme.type === option.value}
                  onChange={(e) => updateDesignSetting('theme', 'type', e.target.value)}
                  className="sr-only"
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>
                    {designSettings.theme.type === option.value && (
                      <Badge variant="secondary" className="text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          {designSettings.theme.type === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <Input
                  id="primary-color"
                  placeholder="#007bff or blue"
                  value={designSettings.theme.primaryColor || ''}
                  onChange={(e) => updateDesignSetting('theme', 'primaryColor', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <Input
                  id="secondary-color"
                  placeholder="#6c757d or gray"
                  value={designSettings.theme.secondaryColor || ''}
                  onChange={(e) => updateDesignSetting('theme', 'secondaryColor', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typography">Typography</Label>
                <Input
                  id="typography"
                  placeholder="Inter, Roboto, or custom font"
                  value={designSettings.theme.typography || ''}
                  onChange={(e) => updateDesignSetting('theme', 'typography', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background-style">Background Style</Label>
                <Input
                  id="background-style"
                  placeholder="Solid, gradient, pattern, etc."
                  value={designSettings.theme.backgroundStyle || ''}
                  onChange={(e) => updateDesignSetting('theme', 'backgroundStyle', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Animations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Animations
          </CardTitle>
          <CardDescription>Define how interactive elements should animate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {animationOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer p-3 border rounded-lg transition-colors ${
                  designSettings.animations.type === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="animations"
                  value={option.value}
                  checked={designSettings.animations.type === option.value}
                  onChange={(e) => updateDesignSetting('animations', 'type', e.target.value)}
                  className="sr-only"
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>
                    {designSettings.animations.type === option.value && (
                      <Badge variant="secondary" className="text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          {designSettings.animations.type === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="interaction-type">Interaction Type</Label>
                <Select
                  value={designSettings.animations.interactionType || ''}
                  onValueChange={(value) => updateDesignSetting('animations', 'interactionType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hover">Hover effects</SelectItem>
                    <SelectItem value="click">Click animations</SelectItem>
                    <SelectItem value="scroll">Scroll-triggered</SelectItem>
                    <SelectItem value="load">Page load animations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="animation-speed">Animation Speed</Label>
                <Select
                  value={designSettings.animations.speed || ''}
                  onValueChange={(value) => updateDesignSetting('animations', 'speed', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast (150ms)</SelectItem>
                    <SelectItem value="normal">Normal (300ms)</SelectItem>
                    <SelectItem value="slow">Slow (500ms)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="easing-style">Easing Style</Label>
                <Select
                  value={designSettings.animations.easing || ''}
                  onValueChange={(value) => updateDesignSetting('animations', 'easing', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select easing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ease">Ease</SelectItem>
                    <SelectItem value="ease-in">Ease In</SelectItem>
                    <SelectItem value="ease-out">Ease Out</SelectItem>
                    <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Transitions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Page Transitions
          </CardTitle>
          <CardDescription>Choose how pages transition between each other</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transitionOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer p-3 border rounded-lg transition-colors ${
                  designSettings.transitions.type === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="transitions"
                  value={option.value}
                  checked={designSettings.transitions.type === option.value}
                  onChange={(e) => updateDesignSetting('transitions', 'type', e.target.value)}
                  className="sr-only"
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>
                    {designSettings.transitions.type === option.value && (
                      <Badge variant="secondary" className="text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          {designSettings.transitions.type === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="transition-direction">Direction</Label>
                <Select
                  value={designSettings.transitions.direction || ''}
                  onValueChange={(value) => updateDesignSetting('transitions', 'direction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left to Right</SelectItem>
                    <SelectItem value="right">Right to Left</SelectItem>
                    <SelectItem value="up">Bottom to Top</SelectItem>
                    <SelectItem value="down">Top to Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transition-duration">Duration</Label>
                <Select
                  value={designSettings.transitions.duration || ''}
                  onValueChange={(value) => updateDesignSetting('transitions', 'duration', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast (200ms)</SelectItem>
                    <SelectItem value="normal">Normal (400ms)</SelectItem>
                    <SelectItem value="slow">Slow (600ms)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="easing-curve">Easing Curve</Label>
                <Select
                  value={designSettings.transitions.easingCurve || ''}
                  onValueChange={(value) => updateDesignSetting('transitions', 'easingCurve', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select curve" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="ease">Ease</SelectItem>
                    <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                    <SelectItem value="cubic-bezier">Cubic Bezier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Logo
          </CardTitle>
          <CardDescription>Define the style and type of logo for your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {logoOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer p-3 border rounded-lg transition-colors ${
                  designSettings.logo.type === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="logo"
                  value={option.value}
                  checked={designSettings.logo.type === option.value}
                  onChange={(e) => updateDesignSetting('logo', 'type', e.target.value)}
                  className="sr-only"
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>
                    {designSettings.logo.type === option.value && (
                      <Badge variant="secondary" className="text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          {designSettings.logo.type === 'custom' && (
            <div className="space-y-4 mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="app-purpose">App Purpose</Label>
                <Textarea
                  id="app-purpose"
                  placeholder="Describe what your application does..."
                  value={designSettings.logo.appPurpose || ''}
                  onChange={(e) => updateDesignSetting('logo', 'appPurpose', e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-colors">Colors</Label>
                  <Input
                    id="logo-colors"
                    placeholder="Blue and white, monochrome, etc."
                    value={designSettings.logo.colors || ''}
                    onChange={(e) => updateDesignSetting('logo', 'colors', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-style">Style</Label>
                  <Select
                    value={designSettings.logo.style || ''}
                    onValueChange={(value) => updateDesignSetting('logo', 'style', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Design</SelectItem>
                      <SelectItem value="3d">3D/Dimensional</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="outline">Outline/Stroke</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}