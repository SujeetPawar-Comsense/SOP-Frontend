import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Sparkles, 
  X,
  MessageSquare,
  FileCheck,
  Video,
  FileAudio,
  Mail,
  ClipboardList,
  Shield,
  Notebook,
  Blocks,
  Code,
  Database,
  Network,
  Lock,
  Gauge,
  Layout,
  CheckCircle,
  Save
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { apiClient } from '../utils/api';

interface ProjectDocumentCreatorProps {
  onBack: () => void;
  projectName?: string;
  userRole?: 'project_owner' | 'vibe_engineer';
  onGenerateComplete?: (projectId: string) => void;
  projectId?: string;
}

interface DocumentSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'meeting' | 'scope' | 'other' | 'architecture' | 'technical' | 'techOther';
  description: string;
}

interface DocumentData {
  file: File | null;
  text: string;
}

export default function ProjectDocumentCreator({ onBack, projectName, userRole = 'project_owner', onGenerateComplete, projectId }: ProjectDocumentCreatorProps) {
  const [documentData, setDocumentData] = useState<Record<string, DocumentData>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionsData, setSectionsData] = useState<any>({});
  const [unlockedSections, setUnlockedSections] = useState<Set<string>>(new Set(['project-information']));

  const brdDocumentSections: DocumentSection[] = [
    {
      id: 'mom',
      title: 'Minutes of Meeting (MOM)',
      icon: MessageSquare,
      category: 'meeting',
      description: 'Upload or paste meeting minutes and discussion points'
    },
    {
      id: 'understanding',
      title: 'Understanding Document',
      icon: FileCheck,
      category: 'meeting',
      description: 'Document capturing project understanding and context'
    },
    {
      id: 'recordings',
      title: 'Meeting Recordings',
      icon: Video,
      category: 'meeting',
      description: 'Upload audio/video recordings of meetings'
    },
    {
      id: 'transcripts',
      title: 'Meeting Transcripts',
      icon: FileAudio,
      category: 'meeting',
      description: 'Text transcripts from meeting recordings'
    },
    {
      id: 'scope',
      title: 'Scope Document / Proposal',
      icon: FileText,
      category: 'scope',
      description: 'Project scope definition and proposal documents'
    },
    {
      id: 'email-sample',
      title: 'Email with Sample Data',
      icon: Mail,
      category: 'scope',
      description: 'Email communications containing sample data or examples'
    },
    {
      id: 'email-queries',
      title: 'Email Notes – Queries / Answers',
      icon: Mail,
      category: 'scope',
      description: 'Email threads with Q&A and clarifications'
    },
    {
      id: 'questionnaire',
      title: 'Questionnaire',
      icon: ClipboardList,
      category: 'scope',
      description: 'Completed questionnaires and survey responses'
    },
    {
      id: 'requirement',
      title: 'Requirement Document',
      icon: FileCheck,
      category: 'scope',
      description: 'Formal requirement specifications and documentation'
    },
    {
      id: 'audit',
      title: 'CoP Audit / Assessment',
      icon: Shield,
      category: 'other',
      description: 'Compliance and audit assessment documents'
    },
    {
      id: 'notebook',
      title: 'Notebook Text / Images',
      icon: Notebook,
      category: 'other',
      description: 'Notes, sketches, and informal documentation'
    }
  ];

  const tddDocumentSections: DocumentSection[] = [
    {
      id: 'architecture',
      title: 'System Architecture Diagram',
      icon: Blocks,
      category: 'architecture',
      description: 'Upload system architecture diagrams and design patterns'
    },
    {
      id: 'api-specs',
      title: 'API Specifications',
      icon: Code,
      category: 'architecture',
      description: 'API documentation, endpoints, and integration specifications'
    },
    {
      id: 'database-schema',
      title: 'Database Schema / ERD',
      icon: Database,
      category: 'architecture',
      description: 'Database design, entity relationships, and schema documentation'
    },
    {
      id: 'tech-stack',
      title: 'Technology Stack Document',
      icon: Network,
      category: 'architecture',
      description: 'Chosen technologies, frameworks, libraries, and tools'
    },
    {
      id: 'integration',
      title: 'Integration Specifications',
      icon: Network,
      category: 'technical',
      description: 'Third-party integrations, microservices, and API connections'
    },
    {
      id: 'security-specs',
      title: 'Security Specifications',
      icon: Lock,
      category: 'technical',
      description: 'Security requirements, authentication, authorization protocols'
    },
    {
      id: 'performance',
      title: 'Performance Requirements',
      icon: Gauge,
      category: 'technical',
      description: 'Performance metrics, scalability, and optimization requirements'
    },
    {
      id: 'data-flow',
      title: 'Data Flow Diagrams',
      icon: FileText,
      category: 'technical',
      description: 'Data flow, processing logic, and transformation documentation'
    },
    {
      id: 'tech-constraints',
      title: 'Technical Constraints',
      icon: Shield,
      category: 'technical',
      description: 'Technical limitations, dependencies, and system constraints'
    },
    {
      id: 'deployment',
      title: 'Deployment Architecture',
      icon: Network,
      category: 'techOther',
      description: 'Deployment strategy, infrastructure, and DevOps configuration'
    },
    {
      id: 'tech-notes',
      title: 'Technical Notes / Research',
      icon: Notebook,
      category: 'techOther',
      description: 'Technical research, POCs, and architecture decision records'
    }
  ];

  const documentSections = userRole === 'project_owner' ? brdDocumentSections : tddDocumentSections;

  // Fetch all section data on component mount
  useEffect(() => {
    if (projectId) {
      fetchAllSectionData();
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchAllSectionData = async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching data for project:', projectId);

      // Define the sections to fetch
      const sections = [
        { key: 'projectInformation', endpoint: 'project-information' },
        { key: 'modules', endpoint: 'modules' },
        { key: 'userStories', endpoint: 'user-stories' },
        { key: 'features', endpoint: 'features' },
        { key: 'businessRules', endpoint: 'business-rules' },
        { key: 'uiux', endpoint: 'uiux' },
        { key: 'actions', endpoint: 'actions' },
        { key: 'techStack', endpoint: 'tech-stack' }
      ];

      const fetchedData: any = {};
      const newUnlockedSections = new Set(['project-information']);

      // Fetch all sections in parallel
      const promises = sections.map(async (section) => {
        try {
          const response = await apiClient.get(`/projects/${projectId}/${section.endpoint}`);
          return { key: section.key, data: response };
        } catch (error) {
          console.error(`Error fetching ${section.key}:`, error);
          return { key: section.key, data: null };
        }
      });

      const results = await Promise.all(promises);

      // Process results and determine which sections to unlock
      results.forEach(({ key, data }) => {
        if (data) {
          fetchedData[key] = data;
          
          // Check if section has data and unlock next section accordingly
          if (key === 'projectInformation' && data.projectInformation) {
            // If project information exists, unlock modules
            newUnlockedSections.add('modules');
          } else if (key === 'modules' && data.modules && data.modules.length > 0) {
            // If modules exist, unlock user stories and features
            newUnlockedSections.add('user-stories');
            newUnlockedSections.add('features');
          } else if ((key === 'userStories' && data.userStories && data.userStories.length > 0) ||
                     (key === 'features' && data.features && data.features.length > 0)) {
            // If user stories or features exist, unlock business rules
            newUnlockedSections.add('business-rules');
          } else if (key === 'businessRules' && data.businessRules) {
            // If business rules exist, unlock UI/UX
            newUnlockedSections.add('uiux');
          } else if (key === 'uiux' && (data.guidelines || data.uiuxGuidelines)) {
            // If UI/UX exists, unlock actions
            newUnlockedSections.add('actions');
          } else if (key === 'actions' && data.actions) {
            // If actions exist, unlock tech stack
            newUnlockedSections.add('tech-stack');
          }
        }
      });

      setSectionsData(fetchedData);
      setUnlockedSections(newUnlockedSections);

      // Show status message
      const dataCount = Object.values(fetchedData).filter(v => v).length;
      if (dataCount > 0) {
        toast.success(`Loaded ${dataCount} sections with existing data`);
      } else {
        toast.info('Starting fresh - fill in Project Overview to begin');
      }

    } catch (error) {
      console.error('Error fetching section data:', error);
      toast.error('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProjectInformation = async () => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    try {
      // Collect data from form fields
      const visionElement = document.getElementById('vision') as HTMLTextAreaElement;
      const purposeElement = document.getElementById('purpose') as HTMLTextAreaElement;
      const objectivesElement = document.getElementById('objectives') as HTMLTextAreaElement;
      const scopeElement = document.getElementById('scope') as HTMLTextAreaElement;

      const projectInfo = {
        vision: visionElement?.value || '',
        purpose: purposeElement?.value || '',
        objectives: objectivesElement?.value || '',
        projectScope: scopeElement?.value || ''
      };

      // Validate that at least some fields are filled
      if (!projectInfo.vision && !projectInfo.purpose && !projectInfo.objectives && !projectInfo.projectScope) {
        toast.error('Please fill in at least one field');
        return;
      }

      await apiClient.post(`/projects/${projectId}/project-information`, projectInfo);
      
      // After successful save, unlock the next section
      setUnlockedSections(prev => new Set([...prev, 'modules']));
      
      toast.success('Project information saved! Modules section is now unlocked.');
      
      // Refresh data
      await fetchAllSectionData();
    } catch (error) {
      console.error('Error saving project information:', error);
      toast.error('Failed to save project information');
    }
  };

  const handleFileUpload = (sectionId: string, file: File | null) => {
    setDocumentData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        file: file,
        text: prev[sectionId]?.text || ''
      }
    }));
    
    if (file) {
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const handleTextChange = (sectionId: string, text: string) => {
    setDocumentData(prev => ({
      ...prev,
      [sectionId]: {
        file: prev[sectionId]?.file || null,
        text: text
      }
    }));
  };

  const clearSection = (sectionId: string) => {
    setDocumentData(prev => {
      const newData = { ...prev };
      delete newData[sectionId];
      return newData;
    });
    toast.success('Section cleared');
  };

  const handleGenerateDocument = async () => {
    const filledSections = Object.keys(documentData).filter(
      key => documentData[key].file || documentData[key].text.trim()
    );

    if (filledSections.length === 0) {
      toast.error('Please add at least one document or text input');
      return;
    }

    if (!projectName) {
      toast.error('Project name is required');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Combine all text content
      const combinedText = Object.entries(documentData)
        .filter(([_, data]) => data.text?.trim())
        .map(([key, data]) => {
          const section = documentSections.find(s => s.id === key);
          return `=== ${section?.title || key} ===\n${data.text}`;
        })
        .join('\n\n');

      // For now, redirect back - in the future this would process files and call API
      const docType = userRole === 'project_owner' ? 'BRD' : 'TDD';
      
      if (!combinedText.trim()) {
        toast.error('Please add text content to at least one section');
        setIsGenerating(false);
        return;
      }

      toast.success(`${docType} content collected successfully! Processing...`);
      
      // Navigate back to project selector which will handle the upload
      setTimeout(() => {
        setIsGenerating(false);
        onBack();
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to process documents:', error);
      toast.error(error.message || 'Failed to process documents');
      setIsGenerating(false);
    }
  };

  const getSectionsByCategory = (category: string) => {
    return documentSections.filter(section => section.category === category);
  };

  const getFilledCount = () => {
    return Object.keys(documentData).filter(
      key => documentData[key]?.file || documentData[key]?.text?.trim()
    ).length;
  };

  const renderDocumentSection = (section: DocumentSection) => {
    const data = documentData[section.id];
    const hasContent = data?.file || data?.text?.trim();
    const Icon = section.icon;

    return (
      <Card key={section.id} className="border-primary/20 bg-card/80">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg neon-glow">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {section.description}
                </CardDescription>
              </div>
            </div>
            {hasContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSection(section.id)}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`file-${section.id}`} className="text-sm mb-2 block">
              Upload Document
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={`file-${section.id}`}
                type="file"
                onChange={(e) => handleFileUpload(section.id, e.target.files?.[0] || null)}
                className="flex-1"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.mp4,.mp3,.wav"
              />
              {data?.file && (
                <Badge variant="outline" className="text-primary border-primary/50">
                  {data.file.name}
                </Badge>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div>
            <Label htmlFor={`text-${section.id}`} className="text-sm mb-2 block">
              Paste Text Content
            </Label>
            <Textarea
              id={`text-${section.id}`}
              placeholder="Paste your document content here..."
              value={data?.text || ''}
              onChange={(e) => handleTextChange(section.id, e.target.value)}
              className="min-h-[100px] resize-y"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const isProjectOwner = userRole === 'project_owner';
  const docType = isProjectOwner ? 'BRD' : 'TDD';
  const docTypeFull = isProjectOwner ? 'Business Requirement Document' : 'Technical Design Document';

  // Section configuration for the flow
  const sectionFlow = [
    { id: 'project-information', title: 'Project Overview', icon: FileText },
    { id: 'modules', title: 'Modules', icon: Blocks },
    { id: 'user-stories', title: 'User Stories', icon: ClipboardList },
    { id: 'features', title: 'Features & Tasks', icon: Sparkles },
    { id: 'business-rules', title: 'Business Rules', icon: Shield },
    { id: 'uiux', title: 'UI/UX Guidelines', icon: Layout },
    { id: 'actions', title: 'Actions & Interactions', icon: Network },
    { id: 'tech-stack', title: 'Technology Stack', icon: Code }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 animate-pulse">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl mb-2 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                {docTypeFull}
              </h1>
              <p className="text-muted-foreground text-lg">
                {projectName 
                  ? `Creating ${docType} for ${projectName}` 
                  : `Upload documents and generate comprehensive ${docType}`
                }
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Documents Added</div>
              <div className="text-2xl bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                {getFilledCount()} / {documentSections.length}
              </div>
            </div>
          </div>
        </div>

        {/* Section Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Setup Progress</h3>
            <Badge variant="outline" className="text-primary border-primary/50">
              {unlockedSections.size - 1} / {sectionFlow.length - 1} sections unlocked
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {sectionFlow.map((section, index) => {
              const Icon = section.icon;
              const isUnlocked = unlockedSections.has(section.id);
              const hasData = sectionsData[section.id.replace('-', '')] && 
                            Object.keys(sectionsData[section.id.replace('-', '')]).length > 0;
              
              return (
                <div key={section.id} className="flex items-center flex-1">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      isUnlocked 
                        ? hasData 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {hasData ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isUnlocked ? (
                      <Icon className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  {index < sectionFlow.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      unlockedSections.has(sectionFlow[index + 1].id) 
                        ? 'bg-primary' 
                        : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
            {sectionFlow.map((section) => (
              <div key={section.id} className="text-center text-muted-foreground">
                {section.title}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Project Overview Section */}
        <div className="space-y-6">
          {/* Project Overview Card */}
          <Card className={`border-primary/20 bg-card/80 ${
            unlockedSections.has('project-information') ? '' : 'opacity-50 pointer-events-none'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Project Overview</CardTitle>
                    <CardDescription>Define your project's vision, purpose, and objectives</CardDescription>
                  </div>
                </div>
                {sectionsData.projectInformation?.projectInformation && (
                  <Badge variant="default" className="bg-primary">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vision">Vision</Label>
                <Textarea
                  id="vision"
                  placeholder="What is the long-term vision for this project?"
                  className="min-h-[80px]"
                  defaultValue={sectionsData.projectInformation?.projectInformation?.vision || ''}
                />
              </div>
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  placeholder="What is the main purpose of this project?"
                  className="min-h-[80px]"
                  defaultValue={sectionsData.projectInformation?.projectInformation?.purpose || ''}
                />
              </div>
              <div>
                <Label htmlFor="objectives">Objectives</Label>
                <Textarea
                  id="objectives"
                  placeholder="What are the key objectives to achieve?"
                  className="min-h-[80px]"
                  defaultValue={sectionsData.projectInformation?.projectInformation?.objectives || ''}
                />
              </div>
              <div>
                <Label htmlFor="scope">Project Scope</Label>
                <Textarea
                  id="scope"
                  placeholder="Define the boundaries and scope of the project"
                  className="min-h-[80px]"
                  defaultValue={sectionsData.projectInformation?.projectInformation?.projectScope || ''}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveProjectInformation}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4" />
                  Save and Continue
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Other Sections - Show as locked/unlocked cards */}
          <div className="grid gap-4">
            {sectionFlow.slice(1).map((section) => {
              const Icon = section.icon;
              const isUnlocked = unlockedSections.has(section.id);
              const sectionKey = section.id.replace('-', '');
              const hasData = sectionsData[sectionKey] && 
                            Object.keys(sectionsData[sectionKey]).length > 0;
              
              return (
                <Card 
                  key={section.id}
                  className={`border-primary/20 bg-card/80 transition-all ${
                    !isUnlocked ? 'opacity-50' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isUnlocked ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          {isUnlocked ? (
                            <Icon className="w-5 h-5 text-primary" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {isUnlocked 
                              ? hasData 
                                ? 'Data loaded - Click to view/edit'
                                : 'Ready to configure'
                              : 'Complete previous sections to unlock'
                            }
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasData && (
                          <Badge variant="default" className="bg-primary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Has Data
                          </Badge>
                        )}
                        {!isUnlocked && (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isUnlocked && (
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Navigate to the appropriate section in the main app
                          toast.info(`Navigate to ${section.title} section`);
                        }}
                      >
                        {hasData ? 'View & Edit' : 'Configure'} {section.title}
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
