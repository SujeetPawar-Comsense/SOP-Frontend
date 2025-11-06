import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Palette, Zap, ArrowRightLeft, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { DesignSettings } from './DesignCustomizer'
import { designSteps } from './DesignStepProgressBar'
import ValidatedInput from './ValidatedInput'

interface DesignStepContentProps {
  activeStep: number
  designSettings: DesignSettings
  onDesignChange: (settings: DesignSettings) => void
  onStepChange: (step: number) => void
}

export default function DesignStepContent({
  activeStep,
  designSettings,
  onDesignChange,
  onStepChange
}: DesignStepContentProps) {
  const currentStep = designSteps[activeStep]

  const updateDesignSetting = (category: keyof DesignSettings, key: string, value: string) => {
    onDesignChange({
      ...designSettings,
      [category]: {
        ...designSettings[category],
        [key]: value
      }
    })
  }

  const renderThemeStep = () => {
    const themeOptions = [
      {
        value: 'minimalist',
        label: 'Minimalist',
        description: 'Clean and simple design with plenty of white space'
      },
      {
        value: 'modern',
        label: 'Modern',
        description: 'Contemporary design with bold colors and typography'
      },
      {
        value: 'professional',
        label: 'Professional',
        description: 'Corporate-friendly design suitable for business applications'
      },
      {
        value: 'creative',
        label: 'Creative',
        description: 'Vibrant and artistic design for creative projects'
      },
      {
        value: 'custom',
        label: 'Custom',
        description: 'Define your own custom theme with specific colors and styles'
      }
    ]

    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 neon-glow" id="design-theme">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Theme Configuration
            </span>
          </CardTitle>
          <CardDescription>
            Choose your application's visual theme and color scheme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {themeOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer p-3 border rounded-lg transition-colors neon-glow ${
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
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={designSettings.theme.primaryColor || '#3b82f6'}
                    onChange={(e) => updateDesignSetting('theme', 'primaryColor', e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer rounded border border-primary/30 bg-input"
                  />
                  <div className="flex-1">
                    <ValidatedInput
                      id="primary-color"
                      label="Primary Color"
                      value={designSettings.theme.primaryColor || ''}
                      onChange={(value) => updateDesignSetting('theme', 'primaryColor', value)}
                      placeholder="#3b82f6"
                      description="Hex color code for primary theme color"
                      isHexColor={true}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={designSettings.theme.secondaryColor || '#64748b'}
                    onChange={(e) => updateDesignSetting('theme', 'secondaryColor', e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer rounded border border-primary/30 bg-input"
                  />
                  <div className="flex-1">
                    <ValidatedInput
                      id="secondary-color"
                      label="Secondary Color"
                      value={designSettings.theme.secondaryColor || ''}
                      onChange={(value) => updateDesignSetting('theme', 'secondaryColor', value)}
                      placeholder="#64748b"
                      description="Hex color code for secondary theme color"
                      isHexColor={true}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="typography">Typography</Label>
                <Select
                  value={designSettings.theme.typography || ''}
                  onValueChange={(value) => updateDesignSetting('theme', 'typography', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select typography" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter (Modern)</SelectItem>
                    <SelectItem value="roboto">Roboto (Clean)</SelectItem>
                    <SelectItem value="poppins">Poppins (Friendly)</SelectItem>
                    <SelectItem value="montserrat">Montserrat (Professional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="background-style">Background Style</Label>
                <Select
                  value={designSettings.theme.backgroundStyle || ''}
                  onValueChange={(value) => updateDesignSetting('theme', 'backgroundStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="pattern">Geometric Pattern</SelectItem>
                    <SelectItem value="image">Background Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderAnimationsStep = () => {
    const animationOptions = [
      {
        value: 'none',
        label: 'None',
        description: 'No animations for maximum performance'
      },
      {
        value: 'subtle',
        label: 'Subtle',
        description: 'Light animations that enhance user experience'
      },
      {
        value: 'smooth',
        label: 'Smooth',
        description: 'Fluid animations for modern feel'
      },
      {
        value: 'engaging',
        label: 'Engaging',
        description: 'Rich animations for interactive applications'
      },
      {
        value: 'custom',
        label: 'Custom',
        description: 'Define your own animation preferences'
      }
    ]

    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 neon-glow" id="design-animations">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Animation Settings
            </span>
          </CardTitle>
          <CardDescription>
            Configure interactive animations and micro-interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {animationOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer p-3 border rounded-lg transition-colors neon-glow ${
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
    )
  }

  const renderTransitionsStep = () => {
    const transitionOptions = [
      {
        value: 'none',
        label: 'None',
        description: 'Instant page changes without transitions'
      },
      {
        value: 'fade',
        label: 'Fade',
        description: 'Smooth fade in/out between pages'
      },
      {
        value: 'slide',
        label: 'Slide',
        description: 'Sliding transitions between pages'
      },
      {
        value: 'zoom',
        label: 'Zoom',
        description: 'Zoom in/out transition effects'
      },
      {
        value: 'custom',
        label: 'Custom',
        description: 'Configure specific transition behaviors'
      }
    ]

    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 neon-glow" id="design-transitions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Page Transitions
            </span>
          </CardTitle>
          <CardDescription>
            Define how pages transition and navigate in your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {transitionOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer p-3 border rounded-lg transition-colors neon-glow ${
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
                    <SelectItem value="left-to-right">Left to Right</SelectItem>
                    <SelectItem value="right-to-left">Right to Left</SelectItem>
                    <SelectItem value="top-to-bottom">Top to Bottom</SelectItem>
                    <SelectItem value="bottom-to-top">Bottom to Top</SelectItem>
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
                <Label htmlFor="transition-easing">Easing Curve</Label>
                <Select
                  value={designSettings.transitions.easingCurve || ''}
                  onValueChange={(value) => updateDesignSetting('transitions', 'easingCurve', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select easing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="ease-in">Ease In</SelectItem>
                    <SelectItem value="ease-out">Ease Out</SelectItem>
                    <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderLogoStep = () => {
    const logoOptions = [
      {
        value: 'none',
        label: 'No Logo',
        description: 'Use text-based branding only'
      },
      {
        value: 'minimal',
        label: 'Minimal Logo',
        description: 'Simple icon-based logo'
      },
      {
        value: 'text',
        label: 'Text Logo',
        description: 'Typography-based brand identity'
      },
      {
        value: 'combination',
        label: 'Logo + Text',
        description: 'Combined icon and text branding'
      },
      {
        value: 'custom',
        label: 'Custom Design',
        description: 'Specify custom logo requirements'
      }
    ]

    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 neon-glow" id="design-logo">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Logo & Branding
            </span>
          </CardTitle>
          <CardDescription>
            Configure your application's logo and brand identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {logoOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer p-3 border rounded-lg transition-colors neon-glow ${
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
              <ValidatedInput
                id="app-purpose"
                label="Application Purpose"
                value={designSettings.logo.appPurpose || ''}
                onChange={(value) => updateDesignSetting('logo', 'appPurpose', value)}
                fieldType="appPurpose"
                placeholder="e.g., E-commerce, Social Media, Productivity"
                description="Brief description of your application's main purpose"
              />
              <ValidatedInput
                id="brand-colors"
                label="Preferred Colors"
                value={designSettings.logo.colors || ''}
                onChange={(value) => updateDesignSetting('logo', 'colors', value)}
                fieldType="colors"
                placeholder="e.g., Blue, Green, Modern Palette"
                description="Color preferences for your brand and logo"
              />
              <div className="space-y-2">
                <Label htmlFor="logo-style">Design Style</Label>
                <Select
                  value={designSettings.logo.style || ''}
                  onValueChange={(value) => updateDesignSetting('logo', 'style', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern & Clean</SelectItem>
                    <SelectItem value="playful">Playful & Creative</SelectItem>
                    <SelectItem value="professional">Professional & Corporate</SelectItem>
                    <SelectItem value="minimalist">Minimalist & Simple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return renderThemeStep()
      case 1: return renderAnimationsStep()
      case 2: return renderTransitionsStep()
      case 3: return renderLogoStep()
      default: return renderThemeStep()
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Content */}
      {renderStepContent()}
      
      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          onClick={() => onStepChange(Math.max(0, activeStep - 1))}
          variant="outline"
          disabled={activeStep === 0}
          className="gap-2 neon-glow"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Step {activeStep + 1} of {designSteps.length}
          </p>
        </div>
        
        <Button
          onClick={() => onStepChange(Math.min(designSteps.length - 1, activeStep + 1))}
          variant="outline"
          disabled={activeStep === designSteps.length - 1}
          className="gap-2 neon-glow"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}