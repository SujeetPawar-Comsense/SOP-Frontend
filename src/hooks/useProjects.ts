import { useState, useEffect } from 'react';
import { projectAPI, userStoriesAPI, modulesAPI, businessRulesAPI, uiuxAPI, actionsAPI, techStackAPI, documentsAPI } from '../utils/mockApi';
import type { Project } from '../utils/mockApi';
import { toast } from 'sonner';

export type { Project };

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();
      setProjects(response.projects || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError(err.message || 'Failed to fetch projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (projectData: { name: string; description: string; completionPercentage?: number }) => {
    try {
      const response = await projectAPI.create({ name: projectData.name, description: projectData.description });
      await fetchProjects(); // Refresh the list
      toast.success('Project created successfully');
      return response.project;
    } catch (err: any) {
      console.error('Failed to create project:', err);
      toast.error(err.message || 'Failed to create project');
      throw err;
    }
  };

  const updateProject = async (projectId: string, updates: any) => {
    try {
      const response = await projectAPI.update(projectId, updates);
      await fetchProjects(); // Refresh the list
      toast.success('Project updated successfully');
      return response.project;
    } catch (err: any) {
      console.error('Failed to update project:', err);
      toast.error(err.message || 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await projectAPI.delete(projectId);
      await fetchProjects(); // Refresh the list
      toast.success('Project deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      toast.error(err.message || 'Failed to delete project');
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

// Hook for managing project data (user stories, modules, etc.)
export const useProjectData = (projectId: string | null) => {
  const [userStories, setUserStories] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [businessRules, setBusinessRules] = useState<any>(null);
  const [uiuxGuidelines, setUiuxGuidelines] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [techStack, setTechStack] = useState<any>(null);
  const [documents, setDocuments] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [projectId]);

  const loadProjectData = async (pid: string) => {
    try {
      setLoading(true);

      // Load all project data in parallel
      const [
        userStoriesRes,
        modulesRes,
        businessRulesRes,
        uiuxRes,
        actionsRes,
        techStackRes,
        documentsRes,
      ] = await Promise.all([
        userStoriesAPI.get(pid).catch(() => ({ userStories: [] })),
        modulesAPI.get(pid).catch(() => ({ modules: [] })),
        businessRulesAPI.get(pid).catch(() => ({ businessRules: null })),
        uiuxAPI.get(pid).catch(() => ({ guidelines: null })),
        actionsAPI.get(pid).catch(() => ({ actions: [] })),
        techStackAPI.get(pid).catch(() => ({ techStack: null })),
        documentsAPI.get(pid).catch(() => ({ documents: null })),
      ]);

      setUserStories(userStoriesRes.userStories || []);
      setModules(modulesRes.modules || []);
      setBusinessRules(businessRulesRes.businessRules);
      setUiuxGuidelines(uiuxRes.guidelines);
      setActions(actionsRes.actions || []);
      setTechStack(techStackRes.techStack);
      setDocuments(documentsRes.documents);
    } catch (err: any) {
      console.error('Failed to load project data:', err);
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const saveUserStories = async (stories: any[]) => {
    if (!projectId) return;
    try {
      await userStoriesAPI.save(projectId, stories);
      setUserStories(stories);
      toast.success('User stories saved');
    } catch (err: any) {
      console.error('Failed to save user stories:', err);
      toast.error('Failed to save user stories');
      throw err;
    }
  };

  const saveModules = async (modulesData: any[]) => {
    if (!projectId) return;
    try {
      await modulesAPI.save(projectId, modulesData);
      setModules(modulesData);
      toast.success('Modules saved');
    } catch (err: any) {
      console.error('Failed to save modules:', err);
      toast.error('Failed to save modules');
      throw err;
    }
  };

  const saveBusinessRules = async (rules: any) => {
    if (!projectId) return;
    try {
      await businessRulesAPI.save(projectId, rules);
      setBusinessRules(rules);
      toast.success('Business rules saved');
    } catch (err: any) {
      console.error('Failed to save business rules:', err);
      toast.error('Failed to save business rules');
      throw err;
    }
  };

  const saveUiuxGuidelines = async (guidelines: any) => {
    if (!projectId) return;
    try {
      await uiuxAPI.save(projectId, guidelines);
      setUiuxGuidelines(guidelines);
      toast.success('UI/UX guidelines saved');
    } catch (err: any) {
      console.error('Failed to save UI/UX guidelines:', err);
      toast.error('Failed to save UI/UX guidelines');
      throw err;
    }
  };

  const saveActions = async (actionsData: any[]) => {
    if (!projectId) return;
    try {
      await actionsAPI.save(projectId, actionsData);
      setActions(actionsData);
      toast.success('Actions saved');
    } catch (err: any) {
      console.error('Failed to save actions:', err);
      toast.error('Failed to save actions');
      throw err;
    }
  };

  const saveTechStack = async (techStackData: any) => {
    if (!projectId) return;
    try {
      await techStackAPI.save(projectId, techStackData);
      setTechStack(techStackData);
      toast.success('Technology stack saved');
    } catch (err: any) {
      console.error('Failed to save tech stack:', err);
      toast.error('Failed to save tech stack');
      throw err;
    }
  };

  const saveDocuments = async (documentsData: any) => {
    if (!projectId) return;
    try {
      await documentsAPI.save(projectId, documentsData);
      setDocuments(documentsData);
      toast.success('Documents saved');
    } catch (err: any) {
      console.error('Failed to save documents:', err);
      toast.error('Failed to save documents');
      throw err;
    }
  };

  return {
    userStories,
    modules,
    businessRules,
    uiuxGuidelines,
    actions,
    techStack,
    documents,
    loading,
    saveUserStories,
    saveModules,
    saveBusinessRules,
    saveUiuxGuidelines,
    saveActions,
    saveTechStack,
    saveDocuments,
    refresh: () => projectId && loadProjectData(projectId),
  };
};