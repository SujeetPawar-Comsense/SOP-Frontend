import * as XLSX from 'xlsx'
import { toast } from 'sonner@2.0.3'

export interface RuleSubcategory {
  id: string
  name: string
  example: string
  userRule?: string // User's custom business rule for this subcategory
  isCustom?: boolean // If true, this was added by the user
  applicableTo?: string[] // Modules this rule applies to
}

export interface RuleCategory {
  id: string
  name: string
  subcategories: RuleSubcategory[]
  customSubcategories?: RuleSubcategory[] // User-added subcategories
}

export interface BusinessRulesConfig {
  categories: RuleCategory[]
  applyToAllProjects: boolean
  specificModules: string[]
}

export function createDefaultBusinessRulesConfig(): BusinessRulesConfig {
  return {
    categories: [
      {
        id: 'data-integrity',
        name: 'Data Integrity Rules',
        subcategories: [
          {
            id: 'uniqueness',
            name: 'Uniqueness',
            example: 'Ensure unique identifiers (user ID, email, transaction ID).',
          },
          {
            id: 'mandatory-fields',
            name: 'Mandatory / Required Fields',
            example: 'Fields that cannot be empty (name, address, date of birth).',
          },
          {
            id: 'data-type',
            name: 'Data Type Validation',
            example: 'Check correct data type (integer, string, date, boolean).',
          },
          {
            id: 'format-pattern',
            name: 'Format / Pattern Validation',
            example: 'Email, phone number, postal code, UUID, regex checks.',
          },
          {
            id: 'range-limit',
            name: 'Range / Limit Validation',
            example: 'Numerical/date ranges (e.g., age between 18–65).',
          },
          {
            id: 'referential-integrity',
            name: 'Referential Integrity',
            example: 'Foreign key must exist (order linked to valid customer).',
          },
          {
            id: 'duplication-prevention',
            name: 'Duplication Prevention',
            example: 'Prevent duplicate records or repeated entries.',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'transaction-workflow',
        name: 'Transaction & Workflow Rules',
        subcategories: [
          {
            id: 'approval-auth',
            name: 'Approval / Authorization',
            example: 'Manager approval for high-value transactions.',
          },
          {
            id: 'workflow-sequencing',
            name: 'Workflow Sequencing',
            example: 'Steps must follow defined order (submit → approve → execute).',
          },
          {
            id: 'threshold-limit',
            name: 'Threshold / Limit Checks',
            example: 'Transactions exceeding limit trigger review.',
          },
          {
            id: 'state-status',
            name: 'State / Status Validation',
            example: 'Action allowed only in certain states (invoice must be pending).',
          },
          {
            id: 'retry-compensation',
            name: 'Retry / Compensation',
            example: 'Failed transactions retried or rolled back.',
          },
          {
            id: 'time-based',
            name: 'Time-Based Constraints',
            example: 'Deadlines, cut-off times, expiry dates.',
          },
          {
            id: 'conditional-logic',
            name: 'Conditional Logic',
            example: 'Action depends on multiple conditions (IF…AND…THEN…).',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'compliance-regulatory',
        name: 'Compliance & Regulatory Rules',
        subcategories: [
          {
            id: 'data-privacy',
            name: 'Data Privacy',
            example: 'GDPR, HIPAA, CCPA compliance rules.',
          },
          {
            id: 'audit-trail',
            name: 'Audit Trail',
            example: 'Log user actions, data changes, approvals.',
          },
          {
            id: 'kyc-aml',
            name: 'KYC / AML',
            example: 'Identity verification, anti-money laundering checks.',
          },
          {
            id: 'reporting-standards',
            name: 'Reporting Standards',
            example: 'Financial, operational, or regulatory reporting rules.',
          },
          {
            id: 'mandatory-consent',
            name: 'Mandatory Consent',
            example: 'Users must accept terms before proceeding.',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'business-logic',
        name: 'Business Logic / Calculations',
        subcategories: [
          {
            id: 'pricing-discounts',
            name: 'Pricing & Discounts',
            example: 'Tiered pricing, promotions, seasonal discounts.',
          },
          {
            id: 'tax-fee',
            name: 'Tax / Fee Calculation',
            example: 'VAT, GST, service charges, fees.',
          },
          {
            id: 'interest-penalty',
            name: 'Interest / Penalty',
            example: 'Late fees, accrued interest, fines.',
          },
          {
            id: 'scoring-rating',
            name: 'Scoring / Rating',
            example: 'Loyalty points, credit score, risk scoring.',
          },
          {
            id: 'aggregation-summaries',
            name: 'Aggregation & Summaries',
            example: 'Totals, averages, min/max for analytics.',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'security-access',
        name: 'Security & Access Control',
        subcategories: [
          {
            id: 'rbac',
            name: 'Role-Based Access Control (RBAC)',
            example: 'Limit actions by user role.',
          },
          {
            id: 'authentication',
            name: 'Authentication',
            example: 'Passwords, MFA, OAuth, JWT.',
          },
          {
            id: 'session-management',
            name: 'Session Management',
            example: 'Timeout, concurrent session limits.',
          },
          {
            id: 'encryption',
            name: 'Encryption',
            example: 'Data at rest/in transit encrypted.',
          },
          {
            id: 'privilege-escalation',
            name: 'Privilege Escalation Prevention',
            example: 'No unauthorized elevation of access.',
          },
          {
            id: 'logging-auditing',
            name: 'Logging & Auditing',
            example: 'Track critical access and actions.',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'uiux-rules',
        name: 'UI / UX Rules',
        subcategories: [
          {
            id: 'mandatory-indicators',
            name: 'Mandatory Field Indicators',
            example: 'Highlight required fields.',
          },
          {
            id: 'error-handling',
            name: 'Error Handling',
            example: 'User-friendly error messages.',
          },
          {
            id: 'navigation-workflow',
            name: 'Navigation / Workflow',
            example: 'Prevent skipping steps or unauthorized page access.',
          },
          {
            id: 'data-sorting',
            name: 'Data Sorting / Filtering',
            example: 'Tables with search, sort, filter, pagination.',
          },
          {
            id: 'accessibility',
            name: 'Accessibility',
            example: 'WCAG compliance, keyboard navigation, screen readers.',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'inventory-resource',
        name: 'Inventory / Resource Management',
        subcategories: [
          {
            id: 'stock-capacity',
            name: 'Stock / Capacity Checks',
            example: 'Prevent overbooking, overselling.',
          },
          {
            id: 'reservation-allocation',
            name: 'Reservation & Allocation',
            example: 'Allocate resources based on availability and priority.',
          },
          {
            id: 'reorder-alerts',
            name: 'Reorder Alerts',
            example: 'Notify when stock below threshold.',
          },
          {
            id: 'expiry-shelf-life',
            name: 'Expiry / Shelf-life',
            example: 'Track and prevent usage of expired items.',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'communication-notification',
        name: 'Communication / Notification Rules',
        subcategories: [
          {
            id: 'trigger-conditions',
            name: 'Trigger Conditions',
            example: 'Send notifications based on events (order shipped, invoice overdue).',
          },
          {
            id: 'frequency-limits',
            name: 'Frequency Limits',
            example: 'Avoid spamming users.',
          },
          {
            id: 'channel-preference',
            name: 'Channel Preference',
            example: 'Respect user choice (email, SMS, app notification).',
          },
          {
            id: 'template-compliance',
            name: 'Template / Content Compliance',
            example: 'Standardized messages for communication.',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'integration-api',
        name: 'Integration & API Rules',
        subcategories: [
          {
            id: 'data-format',
            name: 'Data Format Validation',
            example: 'JSON, XML, schema validation.',
          },
          {
            id: 'rate-limiting',
            name: 'Rate Limiting / Throttling',
            example: 'API usage limits per time window.',
          },
          {
            id: 'api-auth',
            name: 'Authentication / Authorization',
            example: 'API keys, OAuth, JWT validation.',
          },
          {
            id: 'error-retries',
            name: 'Error Handling / Retries',
            example: 'Retry logic and fallback mechanisms.',
          },
          {
            id: 'data-consistency',
            name: 'Data Consistency',
            example: 'Sync data accurately between systems.',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'reporting-analytics',
        name: 'Reporting & Analytics',
        subcategories: [
          {
            id: 'aggregation-rules',
            name: 'Aggregation Rules',
            example: 'Sum, average, min/max calculations.',
          },
          {
            id: 'filter-drilldown',
            name: 'Filter & Drill-Down',
            example: 'Role-based or condition-based filtering.',
          },
          {
            id: 'retention-archiving',
            name: 'Retention & Archiving',
            example: 'Rules for storing historical data.',
          },
          {
            id: 'visualization-accuracy',
            name: 'Visualization Accuracy',
            example: 'Charts/tables reflect actual data correctly.',
          },
        ],
        customSubcategories: [],
      },
      {
        id: 'quality-validation',
        name: 'Quality & Validation',
        subcategories: [
          {
            id: 'duplicate-conflict',
            name: 'Duplicate / Conflict Detection',
            example: 'Identify conflicting records.',
          },
          {
            id: 'cross-validation',
            name: 'Cross-Validation',
            example: 'Related fields consistency checks.',
          },
          {
            id: 'mandatory-qa',
            name: 'Mandatory QA Checks',
            example: 'Approval before publishing or deploying.',
          },
          {
            id: 'threshold-tolerance',
            name: 'Threshold / Tolerance Checks',
            example: 'Values within defined limits (e.g., measurement errors).',
          },
        ],
        customSubcategories: [],
      },
    ],
    applyToAllProjects: false,
    specificModules: [],
  }
}

export function createBusinessRulesTemplate() {
  const config = createDefaultBusinessRulesConfig()
  const wb = XLSX.utils.book_new()

  // Create a flattened data structure for Excel
  const data: any[] = []
  
  config.categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      data.push({
        Category: category.name,
        'Rule Type / Subcategory': subcategory.name,
        'Description / Example': subcategory.example,
        'Your Business Rule': '', // Empty for user to fill
      })
    })
  })

  const ws = XLSX.utils.json_to_sheet(data)
  
  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Category
    { wch: 35 }, // Rule Type
    { wch: 60 }, // Example
    { wch: 60 }, // Your Business Rule
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Business Rules')

  // Add instructions sheet
  const instructions = [
    ['Business Rules Template - Instructions'],
    [''],
    ['How to use this template:'],
    ['1. Review the pre-defined categories and rule types'],
    ['2. Fill in "Your Business Rule" column with specific rules for your project'],
    ['3. You can add custom subcategories by adding new rows under each category'],
    ['4. Save and import this file back into the application'],
    [''],
    ['Categories included:'],
    ['- Data Integrity Rules'],
    ['- Transaction & Workflow Rules'],
    ['- Compliance & Regulatory Rules'],
    ['- Business Logic / Calculations'],
    ['- Security & Access Control'],
    ['- UI / UX Rules'],
    ['- Inventory / Resource Management'],
    ['- Communication / Notification Rules'],
    ['- Integration & API Rules'],
    ['- Reporting & Analytics'],
    ['- Quality & Validation'],
  ]

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions)
  wsInstructions['!cols'] = [{ wch: 80 }]
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions')

  XLSX.writeFile(wb, 'business_rules_template.xlsx')
  toast.success('Business Rules template downloaded')
}

export function exportBusinessRules(config: BusinessRulesConfig, projectName: string) {
  const wb = XLSX.utils.book_new()
  const data: any[] = []

  config.categories.forEach(category => {
    // Export default subcategories
    category.subcategories.forEach(subcategory => {
      data.push({
        Category: category.name,
        'Rule Type / Subcategory': subcategory.name,
        'Description / Example': subcategory.example,
        'Your Business Rule': subcategory.userRule || '',
        'Is Custom': 'No',
      })
    })

    // Export custom subcategories
    if (category.customSubcategories && category.customSubcategories.length > 0) {
      category.customSubcategories.forEach(subcategory => {
        data.push({
          Category: category.name,
          'Rule Type / Subcategory': subcategory.name,
          'Description / Example': subcategory.example,
          'Your Business Rule': subcategory.userRule || '',
          'Is Custom': 'Yes',
        })
      })
    }
  })

  // Add configuration sheet
  const configData = [
    ['Configuration', 'Value'],
    ['Apply to All Projects', config.applyToAllProjects ? 'Yes' : 'No'],
    ['Specific Modules', config.specificModules.join(', ')],
  ]

  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [
    { wch: 35 },
    { wch: 35 },
    { wch: 60 },
    { wch: 60 },
    { wch: 10 },
  ]

  const wsConfig = XLSX.utils.aoa_to_sheet(configData)
  wsConfig['!cols'] = [{ wch: 30 }, { wch: 50 }]

  XLSX.utils.book_append_sheet(wb, ws, 'Business Rules')
  XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuration')

  const fileName = `${projectName.replace(/\s+/g, '_')}_business_rules.xlsx`
  XLSX.writeFile(wb, fileName)
  toast.success('Business Rules exported successfully')
}

export async function importBusinessRules(file: File): Promise<BusinessRulesConfig | null> {
  try {
    const data = await file.arrayBuffer()
    const wb = XLSX.read(data)

    if (!wb.SheetNames.includes('Business Rules')) {
      toast.error('Invalid file: Missing "Business Rules" sheet')
      return null
    }

    const ws = wb.Sheets['Business Rules']
    const jsonData: any[] = XLSX.utils.sheet_to_json(ws)

    const config = createDefaultBusinessRulesConfig()
    const categoryMap = new Map<string, RuleCategory>()

    // Create a map for quick lookup
    config.categories.forEach(cat => {
      categoryMap.set(cat.name, cat)
    })

    jsonData.forEach(row => {
      const categoryName = row['Category']
      const subcategoryName = row['Rule Type / Subcategory']
      const example = row['Description / Example']
      const userRule = row['Your Business Rule']
      const isCustom = row['Is Custom'] === 'Yes'

      const category = categoryMap.get(categoryName)
      if (!category) return

      if (isCustom) {
        // Add to custom subcategories
        if (!category.customSubcategories) {
          category.customSubcategories = []
        }
        category.customSubcategories.push({
          id: `custom-${Date.now()}-${Math.random()}`,
          name: subcategoryName,
          example: example || '',
          userRule: userRule || '',
          isCustom: true,
        })
      } else {
        // Find and update existing subcategory
        const subcategory = category.subcategories.find(s => s.name === subcategoryName)
        if (subcategory && userRule) {
          subcategory.userRule = userRule
        }
      }
    })

    // Import configuration if available
    if (wb.SheetNames.includes('Configuration')) {
      const wsConfig = wb.Sheets['Configuration']
      const configData: any[] = XLSX.utils.sheet_to_json(wsConfig)
      
      configData.forEach(row => {
        if (row['Configuration'] === 'Apply to All Projects') {
          config.applyToAllProjects = row['Value'] === 'Yes'
        } else if (row['Configuration'] === 'Specific Modules') {
          config.specificModules = row['Value'] ? row['Value'].split(',').map((m: string) => m.trim()).filter(Boolean) : []
        }
      })
    }

    toast.success('Business Rules imported successfully')
    return config
  } catch (error) {
    console.error('Error importing business rules:', error)
    toast.error('Failed to import business rules')
    return null
  }
}
