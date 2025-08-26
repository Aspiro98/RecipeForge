import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import LoadingOverlay from "@/components/LoadingOverlay";
import KeywordAnalysis from "@/components/KeywordAnalysis";
import BeforeAfterComparison from "@/components/BeforeAfterComparison";

export default function Tailor() {
  const { toast } = useToast();
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [versionName, setVersionName] = useState("");
  const [tailoredVersion, setTailoredVersion] = useState<any>(null);

  // Get URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('resumeId');
    const jobDesc = urlParams.get('jobDescription');
    
    if (resumeId) setSelectedResumeId(resumeId);
    if (jobDesc) setJobDescription(decodeURIComponent(jobDesc));
  }, []);

  const { data: resumes = [] } = useQuery<any[]>({
    queryKey: ['/api/resumes'],
  });

  // Create job description mutation
  const createJobDescriptionMutation = useMutation({
    mutationFn: async (jobData: any) => {
      return await apiRequest('POST', '/api/job-descriptions', jobData);
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
        description: "Failed to analyze job description",
        variant: "destructive",
      });
    },
  });

  // Tailor resume mutation
  const tailorResumeMutation = useMutation({
    mutationFn: async ({ resumeId, jobDescriptionId, versionName }: any) => {
      return await apiRequest('POST', `/api/resumes/${resumeId}/tailor`, {
        jobDescriptionId,
        versionName,
      });
    },
    onSuccess: (data) => {
      setTailoredVersion(data);
      queryClient.invalidateQueries({ queryKey: ['/api/resume-versions'] });
      toast({
        title: "Success",
        description: "Resume tailored successfully!",
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
        description: "Failed to tailor resume",
        variant: "destructive",
      });
    },
  });

  const handleTailor = async () => {
    if (!selectedResumeId || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a resume and enter a job description",
        variant: "destructive",
      });
      return;
    }

    try {
      // First create the job description
      const jobDescriptionData = await createJobDescriptionMutation.mutateAsync({
        title: jobTitle || "Untitled Position",
        company,
        description: jobDescription,
      });

      // Then tailor the resume
      await tailorResumeMutation.mutateAsync({
        resumeId: selectedResumeId,
        jobDescriptionId: jobDescriptionData.id,
        versionName: versionName || `${jobTitle || 'Position'} - ${new Date().toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error in tailoring process:', error);
    }
  };

  const selectedResume = resumes.find((r: any) => r.id === selectedResumeId);
  const isLoading = createJobDescriptionMutation.isPending || tailorResumeMutation.isPending;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tailor Resume</h2>
            <p className="text-muted-foreground">Optimize your resume for specific job applications</p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Input Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="resume-select">Select Resume</Label>
                  <select
                    id="resume-select"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    data-testid="select-resume"
                  >
                    <option value="">Select a resume</option>
                    {resumes.map((resume: any) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.fileName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedResume && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Selected Resume</h4>
                    <p className="text-sm text-muted-foreground mb-2">{selectedResume.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(selectedResume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input
                      id="job-title"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      data-testid="input-job-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google"
                      data-testid="input-company"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="version-name">Version Name (Optional)</Label>
                  <Input
                    id="version-name"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="Auto-generated if empty"
                    data-testid="input-version-name"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[200px] resize-vertical"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                data-testid="textarea-job-description"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {jobDescription.length} characters
                </p>
                <Button 
                  onClick={handleTailor} 
                  disabled={isLoading || !selectedResumeId || !jobDescription.trim()}
                  data-testid="button-tailor"
                >
                  {isLoading ? "Tailoring..." : "Tailor Resume"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {tailoredVersion && (
            <>
              <Separator />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Tailoring Results</h3>
                  <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                    Processing Complete
                  </Badge>
                </div>

                <KeywordAnalysis 
                  atsScore={parseFloat(tailoredVersion.atsScore || '0')}
                  keywordMatches={tailoredVersion.keywordMatches || []}
                  improvements={tailoredVersion.improvements || []}
                />

                <BeforeAfterComparison 
                  originalContent={selectedResume?.originalContent || ''}
                  tailoredContent={tailoredVersion.tailoredContent}
                  improvements={tailoredVersion.improvements || []}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {isLoading && <LoadingOverlay />}
    </div>
  );
}
