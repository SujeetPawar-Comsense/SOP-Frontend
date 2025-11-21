import { supabase } from './supabaseClient'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ============================================
// AUTHENTICATION API
// ============================================

export interface MockUser {
  id: string
  email: string
  user_metadata: {
    name: string
    role: 'project_owner' | 'vibe_engineer'
  }
}

export interface MockSession {
  access_token: string
  user: MockUser
}

export const authAPI = {
  signUp: async (
    email: string,
    password: string,
    name: string,
    role: 'project_owner' | 'vibe_engineer'
  ) => {
    try {
      // Call backend signup endpoint which handles both auth and user profile creation
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Signup failed')
      }

      return { user: result.user }
    } catch (error: any) {
      console.error('Signup error:', error)
      throw error
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      // Call backend signin endpoint
      const response = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Invalid email or password')
      }

      // Store the session in Supabase client for other API calls
      if (result.session) {
        await supabase.auth.setSession(result.session)
      }

      return {
        session: result.session,
        user: result.user
      }
    } catch (error: any) {
      console.error('Signin error:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      // Call backend signout endpoint
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        await fetch('http://localhost:3000/api/auth/signout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
      }

      // Clear local session
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Signout error:', error)
      // Continue with local signout even if backend fails
      await supabase.auth.signOut()
    }
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

// ============================================
// PROJECT API
// ============================================

export type ApplicationType = 
  | 'Batch Application' 
  | 'Web Application' 
  | 'Website' 
  | 'Microservices';

export type DevelopmentType = 
  | 'Frontend'
  | 'Backend API'
  | 'Database Schema'
  | 'Unit Tests'
  | 'Integration Tests'
  | 'Batch Application'
  | 'Microservices'
  | 'CI/CD Pipeline'
  | 'Documentation';

export interface Project {
  id: string
  name: string
  description: string
  created_at: string
  created_by: string
  created_by_name: string
  created_by_role: string
  completion_percentage: number
  updated_at: string
  application_type?: ApplicationType
}

export interface VibePrompt {
  id: string
  project_id: string
  prompt_type: string
  generated_prompt: string
  context: {
    role: string
    developmentType: DevelopmentType
    applicationType?: ApplicationType
    previousOutputsCount: number
    generatedAt: string
  }
  created_at: string
}

export const projectAPI = {
  create: async (projectData: { name: string; description: string }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the user's name from the users table for better reliability
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        created_by: user.id,
        created_by_name: userProfile?.name || user.user_metadata.name || user.email?.split('@')[0] || 'Unknown User',
        created_by_role: userProfile?.role || user.user_metadata.role || 'vibe_engineer',
        completion_percentage: 0
      })
      .select()
      .single()

    if (error) throw error
    
    // Map snake_case to camelCase for frontend compatibility
    const project = data ? {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at,
      createdBy: data.created_by,
      createdByName: data.created_by_name,
      createdByRole: data.created_by_role,
      completionPercentage: data.completion_percentage,
      updatedAt: data.updated_at,
      applicationType: data.application_type
    } : null
    
    return { project }
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Map snake_case to camelCase for frontend compatibility
    const projects = (data || []).map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.created_at,
      createdBy: project.created_by,
      createdByName: project.created_by_name,
      createdByRole: project.created_by_role,
      completionPercentage: project.completion_percentage,
      updatedAt: project.updated_at,
      applicationType: project.application_type
    }))
    
    return { projects }
  },

  getById: async (projectId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) throw error
    
    // Map snake_case to camelCase for frontend compatibility
    const project = data ? {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at,
      createdBy: data.created_by,
      createdByName: data.created_by_name,
      createdByRole: data.created_by_role,
      completionPercentage: data.completion_percentage,
      updatedAt: data.updated_at,
      applicationType: data.application_type
    } : null
    
    return { data: project }
  },

  update: async (projectId: string, updates: any) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error
    
    // Map snake_case to camelCase for frontend compatibility
    const project = data ? {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at,
      createdBy: data.created_by,
      createdByName: data.created_by_name,
      createdByRole: data.created_by_role,
      completionPercentage: data.completion_percentage,
      updatedAt: data.updated_at,
      applicationType: data.application_type
    } : null
    
    return { project }
  },

  delete: async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error
    return { success: true }
  }
}

