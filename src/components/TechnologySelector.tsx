import { useState, useEffect, useCallback } from 'react'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { X, Plus } from 'lucide-react'
import ValidatedTextarea from './ValidatedTextarea'

interface TechnologySelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const TECHNOLOGY_SUGGESTIONS = {
  'Frontend': ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby', 'Vite', 'Webpack', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Chakra UI'],
  'Backend': ['Node.js', 'Express.js', 'Nest.js', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 'C#', '.NET', 'Ruby on Rails', 'Go', 'Rust', 'PHP', 'Laravel', 'Symfony'],
  'Database': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Cassandra', 'DynamoDB', 'Firebase Firestore', 'Supabase', 'PlanetScale', 'CockroachDB', 'Neo4j'],
  'Cloud & DevOps': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'Nginx', 'Apache', 'Cloudflare', 'Vercel', 'Netlify', 'Heroku'],
  'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic', 'Xamarin', 'Cordova', 'Expo'],
  'Testing': ['Jest', 'Cypress', 'Selenium', 'Playwright', 'Testing Library', 'Mocha', 'Chai', 'Vitest', 'Puppeteer'],
  'API & Integration': ['GraphQL', 'REST API', 'Socket.io', 'WebSockets', 'gRPC', 'Webhooks', 'OAuth', 'JWT', 'Stripe API', 'Twilio', 'SendGrid'],
  'State Management': ['Redux', 'Zustand', 'MobX', 'Recoil', 'Context API', 'Vuex', 'Pinia', 'NgRx'],
  'Build Tools': ['Vite', 'Webpack', 'Rollup', 'Parcel', 'ESBuild', 'Turbopack', 'Babel', 'SWC'],
  'Monitoring': ['Sentry', 'LogRocket', 'Datadog', 'New Relic', 'Grafana', 'Prometheus', 'Elastic Stack']
}

const ALL_TECHNOLOGIES = Object.values(TECHNOLOGY_SUGGESTIONS).flat()

export default function TechnologySelector({ value, onChange, placeholder }: TechnologySelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [additionalText, setAdditionalText] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Parse the existing value on mount only
  useEffect(() => {
    if (!isInitialized) {
      if (value) {
        const lines = value.split('\n')
        const techLine = lines.find(line => line.startsWith('Technologies: '))
        const otherLines = lines.filter(line => !line.startsWith('Technologies: ')).join('\n')
        
        if (techLine) {
          const techs = techLine.replace('Technologies: ', '').split(', ').filter(Boolean)
          setSelectedTechnologies(techs)
        }
        setAdditionalText(otherLines.trim())
      }
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  // Helper function to build and send the combined value
  const buildAndSendValue = useCallback((techs: string[], text: string) => {
    let newValue = ''
    if (techs.length > 0) {
      newValue += `Technologies: ${techs.join(', ')}`
    }
    if (text.trim()) {
      if (newValue) newValue += '\n\n'
      newValue += text.trim()
    }
    onChange(newValue)
  }, [onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    setInputValue(inputVal)

    if (inputVal.trim().length > 0) {
      const filtered = ALL_TECHNOLOGIES.filter(tech => 
        tech.toLowerCase().includes(inputVal.toLowerCase()) &&
        !selectedTechnologies.includes(tech)
      ).slice(0, 8)
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const addTechnology = (tech: string) => {
    if (!selectedTechnologies.includes(tech)) {
      const newTechs = [...selectedTechnologies, tech]
      setSelectedTechnologies(newTechs)
      buildAndSendValue(newTechs, additionalText)
    }
    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const removeTechnology = (techToRemove: string) => {
    const newTechs = selectedTechnologies.filter(tech => tech !== techToRemove)
    setSelectedTechnologies(newTechs)
    buildAndSendValue(newTechs, additionalText)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault()
      addTechnology(suggestions[0])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setInputValue('')
    }
  }

  const getCategoryForTech = (tech: string): string => {
    for (const [category, techs] of Object.entries(TECHNOLOGY_SUGGESTIONS)) {
      if (techs.includes(tech)) {
        return category
      }
    }
    return 'Other'
  }

  const groupedSuggestions = suggestions.reduce((acc, tech) => {
    const category = getCategoryForTech(tech)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(tech)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="space-y-3">
      {/* Technology Input and Selected Technologies */}
      <div className="space-y-3">
        <div className="relative">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Type to search technologies..."}
            className="w-full"
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => {
              if (inputValue.length > 0) {
                const filtered = ALL_TECHNOLOGIES.filter(tech => 
                  tech.toLowerCase().includes(inputValue.toLowerCase()) &&
                  !selectedTechnologies.includes(tech)
                ).slice(0, 8)
                setSuggestions(filtered)
                setShowSuggestions(true)
              }
            }}
          />
          
          {/* Technology Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute z-10 w-full mt-1 max-h-80 overflow-y-auto shadow-lg">
              <div className="p-2">
                {Object.entries(groupedSuggestions).map(([category, techs]) => (
                  <div key={category} className="mb-3 last:mb-0">
                    <div className="text-xs text-muted-foreground mb-2 px-2">{category}</div>
                    <div className="space-y-1">
                      {techs.map((tech) => (
                        <button
                          key={tech}
                          onClick={() => addTechnology(tech)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-3 h-3" />
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Selected Technologies */}
        {selectedTechnologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTechnologies.map((tech) => (
              <Badge 
                key={tech} 
                variant="secondary" 
                className="gap-1 pr-1 text-xs"
              >
                {tech}
                <button
                  onClick={() => removeTechnology(tech)}
                  className="ml-1 hover:bg-accent rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Additional Framework Description */}
      <ValidatedTextarea
        id="framework-details"
        label="Framework Details"
        value={additionalText}
        onChange={(newText) => {
          setAdditionalText(newText)
          buildAndSendValue(selectedTechnologies, newText)
        }}
        fieldType="framework"
        placeholder="Add additional framework requirements or architecture details..."
        description="Detailed requirements for your technology stack and architecture"
        rows={3}
      />
    </div>
  )
}