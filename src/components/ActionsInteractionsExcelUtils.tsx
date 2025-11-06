import * as XLSX from 'xlsx'
import { toast } from 'sonner@2.0.3'

export interface InteractionCategory {
  id: string
  name: string
  actions: string[]
}

export interface ActionsInteractionsConfig {
  categories: InteractionCategory[]
  selectedActions: Record<string, string[]> // categoryId -> selected action names
  applyToAllProjects: boolean
  specificModules: string[] // Module IDs if not applying to all
}

export const defaultInteractionCategories: InteractionCategory[] = [
  {
    id: 'click-tap',
    name: 'Click & Tap Actions',
    actions: [
      'Click',
      'Double-click',
      'Long press / hold',
      'Tap',
      'Tap and hold',
      'Select / Deselect',
      'Submit / Trigger action',
      'Toggle state'
    ]
  },
  {
    id: 'hover-focus',
    name: 'Hover & Focus Actions',
    actions: [
      'Hover / mouseover',
      'Hover tooltip / show info',
      'Hover highlight / effect',
      'Focus input field',
      'Blur input field',
      'Hover animation',
      'Focus trap (modal/dialog)'
    ]
  },
  {
    id: 'drag-drop',
    name: 'Drag & Drop / Reorder',
    actions: [
      'Drag item',
      'Drop item',
      'Reorder items',
      'Drag to resize',
      'Drag handle',
      'Multi-select drag & drop',
      'Drag into target zone'
    ]
  },
  {
    id: 'expand-collapse',
    name: 'Expand / Collapse / Toggle',
    actions: [
      'Expand section / accordion',
      'Collapse section / accordion',
      'Toggle panel visibility',
      'Expand/collapse nested items',
      'Show/hide sidebar / drawer',
      'Show/hide container/section',
      'Expand/collapse modal content'
    ]
  },
  {
    id: 'navigation-scroll',
    name: 'Navigation & Scroll',
    actions: [
      'Scroll to section',
      'Smooth scroll',
      'Scroll pagination / infinite scroll',
      'Scrollspy active highlight',
      'Pan map / draggable canvas',
      'Navigate stepper / wizard',
      'Navigate tabs'
    ]
  },
  {
    id: 'input-form',
    name: 'Input & Form Actions',
    actions: [
      'Type input',
      'Enter / Submit value',
      'Clear input',
      'Copy / Paste',
      'Autocomplete / select suggestion',
      'Toggle password visibility',
      'Pick date/time',
      'Select single/multiple option',
      'Enable / Disable field',
      'Validate input',
      'Adjust slider / range selector'
    ]
  },
  {
    id: 'selection-multi',
    name: 'Selection & Multi-Selection',
    actions: [
      'Check / uncheck checkbox',
      'Select radio button',
      'Multi-select dropdown options',
      'Select multiple items in list / table',
      'Highlight selected rows/cells/items'
    ]
  },
  {
    id: 'table-data',
    name: 'Table & Data Actions',
    actions: [
      'Sort columns',
      'Filter data / search',
      'Paginate / change page',
      'Expand / collapse row',
      'Inline edit',
      'Export data (CSV/XLS)',
      'Freeze header / column',
      'Group / Ungroup rows'
    ]
  },
  {
    id: 'media-visual',
    name: 'Media & Visual Interactions',
    actions: [
      'Play / Pause (video/audio)',
      'Seek / Skip / Rewind',
      'Adjust volume',
      'Toggle fullscreen',
      'Zoom image / map / chart',
      'Hover tooltip on chart / graph / map marker',
      'Animate / loop / pause illustration or animation',
      'Swipe carousel / slider',
      'Drag to reorder gallery items'
    ]
  },
  {
    id: 'modal-overlay',
    name: 'Modal / Overlay Actions',
    actions: [
      'Open modal / dialog',
      'Close modal / dialog',
      'Click outside to dismiss',
      'Keyboard dismiss (Esc key)',
      'Backdrop click interaction',
      'Focus trap'
    ]
  },
  {
    id: 'feedback-status',
    name: 'Feedback & Status Interactions',
    actions: [
      'Show / hide alert / banner',
      'Dismiss alert / toast',
      'Auto-dismiss toast/snackbar',
      'Click action button in toast/alert',
      'Update progress bar value',
      'Start / stop spinner',
      'Animate skeleton loader',
      'Update status indicator (online/offline/active)'
    ]
  },
  {
    id: 'advanced',
    name: 'Miscellaneous Advanced Actions',
    actions: [
      'Right-click / context menu',
      'Toggle FAB menu / expand actions',
      'Hover / click nested menu',
      'Filter / reset filters / faceted filter',
      'Snap to predefined size (split view, resizable panels)',
      'Trigger action on token/tag',
      'Add / remove tokens / chips',
      'Highlight interactive hotspots / Lottie interactions'
    ]
  },
  {
    id: 'keyboard-a11y',
    name: 'Keyboard & Accessibility Actions',
    actions: [
      'Keyboard navigation (arrows, tab)',
      'Enter / space for selection',
      'Escape to close',
      'Shortcut keys / hotkeys',
      'Focus management'
    ]
  }
]

export function createDefaultActionsInteractionsConfig(): ActionsInteractionsConfig {
  return {
    categories: defaultInteractionCategories,
    selectedActions: {},
    applyToAllProjects: true,
    specificModules: []
  }
}

