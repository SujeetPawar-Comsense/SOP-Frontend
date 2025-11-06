import { Input } from './ui/input'
import { Label } from './ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { validateField, validateHexColor, getValidationClassName, getCharacterCountClassName, ValidatedField } from './ValidationUtils'

interface ValidatedInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  fieldType?: ValidatedField
  placeholder?: string
  description?: string
  required?: boolean
  type?: string
  isHexColor?: boolean
}

export default function ValidatedInput({
  id,
  label,
  value,
  onChange,
  fieldType,
  placeholder,
  description,
  required = false,
  type = 'text',
  isHexColor = false
}: ValidatedInputProps) {
  const validation = isHexColor 
    ? validateHexColor(value)
    : fieldType 
    ? validateField(value, fieldType, required)
    : {
        isValid: true,
        characterCount: value.length,
        characterLimit: 0,
        isNearLimit: false,
        isOverLimit: false
      }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="flex items-center gap-2">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        {(fieldType || isHexColor) && (
          <div className={`text-xs flex items-center gap-1 ${getCharacterCountClassName(validation)}`}>
            <span>{validation.characterCount}/{validation.characterLimit}</span>
            {validation.isOverLimit && <AlertCircle className="w-3 h-3" />}
            {validation.isValid && validation.characterCount > 0 && !validation.isNearLimit && (
              <CheckCircle2 className="w-3 h-3 text-primary" />
            )}
          </div>
        )}
      </div>
      
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`transition-colors ${getValidationClassName(validation)} neon-glow`}
      />
      
      {/* Validation message or description */}
      <div className="min-h-[1.25rem]">
        {validation.message ? (
          <p className={`text-xs flex items-center gap-1 ${
            validation.isValid ? 'text-yellow-500' : 'text-destructive'
          }`}>
            {!validation.isValid && <AlertCircle className="w-3 h-3" />}
            {validation.message}
          </p>
        ) : description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}