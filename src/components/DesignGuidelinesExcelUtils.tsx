import * as XLSX from 'xlsx'
import { toast } from 'sonner@2.0.3'
import { AnimationEffectsConfig, createDefaultAnimationEffectsConfig } from './AnimationEffectsExcelUtils'

export interface DesignGuidelines {
  branding: BrandingConfig
  typography: TypographyConfig
  layout: LayoutConfig
  components: ComponentsConfig
  interaction: InteractionConfig
  tokens: DesignTokensConfig
  accessibility: AccessibilityConfig
  responsive: ResponsiveConfig
  technical: TechnicalConfig
  workflow: WorkflowConfig
  ai: AIConfig
  documentation: DocumentationConfig
  animationEffects: AnimationEffectsConfig
}

export interface BrandingConfig {
  logo: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  neutralColor: string
  successColor: string
  warningColor: string
  errorColor: string
  colorMode: 'Light' | 'Dark' | 'Both'
  gradientStyle: string
  brandImageryStyle: string
  visualDensity: 'Compact' | 'Comfortable' | 'Spacious'
  shadowScale: string
  borderRadius: string
  transparency: string
}

export interface TypographyConfig {
  primaryFont: string
  secondaryFont: string
  monospaceFont: string
  fontSource: string
  h1Size: string
  h2Size: string
  h3Size: string
  bodySize: string
  lineHeight: string
  letterSpacing: string
  fontPairing: string
  responsiveScale: boolean
  accessibilityMode: string
}

export interface LayoutConfig {
  gridSystem: '8px' | '10px' | '12px' | '16px'
  columnLayout: '12-column' | '16-column' | 'Fluid'
  containerWidth: string
  spacingScale: string
  alignment: 'Left' | 'Center' | 'Justified'
  pageMargins: string
  breakpoints: string
  layoutPattern: string
  whiteSpaceStrategy: 'Minimal' | 'Balanced' | 'Generous'
  sectionPadding: string
}

export interface ComponentsConfig {
  buttonVariants: string
  buttonShape: 'Rounded' | 'Pill' | 'Square'
  inputStyle: string
  cardElevation: string
  tabStyle: 'Underline' | 'Filled' | 'Segmented'
  navigationStyle: 'Top' | 'Side' | 'Hybrid'
  modalAnimation: 'Fade' | 'Scale' | 'Slide'
  tooltipDelay: string
  tableStyle: string
  avatarShape: 'Circle' | 'Square'
  chipStyle: 'Outlined' | 'Filled' | 'Gradient'
  toastPosition: string
  skeletonAnimation: 'Pulse' | 'Wave'
}

export interface InteractionConfig {
  hoverEffect: string
  microinteractions: string
  pageTransition: 'Slide' | 'Fade' | 'Scale' | 'None'
  gestureSupport: string
  animationCurve: 'Ease' | 'Spring' | 'Linear'
  scrollBehavior: 'Smooth' | 'Snap' | 'Parallax' | 'Normal'
  autoSave: boolean
  loadingIndicator: 'Spinner' | 'Progress' | 'Skeleton' | 'Shimmer'
  errorRetry: boolean
}

export interface DesignTokensConfig {
  tokenFormat: 'JSON' | 'YAML' | 'CSS Variables'
  componentVariants: string
  themingArchitecture: 'Single' | 'Multi-theme'
  namingConvention: 'PascalCase' | 'kebab-case' | 'BEM' | 'Atomic'
  uiKit: string
  figmaLibrary: string
  storybookIntegration: boolean
}

export interface AccessibilityConfig {
  contrastRatio: 'WCAG AA' | 'WCAG AAA'
  keyboardNav: boolean
  ariaAttributes: boolean
  screenReaderText: boolean
  motionReduction: boolean
  colorBlindMode: string
  highContrast: boolean
  fontScaling: boolean
  languageDirection: 'LTR' | 'RTL' | 'Both'
  errorMessageClarity: boolean
}

