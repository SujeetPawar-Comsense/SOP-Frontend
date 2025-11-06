// Validation utilities and character limits
export const CHARACTER_LIMITS = {
  // New 9-section fields
  projectOverview: 1000,
  featuresModules: 1200,
  techStack: 800,
  designGuidelines: 600,
  securityCompliance: 600,
  environmentSetup: 500,
  apiDatabase: 700,
  documentation: 400,
  notes: 600,
  // BA Dashboard fields
  modulesFeatures: 1200,
  businessRules: 800,
  uiuxGuidelines: 800,
  // Developer Dashboard fields
  codingStandards: 1000,
  architecture: 1200,
  devOpsPractices: 1000,
  securityGuidelines: 1000,
  testingPractices: 800,
  // Design customizer fields
  appPurpose: 100,
  colors: 50,
  primaryColor: 7,
  secondaryColor: 7
} as const

export type ValidatedField = keyof typeof CHARACTER_LIMITS

export interface ValidationResult {
  isValid: boolean
  message?: string
  characterCount: number
  characterLimit: number
  isNearLimit: boolean
  isOverLimit: boolean
}

export const validateField = (
  value: string, 
  fieldType: ValidatedField,
  isRequired: boolean = false
): ValidationResult => {
  const limit = CHARACTER_LIMITS[fieldType]
  const count = value.length
  const isOverLimit = count > limit
  const isNearLimit = count > limit * 0.8 // 80% of limit
  
  let isValid = true
  let message: string | undefined

  // Check if required field is empty
  if (isRequired && count === 0) {
    isValid = false
    message = 'This field is required'
  }
  // Check character limit
  else if (isOverLimit) {
    isValid = false
    message = `Exceeds character limit by ${count - limit} characters`
  }
  // Warn when approaching limit
  else if (isNearLimit) {
    message = `${limit - count} characters remaining`
  }

  return {
    isValid,
    message,
    characterCount: count,
    characterLimit: limit,
    isNearLimit,
    isOverLimit
  }
}

export const validateHexColor = (color: string): ValidationResult => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  const isValid = hexRegex.test(color) || color === ''
  
  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid hex color (e.g., #00ff88)',
    characterCount: color.length,
    characterLimit: 7,
    isNearLimit: false,
    isOverLimit: color.length > 7
  }
}

export const getValidationClassName = (validation: ValidationResult): string => {
  if (!validation.isValid) {
    return 'border-destructive focus:border-destructive focus:ring-destructive/20'
  }
  if (validation.isNearLimit) {
    return 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20'
  }
  return 'border-primary/30 focus:border-primary focus:ring-primary/20'
}

export const getCharacterCountClassName = (validation: ValidationResult): string => {
  if (validation.isOverLimit) {
    return 'text-destructive'
  }
  if (validation.isNearLimit) {
    return 'text-yellow-500'
  }
  return 'text-muted-foreground'
}
