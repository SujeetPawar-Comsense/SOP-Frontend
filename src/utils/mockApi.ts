// ============================================
// MOCK API FOR FRONTEND DEVELOPMENT
// No backend required - all data stored in localStorage
// ============================================

// Configuration
const MOCK_DELAY = 300; // Simulate network delay in ms

// Helper to simulate API delay
const delay = (ms: number = MOCK_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// MOCK DATA STORAGE HELPERS
// ============================================

const getStorageData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorageData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ============================================
// MOCK USER & AUTH TYPES
// ============================================

export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: 'project_owner' | 'vibe_engineer';
  };
}

interface StoredUser extends MockUser {
  password: string;
}

export interface MockSession {
  access_token: string;
  user: MockUser;
}

// ============================================
// AUTHENTICATION API (MOCK)
// ============================================

export const authAPI = {
  signUp: async (email: string, password: string, name: string, role: 'project_owner' | 'vibe_engineer') => {
    await delay();
    
    const users = getStorageData<StoredUser[]>('mock_users', []);
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists with this email');
    }
    
    const user: MockUser = {
      id: `user_${Date.now()}`,
      email,
      user_metadata: { name, role }
    };
    
    users.push({ ...user, password });
    setStorageData('mock_users', users);
    
    return { user };
  },

  signIn: async (email: string, password: string) => {
    await delay();
    
    const users = getStorageData<StoredUser[]>('mock_users', []);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const mockUser: MockUser = {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata
    };
    
    const session: MockSession = {
      access_token: `mock_token_${Date.now()}`,
      user: mockUser
    };
    
    localStorage.setItem('auth_token', session.access_token);
    localStorage.setItem('current_user', JSON.stringify(mockUser));
    
    return { session, user: mockUser };
  },

  signOut: async () => {
    await delay(100);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  },

  getSession: async () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    
    if (!token || !userStr) {
      return null;
    }
    
    return {
      access_token: token,
      user: JSON.parse(userStr) as MockUser
    } as MockSession;
  },

  getCurrentUser: async () => {
    const userStr = localStorage.getItem('current_user');
    return userStr ? (JSON.parse(userStr) as MockUser) : null;
  },
};

// ============================================
// PROJECT API (MOCK)
// ============================================

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  completionPercentage: number;
  updatedAt: string;
}

export const projectAPI = {
  create: async (projectData: { name: string; description: string }) => {
    await delay();
    
    const user = await authAPI.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const projects = getStorageData<Project[]>('mock_projects', []);
    
    const project: Project = {
      id: `proj_${Date.now()}`,
      name: projectData.name,
      description: projectData.description,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.user_metadata.name,
      createdByRole: user.user_metadata.role,
      completionPercentage: 0,
      updatedAt: new Date().toISOString()
    };
    
    projects.push(project);
    setStorageData('mock_projects', projects);
    
    return { project };
  },

  getAll: async () => {
    await delay();
    
    const user = await authAPI.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const allProjects = getStorageData<Project[]>('mock_projects', []);
    
    // Filter projects: owners see their own, engineers see all
    const projects = user.user_metadata.role === 'project_owner'
      ? allProjects.filter(p => p.createdBy === user.id)
      : allProjects;
    
    return { projects };
  },

  getById: async (projectId: string) => {
    await delay();
    
    const projects = getStorageData<Project[]>('mock_projects', []);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) throw new Error('Project not found');
    
    return { project };
  },

  update: async (projectId: string, updates: Partial<Project>) => {
    await delay();
    
    const projects = getStorageData<Project[]>('mock_projects', []);
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index === -1) throw new Error('Project not found');
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    setStorageData('mock_projects', projects);
    
    return { project: projects[index] };
  },

  delete: async (projectId: string) => {
    await delay();
    
    const projects = getStorageData<Project[]>('mock_projects', []);
    const filtered = projects.filter(p => p.id !== projectId);
    
    setStorageData('mock_projects', filtered);
    
    return { success: true };
  },
};

// ============================================
// PROJECT DATA API (MOCK)
// ============================================

const getProjectDataKey = (projectId: string, type: string) => `mock_project_${projectId}_${type}`;

export const userStoriesAPI = {
  get: async (projectId: string) => {
    await delay();
    return { userStories: getStorageData(getProjectDataKey(projectId, 'userStories'), []) };
  },
  
  save: async (projectId: string, userStories: any[]) => {
    await delay();
    setStorageData(getProjectDataKey(projectId, 'userStories'), userStories);
    return { userStories };
  },
};

export const modulesAPI = {
  get: async (projectId: string) => {
    await delay();
    return { modules: getStorageData(getProjectDataKey(projectId, 'modules'), []) };
  },
  
  save: async (projectId: string, modules: any[]) => {
    await delay();
    setStorageData(getProjectDataKey(projectId, 'modules'), modules);
    return { modules };
  },
};

export const businessRulesAPI = {
  get: async (projectId: string) => {
    await delay();
    return { businessRules: getStorageData(getProjectDataKey(projectId, 'businessRules'), null) };
  },
  
  save: async (projectId: string, businessRules: any) => {
    await delay();
    setStorageData(getProjectDataKey(projectId, 'businessRules'), businessRules);
    return { businessRules };
  },
};

export const uiuxAPI = {
  get: async (projectId: string) => {
    await delay();
    return { guidelines: getStorageData(getProjectDataKey(projectId, 'uiux'), null) };
  },
  
  save: async (projectId: string, guidelines: any) => {
    await delay();
    setStorageData(getProjectDataKey(projectId, 'uiux'), guidelines);
    return { guidelines };
  },
};