export interface ResponsiveConfig {
  breakpointXS: string
  breakpointSM: string
  breakpointMD: string
  breakpointLG: string
  breakpointXL: string
  adaptiveLayout: string
  minTouchTarget: string
  responsiveTypography: boolean
  imageScaling: string
  gridReflow: string
  devicePreview: boolean
}

export interface TechnicalConfig {
  cssFramework: string
  componentLibrary: string
  iconLibrary: string
  tokenExportFormat: 'JSON' | 'SCSS' | 'CSS Vars'
  darkModeSupport: 'Auto' | 'Manual' | 'Disabled'
  lintRules: string
  codeGenStyle: 'Atomic' | 'Utility-first' | 'BEM'
}

export interface WorkflowConfig {
  figmaProjectLink: string
  versioningEnabled: boolean
  approvalWorkflow: boolean
  designToDevHandoff: string
  prototypeBehavior: string
  feedbackEnabled: boolean
  accessibilityChecklist: boolean
  designQAChecklist: boolean
}

export interface AIConfig {
  designStylePrompt: string
  layoutPrompt: string
  colorPrompt: string
  componentPrompt: string
  themeGenerator: boolean
  wireframeMode: boolean
  usabilityRecommendations: boolean
  consistencyChecker: boolean
}

export interface DocumentationConfig {
  designSystemDocs: string
  changeLogsEnabled: boolean
  governanceRules: string
  brandGuidelinesExport: boolean
  tokenSyncEnabled: boolean
  uiTestingTemplates: string
  uxResearchIntegration: string
  patternUsageAnalytics: boolean
}