// ============================================
// PROJECT INFORMATION API
// ============================================

export const projectInformationAPI = {
  get: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_information')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    // Transform snake_case to camelCase for frontend
    const projectInfo = data ? {
      vision: data.vision || '',
      purpose: data.purpose || '',
      objectives: data.objectives || '',
      projectScope: data.project_scope || '',
      functionalRequirements: data.functional_requirements || '',
      nonFunctionalRequirements: data.non_functional_requirements || '',
      integrationRequirements: data.integration_requirements || '',
      reportingRequirements: data.reporting_requirements || ''
    } : null

    return { projectInformation: projectInfo }
  },

  save: async (projectId: string, projectInfo: any) => {
    // Check if project information already exists
    const { data: existingData, error: checkError } = await supabase
      .from('project_information')
      .select('project_id')
      .eq('project_id', projectId)
      .single()
    
    // Record exists if we have data and no error, or if error is not "not found" (PGRST116)
    const recordExists = existingData !== null && (!checkError || checkError.code !== 'PGRST116')

    // Transform camelCase to snake_case for database
    const projectInfoData = {
      project_id: projectId,
      vision: projectInfo.vision || null,
      purpose: projectInfo.purpose || null,
      objectives: projectInfo.objectives || null,
      project_scope: projectInfo.projectScope || null,
      functional_requirements: projectInfo.functionalRequirements || null,
      non_functional_requirements: projectInfo.nonFunctionalRequirements || null,
      integration_requirements: projectInfo.integrationRequirements || null,
      reporting_requirements: projectInfo.reportingRequirements || null
    }

    let data, error

    if (recordExists) {
      // Update existing record
      const result = await supabase
        .from('project_information')
        .update(projectInfoData)
        .eq('project_id', projectId)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new record
      const result = await supabase
        .from('project_information')
        .insert(projectInfoData)
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) throw error
    return { projectInformation: data }
  }
}

// ============================================
// USER STORIES API
// ============================================

export const userStoriesAPI = {
  get: async (projectId: string) => {
    const { data, error } = await supabase
      .from('user_stories')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform snake_case to camelCase for frontend
    const transformedData = (data || []).map(story => ({
      id: story.id,
      title: story.title,
      userRole: story.user_role,
      description: story.description,
      acceptanceCriteria: story.acceptance_criteria,
      priority: story.priority,
      status: story.status,
      moduleId: story.module_id,
      projectId: story.project_id,
      createdAt: story.created_at,
      updatedAt: story.updated_at
    }))
    
    return { userStories: transformedData }
  },

  save: async (projectId: string, userStories: any[]) => {
    // Transform camelCase to snake_case for database
    const transformedStories = userStories.map(story => ({
      id: story.id,
      project_id: projectId,
      title: story.title,
      user_role: story.userRole || story.user_role,
      description: story.description,
      acceptance_criteria: story.acceptanceCriteria || story.acceptance_criteria,
      priority: story.priority,
      status: story.status,
      module_id: story.moduleId || story.module_id,
      created_at: story.createdAt || story.created_at,
      updated_at: story.updatedAt || story.updated_at
    }))

    // Use upsert to update existing records or insert new ones
    const { data, error } = await supabase
      .from('user_stories')
      .upsert(transformedStories, { onConflict: 'id' })
      .select()

    if (error) throw error
    
    // Transform snake_case back to camelCase for frontend
    const transformedData = (data || []).map(story => ({
      id: story.id,
      title: story.title,
      userRole: story.user_role,
      description: story.description,
      acceptanceCriteria: story.acceptance_criteria,
      priority: story.priority,
      status: story.status,
      moduleId: story.module_id,
      projectId: story.project_id,
      createdAt: story.created_at,
      updatedAt: story.updated_at
    }))
    
    return { userStories: transformedData }
  }
}

// ============================================
// MODULES API
// ============================================

export const modulesAPI = {
  get: async (projectId: string) => {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { modules: data || [] }
  },

  save: async (projectId: string, modules: any[]) => {
    const { data, error } = await supabase
      .from('modules')
      .upsert(
        modules.map(module => ({
          ...module,
          project_id: projectId
        })),
        { onConflict: 'id' }
      )
      .select()

    if (error) throw error
    return { modules: data || [] }
  }
}

