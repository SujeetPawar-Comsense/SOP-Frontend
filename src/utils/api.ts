import { supabase } from './supabaseClient'

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    })

    if (error) throw error
    if (!data.user) throw new Error('User creation failed')

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        name,
        role
      })

    // Ignore duplicate key error (profile might already exist from trigger)
    if (profileError && profileError.code !== '23505') {
      throw profileError
    }

    return { user: data.user }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return {
      session: data.session,
      user: data.user
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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
}

export const projectAPI = {
  create: async (projectData: { name: string; description: string }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        created_by: user.id,
        created_by_name: user.user_metadata.name || user.email,
        created_by_role: user.user_metadata.role || 'vibe_engineer'
      })
      .select()
      .single()

    if (error) throw error
    return { project: data }
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { projects: data || [] }
  },

  getById: async (projectId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) throw error
    return { project: data }
  },

  update: async (projectId: string, updates: any) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error
    return { project: data }
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
// API CLIENT (for apiClient.get/post pattern)
// ============================================

export const apiClient = {
  get: async (url: string) => {
    const parts = url.split('/')
    const projectId = parts[2]
    const endpoint = parts[3]

    switch (endpoint) {
      case 'user-stories':
        return userStoriesAPI.get(projectId)
      case 'modules':
        return modulesAPI.get(projectId)
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
        // Features are handled similarly
        return { features: data.features }
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