export const createDefaultDesignGuidelines = (): DesignGuidelines => ({
  branding: {
    logo: '',
    primaryColor: '#00ff88',
    secondaryColor: '#0066cc',
    accentColor: '#ff6b35',
    neutralColor: '#64748b',
    successColor: '#22c55e',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    colorMode: 'Both',
    gradientStyle: 'Linear gradients with subtle transitions',
    brandImageryStyle: 'Modern, minimal',
    visualDensity: 'Comfortable',
    shadowScale: 'Levels 0-5',
    borderRadius: '8px default',
    transparency: 'Background 80%, Overlay 50%'
  },
  typography: {
    primaryFont: 'Inter',
    secondaryFont: 'Space Grotesk',
    monospaceFont: 'JetBrains Mono',
    fontSource: 'Google Fonts',
    h1Size: '2.5rem',
    h2Size: '2rem',
    h3Size: '1.5rem',
    bodySize: '1rem',
    lineHeight: '1.5',
    letterSpacing: 'Normal',
    fontPairing: 'Heading: Space Grotesk, Body: Inter',
    responsiveScale: true,
    accessibilityMode: 'Standard'
  },
  layout: {
    gridSystem: '8px',
    columnLayout: '12-column',
    containerWidth: '1280px max',
    spacingScale: '4, 8, 12, 16, 24, 32, 40, 64',
    alignment: 'Left',
    pageMargins: '24px',
    breakpoints: 'XS: 320px, SM: 640px, MD: 768px, LG: 1024px, XL: 1280px',
    layoutPattern: 'Card-based layout',
    whiteSpaceStrategy: 'Balanced',
    sectionPadding: '48px vertical, 24px horizontal'
  },
  components: {
    buttonVariants: 'Primary, Secondary, Ghost, Link, Destructive',
    buttonShape: 'Rounded',
    inputStyle: 'Outlined with subtle background',
    cardElevation: 'Level 2 shadow',
    tabStyle: 'Underline',
    navigationStyle: 'Top',
    modalAnimation: 'Scale',
    tooltipDelay: '300ms',
    tableStyle: 'Bordered with hover',
    avatarShape: 'Circle',
    chipStyle: 'Filled',
    toastPosition: 'Top-right',
    skeletonAnimation: 'Pulse'
  },
  interaction: {
    hoverEffect: 'Scale + shadow transition',
    microinteractions: 'Button ripple, checkbox bounce',
    pageTransition: 'Fade',
    gestureSupport: 'Swipe, pinch, long press',
    animationCurve: 'Ease',
    scrollBehavior: 'Smooth',
    autoSave: true,
    loadingIndicator: 'Spinner',
    errorRetry: true
  },
  tokens: {
    tokenFormat: 'JSON',
    componentVariants: 'Small, Medium, Large, Disabled',
    themingArchitecture: 'Multi-theme',
    namingConvention: 'kebab-case',
    uiKit: 'Tailwind + Shadcn/ui',
    figmaLibrary: '',
    storybookIntegration: false
  },
  accessibility: {
    contrastRatio: 'WCAG AA',
    keyboardNav: true,
    ariaAttributes: true,
    screenReaderText: true,
    motionReduction: true,
    colorBlindMode: 'None',
    highContrast: false,
    fontScaling: true,
    languageDirection: 'LTR',
    errorMessageClarity: true
  },
  responsive: {
    breakpointXS: '320px',
    breakpointSM: '640px',
    breakpointMD: '768px',
    breakpointLG: '1024px',
    breakpointXL: '1280px',
    adaptiveLayout: 'Stack to grid',
    minTouchTarget: '44x44px',
    responsiveTypography: true,
    imageScaling: 'WebP with lazy load',
    gridReflow: 'Horizontal to vertical collapse',
    devicePreview: true
  },
  technical: {
    cssFramework: 'Tailwind CSS',
    componentLibrary: 'Shadcn/ui',
    iconLibrary: 'Lucide React',
    tokenExportFormat: 'CSS Vars',
    darkModeSupport: 'Manual',
    lintRules: 'ESLint + Prettier',
    codeGenStyle: 'Utility-first'
  },
  workflow: {
    figmaProjectLink: '',
    versioningEnabled: true,
    approvalWorkflow: false,
    designToDevHandoff: 'Figma to Code',
    prototypeBehavior: 'Click-through with transitions',
    feedbackEnabled: true,
    accessibilityChecklist: true,
    designQAChecklist: true
  },
  ai: {
    designStylePrompt: 'Clean, modern SaaS dashboard with futuristic neon accents',
    layoutPrompt: 'Use 12-column responsive grid with 24px gaps',
    colorPrompt: 'Primary neon green (#00ff88) for trust, dark background for depth',
    componentPrompt: 'Accessible buttons with clear hover states and neon glow effects',
    themeGenerator: true,
    wireframeMode: false,
    usabilityRecommendations: true,
    consistencyChecker: true
  },
  documentation: {
    designSystemDocs: 'Auto-generated from tokens',
    changeLogsEnabled: true,
    governanceRules: 'Require review before merge',
    brandGuidelinesExport: true,
    tokenSyncEnabled: false,
    uiTestingTemplates: 'Playwright templates',
    uxResearchIntegration: '',
    patternUsageAnalytics: false
  },
  animationEffects: createDefaultAnimationEffectsConfig()
})

