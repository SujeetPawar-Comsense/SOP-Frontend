import { useState } from 'react';
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
  Gauge
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProjectDocumentCreatorProps {
  onBack: () => void;
  projectName?: string;
  userRole?: 'project_owner' | 'vibe_engineer';
  onGenerateComplete?: (projectId: string) => void;
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

export default function ProjectDocumentCreator({ onBack, projectName, userRole = 'project_owner', onGenerateComplete }: ProjectDocumentCreatorProps) {
  const [documentData, setDocumentData] = useState<Record<string, DocumentData>>({});
  const [isGenerating, setIsGenerating] = useState(false);

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

        {/* Main Content */}
        <Tabs defaultValue={isProjectOwner ? 'meeting' : 'architecture'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-primary/20">
            {isProjectOwner ? (
              <>
                <TabsTrigger value="meeting" className="data-[state=active]:bg-primary/20">
                  Meeting Documents
                  <Badge variant="secondary" className="ml-2">
                    {getSectionsByCategory('meeting').filter(s => 
                      documentData[s.id]?.file || documentData[s.id]?.text?.trim()
                    ).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="scope" className="data-[state=active]:bg-primary/20">
                  Scope & Requirements
                  <Badge variant="secondary" className="ml-2">
                    {getSectionsByCategory('scope').filter(s => 
                      documentData[s.id]?.file || documentData[s.id]?.text?.trim()
                    ).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="other" className="data-[state=active]:bg-primary/20">
                  Other Documents
                  <Badge variant="secondary" className="ml-2">
                    {getSectionsByCategory('other').filter(s => 
                      documentData[s.id]?.file || documentData[s.id]?.text?.trim()
                    ).length}
                  </Badge>
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="architecture" className="data-[state=active]:bg-primary/20">
                  Architecture & Design
                  <Badge variant="secondary" className="ml-2">
                    {getSectionsByCategory('architecture').filter(s => 
                      documentData[s.id]?.file || documentData[s.id]?.text?.trim()
                    ).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="technical" className="data-[state=active]:bg-primary/20">
                  Technical Specifications
                  <Badge variant="secondary" className="ml-2">
                    {getSectionsByCategory('technical').filter(s => 
                      documentData[s.id]?.file || documentData[s.id]?.text?.trim()
                    ).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="techOther" className="data-[state=active]:bg-primary/20">
                  Other Technical Docs
                  <Badge variant="secondary" className="ml-2">
                    {getSectionsByCategory('techOther').filter(s => 
                      documentData[s.id]?.file || documentData[s.id]?.text?.trim()
                    ).length}
                  </Badge>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {isProjectOwner ? (
            <>
              <TabsContent value="meeting" className="space-y-4">
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-4 pr-4">
                    {getSectionsByCategory('meeting').map(renderDocumentSection)}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="scope" className="space-y-4">
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-4 pr-4">
                    {getSectionsByCategory('scope').map(renderDocumentSection)}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="other" className="space-y-4">
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-4 pr-4">
                    {getSectionsByCategory('other').map(renderDocumentSection)}
                  </div>
                </ScrollArea>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="architecture" className="space-y-4">
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-4 pr-4">
                    {getSectionsByCategory('architecture').map(renderDocumentSection)}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-4 pr-4">
                    {getSectionsByCategory('technical').map(renderDocumentSection)}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="techOther" className="space-y-4">
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-4 pr-4">
                    {getSectionsByCategory('techOther').map(renderDocumentSection)}
                  </div>
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Generate Button */}
        <div className="fixed bottom-6 right-6 flex gap-3">
          <Button
            size="lg"
            onClick={handleGenerateDocument}
            disabled={isGenerating || getFilledCount() === 0}
            className="bg-primary hover:bg-primary/90 neon-glow"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </Button>
        </div>
      </div>
    </div>
  );
}
