import * as XLSX from 'xlsx'
import { UserStory } from './UserStoriesEditor'

export const createUserStoriesTemplate = (): void => {
  const template = [
    {
      'Title': 'User Registration',
      'User/Role': 'Customer',
      'Description': 'As a Customer, I want to register an account so that I can access personalized features.',
      'Acceptance Criteria': '- User can enter email and password\n- Email validation is performed\n- Password must be at least 8 characters',
      'Priority': 'High',
      'Status': 'Not Started'
    },
    {
      'Title': 'Product Search',
      'User/Role': 'Customer',
      'Description': 'As a Customer, I want to search for products so that I can quickly find what I need.',
      'Acceptance Criteria': '- Search bar is visible\n- Results display quickly\n- Filters can be applied',
      'Priority': 'Medium',
      'Status': 'Not Started'
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(template)
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 },  // Title
    { wch: 15 },  // User/Role
    { wch: 50 },  // Description
    { wch: 50 },  // Acceptance Criteria
    { wch: 12 },  // Priority
    { wch: 15 }   // Status
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'User Stories Template')
  XLSX.writeFile(workbook, 'user_stories_template.xlsx')
}

export const exportUserStories = (userStories: UserStory[]): void => {
  if (userStories.length === 0) {
    alert('No user stories to export')
    return
  }

  const exportData = userStories.map(story => ({
    'Title': story.title,
    'User/Role': story.userRole,
    'Description': story.description,
    'Acceptance Criteria': story.acceptanceCriteria,
    'Priority': story.priority,
    'Status': story.status
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 },  // Title
    { wch: 15 },  // User/Role
    { wch: 50 },  // Description
    { wch: 50 },  // Acceptance Criteria
    { wch: 12 },  // Priority
    { wch: 15 }   // Status
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'User Stories')
  XLSX.writeFile(workbook, 'user_stories_export.xlsx')
}

export const importUserStories = (file: File): Promise<UserStory[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        const userStories: UserStory[] = jsonData.map(row => ({
          id: crypto.randomUUID(),
          title: row['Title'] || '',
          userRole: row['User/Role'] || '',
          description: row['Description'] || '',
          acceptanceCriteria: row['Acceptance Criteria'] || '',
          priority: (row['Priority'] === 'High' || row['Priority'] === 'Medium' || row['Priority'] === 'Low') 
            ? row['Priority'] 
            : 'Medium',
          status: (row['Status'] === 'Not Started' || row['Status'] === 'In Progress' || row['Status'] === 'Completed')
            ? row['Status']
            : 'Not Started'
        }))

        resolve(userStories)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsBinaryString(file)
  })
}