export const createDesignGuidelinesTemplate = () => {
  const defaultGuidelines = createDefaultDesignGuidelines()
  
  // Create sheets for each category
  const sheets: { [key: string]: any[] } = {}

  // Branding sheet
  sheets['Branding'] = [
    { Parameter: 'Logo', Value: defaultGuidelines.branding.logo || 'Upload SVG/PNG' },
    { Parameter: 'Primary Color', Value: defaultGuidelines.branding.primaryColor },
    { Parameter: 'Secondary Color', Value: defaultGuidelines.branding.secondaryColor },
    { Parameter: 'Accent Color', Value: defaultGuidelines.branding.accentColor },
    { Parameter: 'Neutral Color', Value: defaultGuidelines.branding.neutralColor },
    { Parameter: 'Success Color', Value: defaultGuidelines.branding.successColor },
    { Parameter: 'Warning Color', Value: defaultGuidelines.branding.warningColor },
    { Parameter: 'Error Color', Value: defaultGuidelines.branding.errorColor },
    { Parameter: 'Color Mode', Value: defaultGuidelines.branding.colorMode },
    { Parameter: 'Gradient Style', Value: defaultGuidelines.branding.gradientStyle },
    { Parameter: 'Brand Imagery Style', Value: defaultGuidelines.branding.brandImageryStyle },
    { Parameter: 'Visual Density', Value: defaultGuidelines.branding.visualDensity },
    { Parameter: 'Shadow Scale', Value: defaultGuidelines.branding.shadowScale },
    { Parameter: 'Border Radius', Value: defaultGuidelines.branding.borderRadius },
    { Parameter: 'Transparency', Value: defaultGuidelines.branding.transparency }
  ]

  // Typography sheet
  sheets['Typography'] = [
    { Parameter: 'Primary Font', Value: defaultGuidelines.typography.primaryFont },
    { Parameter: 'Secondary Font', Value: defaultGuidelines.typography.secondaryFont },
    { Parameter: 'Monospace Font', Value: defaultGuidelines.typography.monospaceFont },
    { Parameter: 'Font Source', Value: defaultGuidelines.typography.fontSource },
    { Parameter: 'H1 Size', Value: defaultGuidelines.typography.h1Size },
    { Parameter: 'H2 Size', Value: defaultGuidelines.typography.h2Size },
    { Parameter: 'H3 Size', Value: defaultGuidelines.typography.h3Size },
    { Parameter: 'Body Size', Value: defaultGuidelines.typography.bodySize },
    { Parameter: 'Line Height', Value: defaultGuidelines.typography.lineHeight },
    { Parameter: 'Letter Spacing', Value: defaultGuidelines.typography.letterSpacing },
    { Parameter: 'Font Pairing', Value: defaultGuidelines.typography.fontPairing },
    { Parameter: 'Responsive Scale', Value: defaultGuidelines.typography.responsiveScale ? 'Yes' : 'No' },
    { Parameter: 'Accessibility Mode', Value: defaultGuidelines.typography.accessibilityMode }
  ]

  // Layout sheet
  sheets['Layout'] = [
    { Parameter: 'Grid System', Value: defaultGuidelines.layout.gridSystem },
    { Parameter: 'Column Layout', Value: defaultGuidelines.layout.columnLayout },
    { Parameter: 'Container Width', Value: defaultGuidelines.layout.containerWidth },
    { Parameter: 'Spacing Scale', Value: defaultGuidelines.layout.spacingScale },
    { Parameter: 'Alignment', Value: defaultGuidelines.layout.alignment },
    { Parameter: 'Page Margins', Value: defaultGuidelines.layout.pageMargins },
    { Parameter: 'Breakpoints', Value: defaultGuidelines.layout.breakpoints },
    { Parameter: 'Layout Pattern', Value: defaultGuidelines.layout.layoutPattern },
    { Parameter: 'White Space Strategy', Value: defaultGuidelines.layout.whiteSpaceStrategy },
    { Parameter: 'Section Padding', Value: defaultGuidelines.layout.sectionPadding }
  ]

  // Components sheet
  sheets['Components'] = [
    { Parameter: 'Button Variants', Value: defaultGuidelines.components.buttonVariants },
    { Parameter: 'Button Shape', Value: defaultGuidelines.components.buttonShape },
    { Parameter: 'Input Style', Value: defaultGuidelines.components.inputStyle },
    { Parameter: 'Card Elevation', Value: defaultGuidelines.components.cardElevation },
    { Parameter: 'Tab Style', Value: defaultGuidelines.components.tabStyle },
    { Parameter: 'Navigation Style', Value: defaultGuidelines.components.navigationStyle },
    { Parameter: 'Modal Animation', Value: defaultGuidelines.components.modalAnimation },
    { Parameter: 'Tooltip Delay', Value: defaultGuidelines.components.tooltipDelay },
    { Parameter: 'Table Style', Value: defaultGuidelines.components.tableStyle },
    { Parameter: 'Avatar Shape', Value: defaultGuidelines.components.avatarShape },
    { Parameter: 'Chip Style', Value: defaultGuidelines.components.chipStyle },
    { Parameter: 'Toast Position', Value: defaultGuidelines.components.toastPosition },
    { Parameter: 'Skeleton Animation', Value: defaultGuidelines.components.skeletonAnimation }
  ]

  // Create workbook with all sheets
  const workbook = XLSX.utils.book_new()
  
  Object.entries(sheets).forEach(([sheetName, data]) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    worksheet['!cols'] = [{ wch: 30 }, { wch: 60 }]
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  })

  XLSX.writeFile(workbook, 'design_guidelines_template.xlsx')
  toast.success('Design guidelines template downloaded')
}

