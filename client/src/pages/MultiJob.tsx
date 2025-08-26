import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Layers3, TrendingUp, Target, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import { formatDistanceToNow } from "date-fns";

export default function MultiJob() {
  const { toast } = useToast();
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: resumes = [] } = useQuery({
    queryKey: ['/api/resumes'],
  });

  const { data: jobDescriptions = [] } = useQuery({
    queryKey: ['/api/job-descriptions'],
  });

  const analyzeMutation = useMutation({
    mutationFn: async ({ resumeId, jobDescriptionIds }: { resumeId: string; jobDescriptionIds: string[] }) => {
      return await apiRequest('POST', '/api/multi-job-analysis', {
        resumeId,
        jobDescriptionIds,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setAnalysisResult(data);
      toast({
        title: "Analysis Complete",
        description: "Multi-job analysis completed successfully!",
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
        title: "Analysis Failed",
        description: "Failed to analyze multiple jobs",
        variant: "destructive",
      });
    },
  });

  const handleJobSelection = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobIds(prev => [...prev, jobId]);
    } else {
      setSelectedJobIds(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleAnalyze = () => {
    if (!selectedResumeId) {
      toast({
        title: "No Resume Selected",
        description: "Please select a resume to analyze",
        variant: "destructive",
      });
      return;
    }

    if (selectedJobIds.length < 2) {
      toast({
        title: "Not Enough Jobs",
        description: "Please select at least 2 job descriptions for comparison",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({
      resumeId: selectedResumeId,
      jobDescriptionIds: selectedJobIds,
    });
  };

  const selectedResume = resumes.find((r: any) => r.id === selectedResumeId);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Multi-Job Analysis</h2>
            <p className="text-muted-foreground">Analyze multiple job postings to create a master resume strategy</p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resume-select">Resume</Label>
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                      <SelectTrigger id="resume-select" data-testid="select-resume">
                        <SelectValue placeholder="Choose a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume: any) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {resume.fileName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedResume && (
                    <Card className="p-3 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Layers3 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{selectedResume.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedResume.fileType.toUpperCase()} • {(selectedResume.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Identify common keywords across jobs</p>
                  <p>• Find overlapping skill requirements</p>
                  <p>• Generate master resume strategy</p>
                  <p>• Provide job-specific insights</p>
                </div>

                <Button 
                  onClick={handleAnalyze}
                  disabled={!selectedResumeId || selectedJobIds.length < 2 || analyzeMutation.isPending}
                  className="w-full"
                  data-testid="button-analyze"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Analyze Jobs
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">
                  Selected: {selectedJobIds.length} job{selectedJobIds.length !== 1 ? 's' : ''} 
                  {selectedJobIds.length >= 2 && " (ready to analyze)"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Job Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Job Descriptions ({selectedJobIds.length} selected)</CardTitle>
                <Badge variant="outline">
                  {jobDescriptions.length} total jobs
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {jobDescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Layers3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Job Descriptions</h3>
                  <p className="text-muted-foreground mb-4">
                    You need to add job descriptions before performing multi-job analysis.
                  </p>
                  <Button onClick={() => window.location.href = '/tailor'} data-testid="button-add-jobs">
                    Add Job Descriptions
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {jobDescriptions.map((job: any) => (
                    <Card 
                      key={job.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedJobIds.includes(job.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'
                      }`}
                      onClick={() => handleJobSelection(job.id, !selectedJobIds.includes(job.id))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedJobIds.includes(job.id)}
                            onCheckedChange={(checked) => handleJobSelection(job.id, !!checked)}
                            data-testid={`checkbox-job-${job.id}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-foreground">{job.title}</h4>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            {job.company && (
                              <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {job.description.substring(0, 150)}...
                            </p>
                            
                            {/* Keywords preview */}
                            {job.extractedKeywords && job.extractedKeywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.extractedKeywords.slice(0, 5).map((keyword: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {job.extractedKeywords.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.extractedKeywords.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <>
              {/* Common Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Common Keywords Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">
                        Keywords found across multiple jobs:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.commonKeywords?.map((keyword: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="bg-chart-1/10 text-chart-1 border-chart-1/20"
                            data-testid={`common-keyword-${index}`}
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Master Resume Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle>Master Resume Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="prose max-w-none">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {analysisResult.masterOptimization || "AI analysis will provide strategic recommendations for optimizing your resume across multiple similar roles."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job-Specific Insights */}
              {analysisResult.jobSpecificInsights && analysisResult.jobSpecificInsights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Job-Specific Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.jobSpecificInsights.map((insight: any, index: number) => (
                        <Card key={index} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-foreground">{insight.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Match Score:</span>
                                <span className="text-sm font-semibold text-primary">
                                  {Math.round(insight.matchScore || 0)}%
                                </span>
                                <Progress value={insight.matchScore || 0} className="w-16 h-2" />
                              </div>
                            </div>
                            
                            {insight.uniqueKeywords && insight.uniqueKeywords.length > 0 && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Unique keywords for this role:</p>
                                <div className="flex flex-wrap gap-1">
                                  {insight.uniqueKeywords.map((keyword: string, keywordIndex: number) => (
                                    <Badge 
                                      key={keywordIndex} 
                                      variant="outline" 
                                      className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-xs"
                                    >
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Empty State Guidance */}
          {!analysisResult && resumes.length > 0 && jobDescriptions.length > 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Layers3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">Multi-Job Analysis</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Select a resume and multiple job descriptions to identify common requirements 
                  and create a master resume strategy.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                    Common keywords
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                    Unique requirements
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Optimization strategy
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
