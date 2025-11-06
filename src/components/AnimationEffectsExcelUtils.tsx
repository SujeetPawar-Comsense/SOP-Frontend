import * as XLSX from 'xlsx'
import { toast } from 'sonner@2.0.3'

export interface AnimationEffect {
  name: string
  description: string
}

export interface AnimationCategory {
  id: string
  name: string
  effects: AnimationEffect[]
}

export interface AnimationEffectsConfig {
  applyToAllProjects: boolean
  specificModules: string[]
  categories: AnimationCategory[]
  selectedEffects: Record<string, string[]> // categoryId -> array of effect names
  timingEasing: {
    selectedTimings: string[]
  }
}

export const defaultAnimationCategories: AnimationCategory[] = [
  {
    id: 'visibility',
    name: 'Visibility / Entrance / Exit Effects',
    effects: [
      { name: 'Fade In / Out', description: 'Element appears/disappears smoothly.' },
      { name: 'Slide In / Out', description: 'Element slides from left, right, top, bottom.' },
      { name: 'Zoom / Scale In-Out', description: 'Element grows/shrinks on entry/exit.' },
      { name: 'Flip / 3D Rotate', description: 'Card or modal flips along X/Y axis.' },
      { name: 'Clip / Mask Reveal', description: 'Element revealed through clipping or masking shapes.' },
      { name: 'Curtain / Wipe', description: 'Element appears like a curtain or wipe effect.' },
      { name: 'Bounce In / Out', description: 'Entrance with elastic bounce motion.' },
      { name: 'Staggered / Sequential', description: 'Multiple elements appear one after another.' },
      { name: 'Overlay / Modal Transition', description: 'Smooth overlay with opacity or slide.' },
      { name: 'Drawer Slide', description: 'Side panel slides in/out.' }
    ]
  },
  {
    id: 'interaction',
    name: 'Hover / Focus / Interaction Effects',
    effects: [
      { name: 'Color Transition', description: 'Background, text, or border color changes on hover.' },
      { name: 'Shadow / Depth Lift', description: 'Element raises with shadow on hover.' },
      { name: 'Scale / Zoom', description: 'Button or card slightly enlarges.' },
      { name: 'Icon Morph', description: 'Icon changes shape (e.g., hamburger → close).' },
      { name: 'Ripple / Wave', description: 'Click animation spreads outward (Material Design).' },
      { name: 'Glow / Highlight', description: 'Subtle glow on hover or focus.' },
      { name: 'Tilt / 3D Parallax', description: 'Element tilts slightly based on mouse position.' },
      { name: 'Shake / Wiggle', description: 'Draw attention to error or notification.' },
      { name: 'Pulse / Heartbeat', description: 'Element pulses to attract attention.' },
      { name: 'Underline / Border Slide', description: 'Animated underline or border on links/buttons.' }
    ]
  },
  {
    id: 'typography',
    name: 'Text & Typography Effects',
    effects: [
      { name: 'Typing / Cursor', description: 'Text appears as if typed.' },
      { name: 'Fade / Slide Text', description: 'Text fades or slides into view.' },
      { name: 'Letter-by-Letter Animation', description: 'Each letter animates individually.' },
      { name: 'Gradient / Color Flow', description: 'Moving gradient across text.' },
      { name: 'Bounce / Pop', description: 'Text pops slightly on focus or hover.' },
      { name: 'Mask / Reveal', description: 'Text appears through mask or clip path.' },
      { name: 'Marquee / Scroll', description: 'Text scrolls horizontally or vertically.' }
    ]
  },
  {
    id: 'button',
    name: 'Button & CTA Effects',
    effects: [
      { name: 'Fill / Outline Transition', description: 'Button fills color on hover or click.' },
      { name: 'Ripple / Wave', description: 'Material Design-style click effect.' },
      { name: 'Scale / Press Feedback', description: 'Button slightly shrinks on click.' },
      { name: 'Icon Animation', description: 'Icon inside button rotates, flips, or morphs.' },
      { name: 'Glow / Shadow', description: 'Button glows or shadow intensifies on hover.' },
      { name: 'Bounce / Elastic Press', description: 'Button animates like elastic when pressed.' }
    ]
  },
  {
    id: 'card',
    name: 'Card / Panel / Component Effects',
    effects: [
      { name: 'Lift / Depth', description: 'Card lifts with shadow on hover.' },
      { name: 'Flip / Rotate', description: 'Front/back content revealed.' },
      { name: 'Slide / Fade In', description: 'Card enters viewport with motion.' },
      { name: 'Staggered Appearance', description: 'Multiple cards animate sequentially.' },
      { name: 'Expand / Collapse', description: 'Accordion or expandable card.' },
      { name: 'Background Parallax', description: 'Card background moves slightly on hover/scroll.' },
      { name: 'Glass / Frosted Glass', description: 'Fade-in with transparency and blur.' }
    ]
  },
  {
    id: 'loader',
    name: 'Loader / Progress Effects',
    effects: [
      { name: 'Spinner / Circular', description: 'Rotating loading indicator.' },
      { name: 'Progress Bar', description: 'Animated progress bar.' },
      { name: 'Skeleton / Placeholder', description: 'Animated placeholders while content loads.' },
      { name: 'Pulse / Dots', description: 'Animated dots or pulsing circles.' },
      { name: 'Infinite Scroll Animation', description: 'Smooth transition for dynamically loaded content.' },
      { name: 'Wave / Liquid Loader', description: 'Fluid or wave-style loader animation.' }
    ]
  },
  {
    id: 'scroll',
    name: 'Scroll / Page Effects',
    effects: [
      { name: 'Parallax Scrolling', description: 'Elements move at different speeds.' },
      { name: 'Fade / Slide on Scroll', description: 'Elements fade or slide into view.' },
      { name: 'Scroll Spy / Highlight', description: 'Navigation highlights based on scroll position.' },
      { name: 'Pin / Sticky Animation', description: 'Elements stick or move with scroll.' },
      { name: 'Reveal on Scroll', description: 'Hidden content revealed progressively.' },
      { name: 'Infinite Background Animation', description: 'Moving backgrounds while scrolling.' }
    ]
  },
  {
    id: 'form',
    name: 'Form / Input Effects',
    effects: [
      { name: 'Floating Label', description: 'Placeholder moves above field on focus.' },
      { name: 'Input Highlight', description: 'Border glows on focus.' },
      { name: 'Shake on Error', description: 'Field shakes if validation fails.' },
      { name: 'Checkmark / Success Animation', description: 'Animated tick on successful input.' },
      { name: 'Password Reveal', description: 'Eye icon toggle with animation.' },
      { name: 'Tooltip / Hint Animation', description: 'Smooth tooltip appearance.' }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced / Modern Effects',
    effects: [
      { name: 'Lottie / SVG Animations', description: 'Vector animations for scalable effects.' },
      { name: 'Morphing Shapes / Icons', description: 'Elements morph between shapes on interaction.' },
      { name: 'Particle Effects', description: 'Floating particles, confetti, snow, sparks.' },
      { name: 'Elastic / Spring Motion', description: 'Natural bouncing motion on drag/drop.' },
      { name: '3D Transform / Perspective', description: 'Cards or objects rotate in 3D space.' },
      { name: 'Background Gradient Animation', description: 'Animated gradients on sections or elements.' },
      { name: 'Interactive Motion Path', description: 'Element follows cursor or defined path.' },
      { name: 'Glassmorphism', description: 'Smooth blur + transparency effects with motion.' },
      { name: 'Neumorphism / Soft UI', description: 'Subtle depth, shadow, and hover effects.' },
      { name: 'Staggered Timeline Animations', description: 'Multiple effects sequenced over time.' }
    ]
  },
  {
    id: 'timing',
    name: 'Timing & Easing',
    effects: [
      { name: 'Linear', description: 'Constant speed.' },
      { name: 'Ease', description: 'Starts slow, speeds up, ends slow.' },
      { name: 'Ease-in / Ease-out / Ease-in-out', description: 'Natural acceleration/deceleration.' },
      { name: 'Cubic-bezier', description: 'Custom easing curves for modern feel.' },
      { name: 'Spring / Elastic', description: 'Realistic bounce motion.' },
      { name: 'Step / Frame-based', description: 'Abrupt or stepwise transitions.' }
    ]
  }
]

export function createDefaultAnimationEffectsConfig(): AnimationEffectsConfig {
  return {
    applyToAllProjects: true,
    specificModules: [],
    categories: defaultAnimationCategories,
    selectedEffects: {},
    timingEasing: {
      selectedTimings: []
    }
  }
}

export function createAnimationEffectsTemplate() {
  const wb = XLSX.utils.book_new()
  
  // Instructions Sheet
  const instructionsData = [
    ['Animation Effects Template'],
    [''],
    ['Instructions:'],
    ['1. This template contains all available animation effect categories'],
    ['2. Mark effects you want to use with "x" or "yes" in the Selected column'],
    ['3. Set application scope in the Configuration sheet'],
    ['4. Import this file back into the platform'],
    [''],
    ['Categories:'],
    ['- Visibility / Entrance / Exit Effects'],
    ['- Hover / Focus / Interaction Effects'],
    ['- Text & Typography Effects'],
    ['- Button & CTA Effects'],
    ['- Card / Panel / Component Effects'],
    ['- Loader / Progress Effects'],
    ['- Scroll / Page Effects'],
    ['- Form / Input Effects'],
    ['- Advanced / Modern Effects'],
    ['- Timing & Easing']
  ]
  
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData)
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions')

  // Configuration Sheet
  const configData = [
    ['Configuration', 'Value'],
    ['Apply to All Projects', 'Yes'],
    ['Specific Modules (comma-separated)', '']
  ]
  
  const wsConfig = XLSX.utils.aoa_to_sheet(configData)
  XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuration')

  // Create a sheet for each category
  defaultAnimationCategories.forEach(category => {
    const categoryData = [
      [category.name],
      [''],
      ['Effect', 'Description', 'Selected']
    ]
    
    category.effects.forEach(effect => {
      categoryData.push([effect.name, effect.description, ''])
    })
    
    const ws = XLSX.utils.aoa_to_sheet(categoryData)
    
    // Set column widths
    ws['!cols'] = [
      { wch: 35 },
      { wch: 60 },
      { wch: 10 }
    ]
    
    // Truncate sheet name if needed (max 31 characters)
    let sheetName = category.name
    if (sheetName.length > 31) {
      sheetName = sheetName.substring(0, 28) + '...'
    }
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  // Generate and download
  XLSX.writeFile(wb, 'animation_effects_template.xlsx')
  toast.success('Animation effects template downloaded')
}

export function exportAnimationEffects(config: AnimationEffectsConfig, projectName: string) {
  const wb = XLSX.utils.book_new()
  
  // Configuration Sheet
  const configData = [
    ['Configuration', 'Value'],
    ['Apply to All Projects', config.applyToAllProjects ? 'Yes' : 'No'],
    ['Specific Modules (comma-separated)', config.specificModules.join(', ')]
  ]
  
  const wsConfig = XLSX.utils.aoa_to_sheet(configData)
  XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuration')

  // Export each category with selections
  config.categories.forEach(category => {
    const categoryData = [
      [category.name],
      [''],
      ['Effect', 'Description', 'Selected']
    ]
    
    const selectedForCategory = config.selectedEffects[category.id] || []
    
    category.effects.forEach(effect => {
      const isSelected = selectedForCategory.includes(effect.name)
      categoryData.push([
        effect.name,
        effect.description,
        isSelected ? 'Yes' : ''
      ])
    })
    
    const ws = XLSX.utils.aoa_to_sheet(categoryData)
    
    // Set column widths
    ws['!cols'] = [
      { wch: 35 },
      { wch: 60 },
      { wch: 10 }
    ]
    
    // Truncate sheet name if needed
    let sheetName = category.name
    if (sheetName.length > 31) {
      sheetName = sheetName.substring(0, 28) + '...'
    }
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  // Summary Sheet
  const summaryData: any[] = [
    ['Animation Effects Summary'],
    ['Project: ' + projectName],
    [''],
    ['Category', 'Selected Effects Count', 'Total Effects']
  ]
  
  config.categories.forEach(category => {
    const selectedCount = (config.selectedEffects[category.id] || []).length
    const totalCount = category.effects.length
    summaryData.push([category.name, selectedCount, totalCount])
  })
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 40 }, { wch: 25 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

  const fileName = `${projectName.replace(/[^a-z0-9]/gi, '_')}_animation_effects.xlsx`
  XLSX.writeFile(wb, fileName)
  toast.success('Animation effects exported successfully')
}

export async function importAnimationEffects(file: File): Promise<AnimationEffectsConfig | null> {
  try {
    const data = await file.arrayBuffer()
    const wb = XLSX.read(data, { type: 'array' })
    
    const config = createDefaultAnimationEffectsConfig()
    
    // Read Configuration
    if (wb.SheetNames.includes('Configuration')) {
      const wsConfig = wb.Sheets['Configuration']
      const configData: any[] = XLSX.utils.sheet_to_json(wsConfig, { header: 1 })
      
      configData.forEach((row: any[]) => {
        if (row[0] === 'Apply to All Projects') {
          config.applyToAllProjects = row[1]?.toString().toLowerCase() === 'yes'
        } else if (row[0] === 'Specific Modules (comma-separated)') {
          const modules = row[1]?.toString() || ''
          config.specificModules = modules
            .split(',')
            .map((m: string) => m.trim())
            .filter((m: string) => m.length > 0)
        }
      })
    }
    
    // Read each category sheet
    defaultAnimationCategories.forEach(category => {
      // Try to find the sheet (handle truncated names)
      let sheetName = category.name
      if (!wb.SheetNames.includes(sheetName)) {
        // Try truncated version
        if (sheetName.length > 31) {
          sheetName = sheetName.substring(0, 28) + '...'
        }
      }
      
      if (wb.SheetNames.includes(sheetName)) {
        const ws = wb.Sheets[sheetName]
        const sheetData: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 })
        
        const selectedEffects: string[] = []
        
        // Skip header rows (first 3 rows)
        for (let i = 3; i < sheetData.length; i++) {
          const row = sheetData[i]
          if (row && row[0]) {
            const effectName = row[0].toString()
            const selected = row[2]?.toString().toLowerCase()
            
            if (selected === 'yes' || selected === 'x' || selected === 'true') {
              selectedEffects.push(effectName)
            }
          }
        }
        
        if (selectedEffects.length > 0) {
          config.selectedEffects[category.id] = selectedEffects
        }
      }
    })
    
    toast.success('Animation effects imported successfully')
    return config
    
  } catch (error) {
    console.error('Import error:', error)
    toast.error('Failed to import animation effects')
    return null
  }
}