// ============================================
// BUSINESS RULES API
// ============================================

export const businessRulesAPI = {
  get: async (projectId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/business-rules`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return { businessRules: null }
        }
        throw new Error('Failed to fetch business rules')
      }

      const result = await response.json()
      return { businessRules: result.businessRules }
    } catch (error) {
      console.error('Error fetching business rules:', error)
      return { businessRules: null }
    }
  },

  save: async (projectId: string, businessRules: any, method: 'POST' | 'PUT' = 'POST') => {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/business-rules`, {
      method,
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ businessRules })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to save business rules')
    }

    const result = await response.json()
    return { businessRules: result.businessRules }
  },

  update: async (projectId: string, businessRules: any) => {
    return businessRulesAPI.save(projectId, businessRules, 'PUT')
  },

  getByModule: async (projectId: string, moduleId: string) => {
    try {
      // First check for the dedicated business rules record
      const { data: rulesFeature, error: rulesError } = await supabase
        .from('features')
        .select('business_rules')
        .eq('project_id', projectId)
        .eq('module_id', moduleId)
        .eq('title', '_module_business_rules')
        .single()

      if (rulesFeature && rulesFeature.business_rules) {
        try {
          // Try to parse as JSON array
          const parsed = JSON.parse(rulesFeature.business_rules)
          if (Array.isArray(parsed)) {
            return { businessRules: parsed }
          }
        } catch {
          // If not JSON, treat as single rule
          return { businessRules: [rulesFeature.business_rules] }
        }
      }

      // Fallback: fetch all features for this module and extract business rules
      const { data, error } = await supabase
        .from('features')
        .select('business_rules')
        .eq('project_id', projectId)
        .eq('module_id', moduleId)
        .neq('title', '_module_business_rules') // Exclude the dedicated record

      if (error && error.code !== 'PGRST116') throw error
      
      // Extract unique business rules from features
      const rules = (data || [])
        .map((f: any) => f.business_rules)
        .filter((rule: string) => rule && rule.trim() !== '')
        .filter((rule: string, index: number, self: string[]) => self.indexOf(rule) === index) // Remove duplicates
      
      return { businessRules: rules }
    } catch (error) {
      console.error('Error fetching business rules by module:', error)
      return { businessRules: [] }
    }
  },

  saveByModule: async (projectId: string, moduleId: string, rules: string[]) => {
    // For now, we'll store the business rules as a JSON string in a single feature record
    // This is a temporary solution - ideally business rules should have their own table
    
    try {
      // First, try to find an existing "business rules" feature for this module
      const { data: existingFeatures, error: fetchError } = await supabase
        .from('features')
        .select('id')
        .eq('project_id', projectId)
        .eq('module_id', moduleId)
        .eq('title', '_module_business_rules')
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      const businessRulesJson = JSON.stringify(rules)

      if (existingFeatures) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('features')
          .update({
            business_rules: businessRulesJson,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingFeatures.id)

        if (updateError) throw updateError
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('features')
          .insert({
            project_id: projectId,
            module_id: moduleId,
            title: '_module_business_rules',
            description: 'Business rules for this module',
            business_rules: businessRulesJson,
            priority: 'High',
            status: 'Not Started'
          })

        if (insertError) throw insertError
      }

      return { success: true, businessRules: rules }
    } catch (error) {
      console.error('Error saving business rules by module:', error)
      throw error
    }
  }
}

// ============================================
// UI/UX API
// ============================================

export const uiuxAPI = {
  get: async (projectId: string) => {
    const { data, error } = await supabase
      .from('uiux_guidelines')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { guidelines: data?.guidelines || null }
  },

  save: async (projectId: string, guidelines: any) => {
    const { data, error } = await supabase
      .from('uiux_guidelines')
      .upsert({
        project_id: projectId,
        guidelines
      })
      .select()
      .single()

    if (error) throw error
    return { guidelines: data.guidelines }
  }
}

// ============================================
// ACTIONS API
// ============================================

