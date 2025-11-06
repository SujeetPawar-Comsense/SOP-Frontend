import * as XLSX from 'xlsx'
import { toast } from 'sonner@2.0.3'

export interface ModuleFeature {
  id: string
  moduleName: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
  businessImpact: string
  dependencies: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  userStoryId?: string // Optional: Links module to a user story
}

export const createExcelTemplate = () => {
  const templateData = [
    {
      'Module/Feature Name': 'Example: User Authentication',
      'Description': 'User login, registration, and password reset functionality',
      'Priority': 'High',
      'Business Impact': 'Critical for user access and security',
      'Dependencies': 'Database, Email Service',
      'Status': 'Not Started'
    },
    {
      'Module/Feature Name': '',
      'Description': '',
      'Priority': '',
      'Business Impact': '',
      'Dependencies': '',
      'Status': ''
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // Module/Feature Name
    { wch: 50 }, // Description
    { wch: 12 }, // Priority
    { wch: 40 }, // Business Impact
    { wch: 30 }, // Dependencies
    { wch: 15 }  // Status
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modules & Features')

  // Generate file
  XLSX.writeFile(workbook, 'modules_features_template.xlsx')
  toast.success('Excel template downloaded successfully')
}

export const exportModulesToExcel = (modules: ModuleFeature[], projectName: string) => {
  if (modules.length === 0) {
    toast.error('No modules to export')
    return
  }

  const exportData = modules.map(module => ({
    'Module/Feature Name': module.moduleName,
    'Description': module.description,
    'Priority': module.priority,
    'Business Impact': module.businessImpact,
    'Dependencies': module.dependencies,
    'Status': module.status
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 },
    { wch: 50 },
    { wch: 12 },
    { wch: 40 },
    { wch: 30 },
    { wch: 15 }
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modules & Features')

  const fileName = `${projectName.replace(/\s+/g, '_')}_modules_features.xlsx`
  XLSX.writeFile(workbook, fileName)
  toast.success('Modules exported to Excel successfully')
}

export const importModulesFromExcel = (file: File): Promise<ModuleFeature[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        const modules: ModuleFeature[] = jsonData
          .filter(row => row['Module/Feature Name'] && row['Module/Feature Name'].trim() !== '')
          .map((row, index) => ({
            id: Math.random().toString(36).substr(2, 9),
            moduleName: row['Module/Feature Name'] || '',
            description: row['Description'] || '',
            priority: validatePriority(row['Priority']),
            businessImpact: row['Business Impact'] || '',
            dependencies: row['Dependencies'] || '',
            status: validateStatus(row['Status']),
            userStoryId: row['User Story ID'] || undefined // Add userStoryId to the module
          }))

        if (modules.length === 0) {
          toast.error('No valid modules found in the Excel file')
          reject(new Error('No valid modules found'))
          return
        }

        toast.success(`${modules.length} module(s) imported successfully`)
        resolve(modules)
      } catch (error) {
        console.error('Error parsing Excel file:', error)
        toast.error('Failed to parse Excel file. Please check the format.')
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

const validatePriority = (value: any): 'High' | 'Medium' | 'Low' => {
  const normalizedValue = String(value || '').toLowerCase()
  if (normalizedValue.includes('high')) return 'High'
  if (normalizedValue.includes('low')) return 'Low'
  return 'Medium'
}

const validateStatus = (value: any): 'Not Started' | 'In Progress' | 'Completed' => {
  const normalizedValue = String(value || '').toLowerCase()
  if (normalizedValue.includes('progress')) return 'In Progress'
  if (normalizedValue.includes('complete')) return 'Completed'
  return 'Not Started'
}