import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight, Mic, RefreshCw, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";

export default function Interview() {
  const { toast } = useToast();
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const { data: versions = [] } = useQuery({
    queryKey: ['/api/resume-versions'],
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['/api/resume-versions', selectedVersionId, 'interview-questions'],
    enabled: !!selectedVersionId,
  });

  const generateMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return await apiRequest('POST', `/api/resume-versions/${versionId}/interview-prep`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/resume-versions', selectedVersionId, 'interview-questions'] 
      });
      toast({
        title: "Success",
        description: "Interview questions generated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate interview questions",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!selectedVersionId) {
      toast({
        title: "No Version Selected",
        description: "Please select a resume version first",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate(selectedVersionId);
  };

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const selectedVersion = versions.find((v: any) => v.id === selectedVersionId);

  const groupedQuestions = questions.reduce((acc: any, question: any) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {});

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'medium': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      case 'hard': return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'behavioral': return '🧠';
      case 'technical': return '💻';
      case 'situational': return '🎯';
      default: return '❓';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Interview Preparation</h2>
            <p className="text-muted-foreground">Practice with AI-generated questions tailored to your resume</p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Select Resume Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="version-select">Resume Version</Label>
                    <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
                      <SelectTrigger id="version-select" data-testid="select-version">
                        <SelectValue placeholder="Choose a resume version" />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((version: any) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.versionName} - {version.jobTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedVersion && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{selectedVersion.jobTitle}</h4>
                        <Badge variant="outline">
                          ATS: {Math.round(parseFloat(selectedVersion.atsScore || '0'))}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedVersion.company}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleGenerate}
                  disabled={!selectedVersionId || generateMutation.isPending}
                  className="w-full"
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Behavioral questions</p>
                  <p>• Technical questions</p>
                  <p>• Situational scenarios</p>
                  <p>• Sample answers included</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions */}
          {Object.keys(groupedQuestions).length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">Interview Questions</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{questions.length} questions</Badge>
                  <Badge variant="outline">{Object.keys(groupedQuestions).length} categories</Badge>
                </div>
              </div>

              {Object.entries(groupedQuestions).map(([category, categoryQuestions]: [string, any]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <span>{getCategoryIcon(category)}</span>
                      {category} Questions
                      <Badge variant="outline">{categoryQuestions.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryQuestions.map((question: any, index: number) => (
                        <Collapsible key={question.id}>
                          <Card className="border">
                            <CollapsibleTrigger 
                              className="w-full"
                              onClick={() => toggleQuestion(question.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3 text-left">
                                  <div className="flex-shrink-0 mt-1">
                                    {expandedQuestions.has(question.id) ? (
                                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                      <p className="font-medium text-foreground">
                                        {index + 1}. {question.question}
                                      </p>
                                      <Badge 
                                        variant="outline" 
                                        className={getDifficultyColor(question.difficulty)}
                                      >
                                        {question.difficulty}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="px-4 pb-4">
                                <div className="bg-muted/30 rounded-lg p-4 ml-7">
                                  <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-foreground">Sample Answer:</span>
                                  </div>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">
                                    {question.suggestedAnswer}
                                  </p>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {versions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Mic className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">No Resume Versions</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You need to create a tailored resume version before generating interview questions.
                </p>
                <Button onClick={() => window.location.href = '/tailor'} data-testid="button-create-version">
                  Create Resume Version
                </Button>
              </CardContent>
            </Card>
          )}

          {/* No Questions State */}
          {selectedVersionId && questions.length === 0 && !generateMutation.isPending && (
            <Card>
              <CardContent className="text-center py-12">
                <Mic className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">No Questions Generated Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Click "Generate Questions" to create personalized interview questions based on your resume and job requirements.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