export const exportDesignGuidelines = (guidelines: DesignGuidelines, projectName: string) => {
  const sheets: { [key: string]: any[] } = {}

  // Convert each category to sheet data
  sheets['Branding'] = Object.entries(guidelines.branding).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: value
  }))

  sheets['Typography'] = Object.entries(guidelines.typography).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  }))

  sheets['Layout'] = Object.entries(guidelines.layout).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: value
  }))

  sheets['Components'] = Object.entries(guidelines.components).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: value
  }))

  sheets['Interaction'] = Object.entries(guidelines.interaction).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  }))

  sheets['Design Tokens'] = Object.entries(guidelines.tokens).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  }))

  sheets['Accessibility'] = Object.entries(guidelines.accessibility).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  }))

  sheets['Responsive'] = Object.entries(guidelines.responsive).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  }))

  sheets['Technical'] = Object.entries(guidelines.technical).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: value
  }))

  sheets['Workflow'] = Object.entries(guidelines.workflow).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  }))

  sheets['AI Config'] = Object.entries(guidelines.ai).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  }))

  sheets['Documentation'] = Object.entries(guidelines.documentation).map(([key, value]) => ({
    Parameter: key.replace(/([A-Z])/g, ' $1').trim(),
    Value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  }))

  const workbook = XLSX.utils.book_new()
  
  Object.entries(sheets).forEach(([sheetName, data]) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    worksheet['!cols'] = [{ wch: 30 }, { wch: 60 }]
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  })

  const fileName = `${projectName.replace(/\s+/g, '_')}_design_guidelines.xlsx`
  XLSX.writeFile(workbook, fileName)
  toast.success('Design guidelines exported to Excel')
}

export const importDesignGuidelines = (file: File): Promise<DesignGuidelines> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        const guidelines = createDefaultDesignGuidelines()

        // Helper to convert sheet to object
        const sheetToObject = (sheetName: string, target: any) => {
          if (!workbook.SheetNames.includes(sheetName)) return
          
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]
          
          jsonData.forEach(row => {
            const key = row.Parameter?.replace(/\s+/g, '')
            const keyLower = key?.charAt(0).toLowerCase() + key?.slice(1)
            
            if (keyLower && target.hasOwnProperty(keyLower)) {
              let value = row.Value
              
              // Convert Yes/No to boolean
              if (value === 'Yes' || value === 'No') {
                value = value === 'Yes'
              }
              
              target[keyLower] = value
            }
          })
        }

        sheetToObject('Branding', guidelines.branding)
        sheetToObject('Typography', guidelines.typography)
        sheetToObject('Layout', guidelines.layout)
        sheetToObject('Components', guidelines.components)
        sheetToObject('Interaction', guidelines.interaction)
        sheetToObject('Design Tokens', guidelines.tokens)
        sheetToObject('Accessibility', guidelines.accessibility)
        sheetToObject('Responsive', guidelines.responsive)
        sheetToObject('Technical', guidelines.technical)
        sheetToObject('Workflow', guidelines.workflow)
        sheetToObject('AI Config', guidelines.ai)
        sheetToObject('Documentation', guidelines.documentation)

        toast.success('Design guidelines imported successfully')
        resolve(guidelines)
      } catch (error) {
        console.error('Error parsing Excel file:', error)
        toast.error('Failed to parse Excel file')
        reject(error)
      }
    }

    reader.onerror = () => {
      toast.error('Failed to read Excel file')
      reject(new Error('Failed to read file'))
    }

    reader.readAsBinaryString(file)
  })
}
