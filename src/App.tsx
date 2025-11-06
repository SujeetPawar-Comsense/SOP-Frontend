import { useState, useEffect } from 'react'
import { toast } from 'sonner@2.0.3'
import { Toaster } from './components/ui/sonner'
import { Button } from './components/ui/button'
import { LogOut } from 'lucide-react'
import FuturisticBackground from './components/FuturisticBackground'
import RoleSelector, { UserRole } from './components/RoleSelector'
import ProjectSelector, { Project } from './components/ProjectSelector'
import ProjectLeadDashboard from './components/ProjectLeadDashboard'
import VibeEngineerDashboard from './components/VibeEngineerDashboard'
import OnboardingHub from './components/OnboardingHub'
import { AuthProvider } from './components/AuthProvider'
import { AppWithAuth } from './components/AppWithAuth'
import { useAuth } from './components/AuthProvider'
import { useProjects } from './hooks/useProjects'

function App() {
  const { user } = useAuth()
  const { projects, loading: projectsLoading, createProject, fetchProjects } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  // Get user role from user metadata
  const userRole: UserRole = user?.user_metadata?.role || null

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const handleProjectCreate = async (name: string, description: string) => {
    try {
      const newProject = await createProject({ name, description, completionPercentage: 0 })
      toast.success('Project created successfully!')
      setSelectedProject(newProject)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project')
    }
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
    fetchProjects()
  }

  // Show loading state
  if (!user) {
    return null // Auth will handle showing login
  }

  // If user hasn't selected a role yet (shouldn't happen with current flow, but good fallback)
  if (!userRole) {
    return (
      <div className="min-h-screen bg-background relative">
        <FuturisticBackground />
        <Toaster />
        <div className="relative z-10">
          <div className="text-center p-8">
            <h1 className="text-2xl mb-4">Please log out and sign up with a valid role</h1>
            <Button onClick={() => window.location.reload()}>
              <LogOut className="mr-2 h-4 w-4" />
              Reload
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Main app content
  return (
    <div className="min-h-screen bg-background relative">
      <FuturisticBackground />
      <Toaster />
      
      <div className="relative z-10">
        {!selectedProject ? (
          // Project selection view
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl mb-2 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Welcome, {user.user_metadata?.name || user.email}
              </h1>
              <p className="text-muted-foreground">
                Role: <span className="text-primary capitalize">{userRole.replace('_', ' ')}</span>
              </p>
            </div>

            <ProjectSelector
              projects={projects}
              onProjectSelect={handleProjectSelect}
              onProjectCreate={handleProjectCreate}
              currentRole={userRole}
              loading={projectsLoading}
            />
          </div>
        ) : (
          // Project dashboard view
          <div>
            <div className="border-b border-primary/20 bg-card/50 backdrop-blur-sm">
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-primary">{selectedProject.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleBackToProjects}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  Back to Projects
                </Button>
              </div>
            </div>

            {userRole === 'project_owner' && (
              <ProjectLeadDashboard 
                projectId={selectedProject.id}
                userRole={userRole}
              />
            )}

            {userRole === 'vibe_engineer' && (
              <VibeEngineerDashboard 
                projectId={selectedProject.id}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AppContent() {
  return (
    <AuthProvider>
      <AppWithAuth>
        <App />
      </AppWithAuth>
    </AuthProvider>
  )
}

export default AppContent