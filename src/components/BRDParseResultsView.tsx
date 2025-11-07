import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { CheckCircle2, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface BRDParseResultsViewProps {
  parsedBRD: any
  project: any
  onClose: () => void
}

export default function BRDParseResultsView({ parsedBRD, project, onClose }: BRDParseResultsViewProps) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]))
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set())

  const toggleModule = (idx: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx)
    } else {
      newExpanded.add(idx)
    }
    setExpandedModules(newExpanded)
  }

  const toggleStory = (key: string) => {
    const newExpanded = new Set(expandedStories)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedStories(newExpanded)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const { projectOverview, modules, businessRules } = parsedBRD

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="flex flex-col items-center justify-center py-4">
        <CheckCircle2 className="w-12 h-12 text-green-500 mb-3 animate-pulse" />
        <h3 className="text-2xl font-semibold mb-1 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          BRD Parsed Successfully!
        </h3>
        <p className="text-sm text-muted-foreground">Project created with complete structure</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-4 bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 rounded-lg text-center">
          <p className="text-3xl font-bold text-primary">{modules?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Modules</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-primary/20 border border-cyan-500/30 rounded-lg text-center">
          <p className="text-3xl font-bold text-cyan-400">
            {modules?.reduce((acc: number, m: any) => acc + (m.userStories?.length || 0), 0) || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">User Stories</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 rounded-lg text-center">
          <p className="text-3xl font-bold text-primary">
            {modules?.reduce((acc: number, m: any) => 
              acc + m.userStories?.reduce((sAcc: number, s: any) => sAcc + (s.features?.length || 0), 0), 0) || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Features</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-primary/20 border border-cyan-500/30 rounded-lg text-center">
          <p className="text-3xl font-bold text-cyan-400">{businessRules?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Business Rules</p>
        </div>
      </div>

      {/* Tabs for Different Sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-primary/20">
          <TabsTrigger value="overview">📋 Overview</TabsTrigger>
          <TabsTrigger value="modules">📦 Modules</TabsTrigger>
          <TabsTrigger value="stories">📝 All Stories</TabsTrigger>
          <TabsTrigger value="rules">⚖️ Rules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-primary mb-1">Project Name:</p>
                <p className="text-sm">{project.name}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-primary mb-1">Description:</p>
                <p className="text-sm text-muted-foreground">{projectOverview?.projectDescription}</p>
              </div>

              {projectOverview?.businessIntent?.vision && (
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">Vision:</p>
                  <p className="text-sm text-muted-foreground">{projectOverview.businessIntent.vision}</p>
                </div>
              )}

              {projectOverview?.businessIntent?.purpose && (
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">Purpose:</p>
                  <p className="text-sm text-muted-foreground">{projectOverview.businessIntent.purpose}</p>
                </div>
              )}

              {projectOverview?.businessIntent?.objectives?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-primary mb-2">Objectives:</p>
                  <ul className="space-y-2">
                    {projectOverview.businessIntent.objectives.map((obj: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {projectOverview?.businessIntent?.projectScope && (
                <div>
                  <p className="text-sm font-semibold text-primary mb-2">Project Scope:</p>
                  <div className="space-y-3">
                    {projectOverview.businessIntent.projectScope.inScope?.length > 0 && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-sm font-semibold text-green-400 mb-2">✅ In Scope ({projectOverview.businessIntent.projectScope.inScope.length} items)</p>
                        <ul className="space-y-1">
                          {projectOverview.businessIntent.projectScope.inScope.map((item: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {projectOverview.businessIntent.projectScope.outOfScope?.length > 0 && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm font-semibold text-red-400 mb-2">❌ Out of Scope ({projectOverview.businessIntent.projectScope.outOfScope.length} items)</p>
                        <ul className="space-y-1">
                          {projectOverview.businessIntent.projectScope.outOfScope.map((item: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-red-400 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {projectOverview?.requirements && (
                <div className="space-y-4 pt-4 border-t border-primary/20">
                  <p className="text-sm font-semibold text-primary">Requirements:</p>
                  
                  {projectOverview.requirements.functional?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-cyan-400 mb-2">Functional ({projectOverview.requirements.functional.length}):</p>
                      <ul className="space-y-1 ml-4">
                        {projectOverview.requirements.functional.map((req: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {projectOverview.requirements.nonFunctional?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-cyan-400 mb-2">Non-Functional ({projectOverview.requirements.nonFunctional.length}):</p>
                      <ul className="space-y-1 ml-4">
                        {projectOverview.requirements.nonFunctional.map((req: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {projectOverview.requirements.integration?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-cyan-400 mb-2">Integration ({projectOverview.requirements.integration.length}):</p>
                      <ul className="space-y-1 ml-4">
                        {projectOverview.requirements.integration.map((req: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {projectOverview.requirements.reporting?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-cyan-400 mb-2">Reporting ({projectOverview.requirements.reporting.length}):</p>
                      <ul className="space-y-1 ml-4">
                        {projectOverview.requirements.reporting.map((req: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-3">
          {modules?.map((module: any, moduleIdx: number) => (
            <Card key={moduleIdx} className="border-primary/20">
              <CardHeader className="cursor-pointer hover:bg-primary/5" onClick={() => toggleModule(moduleIdx)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base text-primary flex items-center gap-2">
                      {moduleIdx + 1}. {module.moduleName}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {module.userStories?.length || 0} stories
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">{module.moduleDescription}</CardDescription>
                  </div>
                  {expandedModules.has(moduleIdx) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              {expandedModules.has(moduleIdx) && (
                <CardContent className="space-y-3 pt-0">
                  {module.userStories?.map((story: any, storyIdx: number) => {
                    const storyKey = `${moduleIdx}-${storyIdx}`
                    const isStoryExpanded = expandedStories.has(storyKey)

                    return (
                      <div key={storyIdx} className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                        <div 
                          className="cursor-pointer hover:bg-cyan-500/10 p-2 -m-2 rounded"
                          onClick={() => toggleStory(storyKey)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                                📝 {story.title}
                                <Badge variant="secondary" className="text-xs">
                                  {story.priority}
                                </Badge>
                              </p>
                              <p className="text-xs text-muted-foreground italic mt-1">{story.userStory}</p>
                            </div>
                            {isStoryExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        {isStoryExpanded && (
                          <div className="mt-3 space-y-3">
                            {/* Acceptance Criteria */}
                            {story.acceptanceCriteria?.length > 0 && (
                              <div className="pl-4 border-l-2 border-cyan-500/30">
                                <p className="text-xs font-semibold text-cyan-400 mb-1">Acceptance Criteria:</p>
                                <ul className="space-y-1">
                                  {story.acceptanceCriteria.map((criteria: string, i: number) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <span className="text-cyan-400 mt-0.5">✓</span>
                                      <span>{criteria}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Features */}
                            {story.features?.length > 0 && (
                              <div className="pl-4 border-l-2 border-primary/30">
                                <p className="text-xs font-semibold text-primary mb-2">Features ({story.features.length}):</p>
                                <div className="space-y-2">
                                  {story.features.map((feature: any, fIdx: number) => (
                                    <div key={fIdx} className="p-2 bg-black/20 border border-primary/20 rounded">
                                      <p className="text-xs font-semibold text-primary flex items-center gap-2">
                                        🔧 {feature.featureName}
                                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                                          {feature.priority}
                                        </Badge>
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">{feature.taskDescription}</p>
                                      
                                      {feature.acceptanceCriteria?.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-[10px] font-semibold text-cyan-400 mb-1">Acceptance Criteria:</p>
                                          <ul className="space-y-0.5">
                                            {feature.acceptanceCriteria.map((criteria: string, i: number) => (
                                              <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                                                <span className="text-cyan-400">•</span>
                                                <span>{criteria}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* All Stories Tab */}
        <TabsContent value="stories" className="space-y-2 max-h-[500px] overflow-y-auto">
          {modules?.map((module: any, mIdx: number) =>
            module.userStories?.map((story: any, sIdx: number) => (
              <Card key={`${mIdx}-${sIdx}`} className="border-cyan-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm text-cyan-400">{story.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">Module: {module.moduleName}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">{story.priority}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground italic">{story.userStory}</p>
                  <div>
                    <p className="text-xs font-semibold text-primary">Features: {story.features?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      {story.features?.map((f: any) => f.featureName).join(', ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Business Rules Tab */}
        <TabsContent value="rules" className="space-y-2 max-h-[500px] overflow-y-auto">
          {businessRules?.map((rule: any, idx: number) => (
            <Card key={idx} className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm text-primary flex items-center gap-2">
                  {idx + 1}. {rule.ruleName}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(rule.ruleDescription, rule.ruleName)}
                    className="ml-auto"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{rule.ruleDescription}</p>
                {rule.applicableTo?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-cyan-400 mb-1">Applicable To:</p>
                    <div className="flex flex-wrap gap-1">
                      {rule.applicableTo.map((app: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {app}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <div className="sticky bottom-0 bg-gradient-to-t from-card to-transparent pt-6 pb-2">
        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 neon-glow"
          size="lg"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Go to Project Dashboard
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          All {modules?.length || 0} modules, {modules?.reduce((a: number, m: any) => a + (m.userStories?.length || 0), 0) || 0} user stories, 
          and {modules?.reduce((a: number, m: any) => a + m.userStories?.reduce((sa: number, s: any) => sa + (s.features?.length || 0), 0), 0) || 0} features 
          have been saved to your project
        </p>
      </div>
    </div>
  )
}