export const actionsAPI = {
  get: async (projectId: string) => {
    const { data, error } = await supabase
      .from('actions_interactions')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { actions: data?.config || null }
  },

  save: async (projectId: string, actions: any) => {
    // Check if a record already exists for this project
    const { data: existingData, error: checkError } = await supabase
      .from('actions_interactions')
      .select('id')
      .eq('project_id', projectId)
      .single()

    let data, error

    if (existingData && !checkError) {
      // Update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('actions_interactions')
        .update({
          config: actions,
          apply_to_all_project: actions.applyToAllProjects || false,
          specific_modules: actions.specificModules || [],
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single()

      data = updateData
      error = updateError
    } else {
      // Insert new record
      const { data: insertData, error: insertError } = await supabase
        .from('actions_interactions')
        .insert({
          project_id: projectId,
          config: actions,
          apply_to_all_project: actions.applyToAllProjects || false,
          specific_modules: actions.specificModules || []
        })
        .select()
        .single()

      data = insertData
      error = insertError
    }

    if (error) throw error
    return { actions: data.config }
  }
}

// ============================================
// TECH STACK API
// ============================================

export const techStackAPI = {
  get: async (projectId: string) => {
    const { data, error } = await supabase
      .from('tech_stack')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { techStack: data?.tech_stack || null }
  },

  save: async (projectId: string, techStack: any) => {
    const { data, error } = await supabase
      .from('tech_stack')
      .upsert({
        project_id: projectId,
        tech_stack: techStack
      })
      .select()
      .single()

    if (error) throw error
    return { techStack: data.tech_stack }
  }
}

// ============================================
// DOCUMENTS API
// ============================================

export const documentsAPI = {
  get: async (projectId: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { documents: data?.documents || null }
  },

  save: async (projectId: string, documents: any) => {
    const { data, error } = await supabase
      .from('documents')
      .upsert({
        project_id: projectId,
        documents
      })
      .select()
      .single()

    if (error) throw error
    return { documents: data.documents }
  }
}

// ============================================
// PROMPTS API
// ============================================

export const promptsAPI = {
  get: async (projectId: string) => {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { prompts: data || [] }
  },

  generate: async (projectId: string, promptType: string, context: any) => {
    // For now, create a mock prompt until you add real AI
    const generatedPrompt = `Generated prompt for ${promptType}\nProject ID: ${projectId}\n\n[Replace this with real AI generation]`

    const { data, error } = await supabase
      .from('ai_prompts')
      .insert({
        project_id: projectId,
        prompt_type: promptType,
        generated_prompt: generatedPrompt,
        context: context || {}
      })
      .select()
      .single()

    if (error) throw error
    return { prompt: data }
  }
}

// ============================================
// FEATURES API
// ============================================

export const featuresAPI = {
  get: async (projectId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token')
      }

      console.log('🔍 Fetching features from:', `${API_BASE_URL}/api/projects/${projectId}/features`)
      
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/features`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('❌ Features API error:', response.status, response.statusText)
        throw new Error('Failed to fetch features')
      }

      const data = await response.json()
      console.log('✅ Features API response:', data)
      console.log('📊 Number of features received:', data.features?.length || 0)
      
      if (data.features && data.features.length > 0) {
        console.log('📝 Sample feature:', data.features[0])
      }
      
      return { features: data.features || [] }
    } catch (error) {
      console.error('Error fetching features:', error)
      return { features: [] }
    }
  },

  save: async (projectId: string, features: any[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token')
      }

      console.log('💾 Saving features to:', `${API_BASE_URL}/api/projects/${projectId}/features`)
      console.log('📊 Number of features to save:', features.length)
      if (features.length > 0) {
        console.log('📝 Sample feature being saved:', features[0])
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/features`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ features })
      })

      if (!response.ok) {
        console.error('❌ Features save error:', response.status, response.statusText)
        throw new Error('Failed to save features')
      }

      const data = await response.json()
      console.log('✅ Features saved successfully:', data)
      return { features: data.features || [] }
    } catch (error) {
      console.error('Error saving features:', error)
      throw error
    }
  },

  addSingle: async (projectId: string, feature: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token')
      }

      console.log('➕ Adding single feature to:', `${API_BASE_URL}/api/projects/${projectId}/features/single`)
      console.log('📝 Feature details:', feature)

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/features/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feature)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add feature' }))
        console.error('❌ Feature add error:', response.status, errorData)
        throw new Error(errorData.message || 'Failed to add feature')
      }

      const data = await response.json()
      console.log('✅ Feature added successfully:', data)
      return { feature: data.feature }
    } catch (error) {
      console.error('Error adding feature:', error)
      throw error
    }
  }
}