export function createActionsInteractionsTemplate() {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Categories and Actions
  const categoriesData = [
    ['Category ID', 'Category Name', 'Action', 'Selected', 'Notes'],
    ...defaultInteractionCategories.flatMap(category =>
      category.actions.map((action, idx) => [
        idx === 0 ? category.id : '',
        idx === 0 ? category.name : '',
        action,
        'No',
        ''
      ])
    )
  ]

  const wsCategories = XLSX.utils.aoa_to_sheet(categoriesData)
  
  // Set column widths
  wsCategories['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 50 },
    { wch: 10 },
    { wch: 30 }
  ]

  XLSX.utils.book_append_sheet(wb, wsCategories, 'Actions & Interactions')

  // Sheet 2: Configuration
  const configData = [
    ['Setting', 'Value', 'Description'],
    ['Apply to All Projects', 'Yes', 'Set to "Yes" to apply to all projects, "No" for specific modules'],
    ['Specific Module IDs', '', 'Comma-separated module IDs if not applying to all (e.g., 1,2,3)'],
    ['', '', ''],
    ['Instructions:', '', ''],
    ['1. Mark "Selected" as "Yes" for actions you want to enable', '', ''],
    ['2. Set "Apply to All Projects" to Yes or No', '', ''],
    ['3. If "No", list specific module IDs', '', ''],
    ['4. Import this file back into the application', '', '']
  ]

  const wsConfig = XLSX.utils.aoa_to_sheet(configData)
  wsConfig['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 60 }]
  
  XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuration')

  // Download
  XLSX.writeFile(wb, 'actions-interactions-template.xlsx')
  toast.success('Actions & Interactions template downloaded')
}

export function exportActionsInteractions(
  config: ActionsInteractionsConfig,
  projectName: string
) {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Selected Actions
  const actionsData: any[][] = [
    ['Category ID', 'Category Name', 'Action', 'Selected', 'Notes']
  ]

  config.categories.forEach(category => {
    const selectedInCategory = config.selectedActions[category.id] || []
    category.actions.forEach((action, idx) => {
      actionsData.push([
        idx === 0 ? category.id : '',
        idx === 0 ? category.name : '',
        action,
        selectedInCategory.includes(action) ? 'Yes' : 'No',
        ''
      ])
    })
  })

  const wsActions = XLSX.utils.aoa_to_sheet(actionsData)
  wsActions['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 50 },
    { wch: 10 },
    { wch: 30 }
  ]

  XLSX.utils.book_append_sheet(wb, wsActions, 'Actions & Interactions')

  // Sheet 2: Configuration
  const configData = [
    ['Setting', 'Value'],
    ['Apply to All Projects', config.applyToAllProjects ? 'Yes' : 'No'],
    ['Specific Module IDs', config.specificModules.join(', ')],
    ['', ''],
    ['Summary:', ''],
    ['Total Categories', config.categories.length.toString()],
    ['Total Selected Actions', Object.values(config.selectedActions).flat().length.toString()]
  ]

  const wsConfig = XLSX.utils.aoa_to_sheet(configData)
  wsConfig['!cols'] = [{ wch: 25 }, { wch: 50 }]

  XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuration')

  // Download
  const fileName = `${projectName}-actions-interactions-${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
  toast.success('Actions & Interactions exported successfully')
}

export async function importActionsInteractions(
  file: File
): Promise<ActionsInteractionsConfig> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // Read Actions sheet
        const actionsSheet = workbook.Sheets['Actions & Interactions']
        if (!actionsSheet) {
          throw new Error('Actions & Interactions sheet not found')
        }

        const actionsData: any[][] = XLSX.utils.sheet_to_json(actionsSheet, {
          header: 1,
          defval: ''
        })

        // Read Configuration sheet
        const configSheet = workbook.Sheets['Configuration']
        const configData: any[][] = configSheet
          ? XLSX.utils.sheet_to_json(configSheet, { header: 1, defval: '' })
          : []

        // Parse configuration
        let applyToAllProjects = true
        let specificModules: string[] = []

        configData.forEach(row => {
          if (row[0] === 'Apply to All Projects') {
            applyToAllProjects = row[1]?.toString().toLowerCase() === 'yes'
          } else if (row[0] === 'Specific Module IDs' && row[1]) {
            specificModules = row[1]
              .toString()
              .split(',')
              .map((id: string) => id.trim())
              .filter(Boolean)
          }
        })

        // Parse selected actions
        const selectedActions: Record<string, string[]> = {}
        let currentCategoryId = ''

        for (let i = 1; i < actionsData.length; i++) {
          const row = actionsData[i]
          if (!row || row.length < 4) continue

          const categoryId = row[0]?.toString().trim()
          const action = row[2]?.toString().trim()
          const selected = row[3]?.toString().toLowerCase() === 'yes'

          if (categoryId) {
            currentCategoryId = categoryId
          }

          if (action && selected && currentCategoryId) {
            if (!selectedActions[currentCategoryId]) {
              selectedActions[currentCategoryId] = []
            }
            selectedActions[currentCategoryId].push(action)
          }
        }

        const config: ActionsInteractionsConfig = {
          categories: defaultInteractionCategories,
          selectedActions,
          applyToAllProjects,
          specificModules
        }

        toast.success('Actions & Interactions imported successfully')
        resolve(config)
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to import Actions & Interactions')
        reject(error)
      }
    }

    reader.onerror = () => {
      toast.error('Failed to read file')
      reject(new Error('File read error'))
    }

    reader.readAsArrayBuffer(file)
  })
}
