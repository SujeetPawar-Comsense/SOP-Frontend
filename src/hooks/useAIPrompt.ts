import { useState } from 'react';
import { aiPromptAPI } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export const useAIPrompt = (projectId: string) => {
  const [generating, setGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const generatePrompt = async (
    promptType: 'full-project' | 'user-story' | 'module' | 'feature',
    context?: any,
    provider: 'openai' | 'anthropic' = 'openai'
  ) => {
    try {
      setGenerating(true);
      const response = await aiPromptAPI.generate(projectId, promptType, context, provider);
      
      setLastPrompt(response.prompt);
      toast.success('AI prompt generated successfully');
      
      // Copy to clipboard automatically
      await navigator.clipboard.writeText(response.prompt);
      toast.success('Prompt copied to clipboard');
      
      return response.prompt;
    } catch (err: any) {
      console.error('Failed to generate AI prompt:', err);
      toast.error(err.message || 'Failed to generate AI prompt');
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  const getPromptHistory = async () => {
    try {
      const response = await aiPromptAPI.getHistory(projectId);
      return response.prompts || [];
    } catch (err: any) {
      console.error('Failed to get prompt history:', err);
      toast.error('Failed to load prompt history');
      return [];
    }
  };

  return {
    generating,
    lastPrompt,
    generatePrompt,
    getPromptHistory,
  };
};