// ============================================
// VIBE ENGINEER PROMPTS API
// ============================================

export const vibePromptsAPI = {
  generate: async (
    projectId: string, 
    developmentType: DevelopmentType | string, 
    selectedModuleIds?: string[],
    selectedFeatureIds?: string[]
  ) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/prompts/generate-vibe-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        projectId,
        developmentType,
        selectedModuleIds: selectedModuleIds || [],
        selectedFeatureIds: selectedFeatureIds || []
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to generate Vibe prompt')
    }

    const result = await response.json()
    return result
  },

  // RAG API methods
  initializeRAG: async (projectId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/prompts/rag/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ projectId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to initialize RAG')
    }

    return await response.json()
  },

  queryRAG: async (projectId: string, question: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/prompts/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ projectId, question })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to query RAG')
    }

    const result = await response.json()
    return result.answer
  },

  checkRAGHealth: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/prompts/rag/health`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    if (!response.ok) return false
    const result = await response.json()
    return result.healthy
  },

  saveImplementation: async (promptId: string, implementationCode: string, developerNotes?: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}/implementation`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        implementationCode,
        developerNotes
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to save implementation')
    }

    const result = await response.json()
    return result
  },

  getAll: async (projectId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/vibe-prompts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch Vibe prompts')
    }

    const result = await response.json()
    return result
  },

  delete: async (promptId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete prompt')
    }

    const result = await response.json()
    return result
  }
}

// ============================================
// API CLIENT (for apiClient.get/post pattern)
// ============================================

export const apiClient = {
  get: async (url: string) => {
    const parts = url.split('/')
    const projectId = parts[2]
    const endpoint = parts[3]

    switch (endpoint) {
      case 'project-information':
        return projectInformationAPI.get(projectId)
      case 'user-stories':
        return userStoriesAPI.get(projectId)
      case 'modules':
        return modulesAPI.get(projectId)
      case 'features':
        return featuresAPI.get(projectId)
      case 'business-rules':
        return businessRulesAPI.get(projectId)
      case 'actions':
        return actionsAPI.get(projectId)
      case 'uiux':
        return uiuxAPI.get(projectId)
      case 'tech-stack':
        return techStackAPI.get(projectId)
      case 'documents':
        return documentsAPI.get(projectId)
      case 'prompts':
        return promptsAPI.get(projectId)
      default:
        if (!endpoint) return projectAPI.getById(projectId)
        return { data: null }
    }
  },

  post: async (url: string, data: any) => {
    const parts = url.split('/')
    const projectId = parts[2]
    const endpoint = parts[3]

    switch (endpoint) {
      case 'project-information':
        return projectInformationAPI.save(projectId, data)
      case 'user-stories':
        return userStoriesAPI.save(projectId, data.userStories)
      case 'modules':
        return modulesAPI.save(projectId, data.modules)
      case 'business-rules':
        return businessRulesAPI.save(projectId, data.businessRules)
      case 'actions':
        return actionsAPI.save(projectId, data.actions)
      case 'uiux':
        return uiuxAPI.save(projectId, data.guidelines)
      case 'tech-stack':
        return techStackAPI.save(projectId, data.techStack)
      case 'documents':
        return documentsAPI.save(projectId, data.documents)
      case 'features':
        return featuresAPI.save(projectId, data.features)
      default:
        return { data: null }
    }
  },

  put: async (url: string, data: any) => {
    const parts = url.split('/')
    const projectId = parts[2]
    const endpoint = parts[3]
    
    switch (endpoint) {
      case 'business-rules':
        // For PUT, we want to update existing business rules
        return businessRulesAPI.update(projectId, data.businessRules)
      default:
        return projectAPI.update(projectId, data)
    }
  },

  delete: async (url: string) => {
    const projectId = url.split('/')[2]
    return projectAPI.delete(projectId)
  }
}