export const actionsAPI = {
  get: async (projectId: string) => {
    await delay();
    return { actions: getStorageData(getProjectDataKey(projectId, 'actions'), []) };
  },
  
  save: async (projectId: string, actions: any[]) => {
    await delay();
    setStorageData(getProjectDataKey(projectId, 'actions'), actions);
    return { actions };
  },
};

export const techStackAPI = {
  get: async (projectId: string) => {
    await delay();
    return { techStack: getStorageData(getProjectDataKey(projectId, 'techStack'), null) };
  },
  
  save: async (projectId: string, techStack: any) => {
    await delay();
    setStorageData(getProjectDataKey(projectId, 'techStack'), techStack);
    return { techStack };
  },
};

export const documentsAPI = {
  get: async (projectId: string) => {
    await delay();
    return { documents: getStorageData(getProjectDataKey(projectId, 'documents'), null) };
  },
  
  save: async (projectId: string, documents: any) => {
    await delay();
    setStorageData(getProjectDataKey(projectId, 'documents'), documents);
    return { documents };
  },
};

// ============================================
// PROMPTS API (MOCK)
// ============================================

export const promptsAPI = {
  get: async (projectId: string) => {
    await delay();
    return { prompts: getStorageData(getProjectDataKey(projectId, 'prompts'), []) };
  },
  
  generate: async (projectId: string, promptType: string, context: any) => {
    await delay(1000); // Longer delay to simulate AI generation
    
    const prompt = {
      id: `prompt_${Date.now()}`,
      projectId,
      promptType,
      generatedPrompt: `Generated prompt for ${promptType}:\n\nProject context loaded...\n\n[This is a mock prompt. In production, this will be generated by AI based on your project data.]`,
      createdAt: new Date().toISOString()
    };
    
    const prompts = getStorageData<any[]>(getProjectDataKey(projectId, 'prompts'), []);
    prompts.unshift(prompt);
    setStorageData(getProjectDataKey(projectId, 'prompts'), prompts);
    
    return { prompt };
  },
};

// ============================================
// API CLIENT (for other components that use apiClient)
// ============================================

export const apiClient = {
  get: async (url: string) => {
    await delay();
    
    // Parse the URL and route to appropriate mock API
    if (url.includes('/projects/')) {
      const parts = url.split('/');
      const projectId = parts[2];
      const endpoint = parts[3];
      
      switch (endpoint) {
        case 'user-stories':
          return userStoriesAPI.get(projectId);
        case 'modules':
          return modulesAPI.get(projectId);
        case 'business-rules':
          return businessRulesAPI.get(projectId);
        case 'actions':
          return actionsAPI.get(projectId);
        case 'prompts':
          return promptsAPI.get(projectId);
        default:
          if (!endpoint) return projectAPI.getById(projectId);
          return { data: null };
      }
    }
    
    return { data: null };
  },
  
  post: async (url: string, data: any) => {
    await delay();
    
    if (url.includes('/projects/')) {
      const parts = url.split('/');
      const projectId = parts[2];
      const endpoint = parts[3];
      
      switch (endpoint) {
        case 'user-stories':
          return userStoriesAPI.save(projectId, data.userStories);
        case 'modules':
          return modulesAPI.save(projectId, data.modules);
        case 'business-rules':
          return businessRulesAPI.save(projectId, data.businessRules);
        case 'actions':
          return actionsAPI.save(projectId, data.actions);
        case 'features':
          return { features: data.features };
        default:
          return { data: null };
      }
    }
    
    return { data: null };
  },
  
  put: async (url: string, data: any) => {
    await delay();
    
    if (url.includes('/projects/')) {
      const projectId = url.split('/')[2];
      return projectAPI.update(projectId, data);
    }
    
    return { data: null };
  },
  
  delete: async (url: string) => {
    await delay();
    
    if (url.includes('/projects/')) {
      const projectId = url.split('/')[2];
      return projectAPI.delete(projectId);
    }
    
    return { success: true };
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Clear all mock data (useful for testing)
export const clearAllMockData = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('mock_') || key === 'auth_token' || key === 'current_user') {
      localStorage.removeItem(key);
    }
  });
};

// Seed with sample data
export const seedSampleData = async () => {
  try {
    // Create Project Owner account
    await authAPI.signUp('owner@example.com', 'password123', 'John Owner', 'project_owner');
    console.log('✅ Project Owner created: owner@example.com / password123');
    
    // Sign in as Project Owner and create a sample project
    await authAPI.signIn('owner@example.com', 'password123');
    await projectAPI.create({
      name: 'E-commerce Platform',
      description: 'A modern e-commerce platform with user management and product catalog'
    });
    await projectAPI.create({
      name: 'Mobile Banking App',
      description: 'Secure mobile banking application with real-time transactions'
    });
    console.log('✅ Sample projects created');
    
    // Sign out
    await authAPI.signOut();
    
    // Create Vibe Engineer account
    await authAPI.signUp('engineer@example.com', 'password123', 'Jane Engineer', 'vibe_engineer');
    console.log('✅ Vibe Engineer created: engineer@example.com / password123');
    
    // Sign out
    await authAPI.signOut();
    
    console.log('\n🎉 Sample data seeded successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('   Project Owner: owner@example.com / password123');
    console.log('   Vibe Engineer: engineer@example.com / password123');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

