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
    // Transform camelCase to snake_case for database
    const { data, error } = await supabase
      .from('project_information')
      .upsert({
        project_id: projectId,
        vision: projectInfo.vision || null,
        purpose: projectInfo.purpose || null,
        objectives: projectInfo.objectives || null,
        project_scope: projectInfo.projectScope || null,
        functional_requirements: projectInfo.functionalRequirements || null,
        non_functional_requirements: projectInfo.nonFunctionalRequirements || null,
        integration_requirements: projectInfo.integrationRequirements || null,
        reporting_requirements: projectInfo.reportingRequirements || null
      })
      .select()
      .single()

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
    return { userStories: data || [] }
  },

  save: async (projectId: string, userStories: any[]) => {
    // Delete existing
    await supabase
      .from('user_stories')
      .delete()
      .eq('project_id', projectId)

    // Insert new
    const { data, error } = await supabase
      .from('user_stories')
      .insert(
        userStories.map(story => ({
          ...story,
          project_id: projectId
        }))
      )
      .select()

    if (error) throw error
    return { userStories: data || [] }
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
    await supabase
      .from('modules')
      .delete()
      .eq('project_id', projectId)

    const { data, error } = await supabase
      .from('modules')
      .insert(
        modules.map(module => ({
          ...module,
          project_id: projectId
        }))
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
    const { data, error } = await supabase
      .from('business_rules')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { businessRules: data?.config || null }
  },

  save: async (projectId: string, businessRules: any) => {
    const { data, error } = await supabase
      .from('business_rules')
      .upsert({
        project_id: projectId,
        config: businessRules,
        apply_to_all_project: businessRules.applyToAllProjects || false,
        specific_modules: businessRules.specificModules || []
      })
      .select()
      .single()

    if (error) throw error
    return { businessRules: data.config }
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
    const { data, error } = await supabase
      .from('actions_interactions')
      .upsert({
        project_id: projectId,
        config: actions,
        apply_to_all_project: actions.applyToAllProjects || false,
        specific_modules: actions.specificModules || []
      })
      .select()
      .single()

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

const featuresAPI = {
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
  }
}

// ============================================
// VIBE ENGINEER PROMPTS API
// ============================================

export const vibePromptsAPI = {
  generate: async (projectId: string, developmentType: DevelopmentType, previousOutputs: string[] = []) => {
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
        previousOutputs
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to generate Vibe prompt')
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
    const projectId = url.split('/')[2]
    return projectAPI.update(projectId, data)
  },

  delete: async (url: string) => {
    const projectId = url.split('/')[2]
    return projectAPI.delete(projectId)
  }
}

