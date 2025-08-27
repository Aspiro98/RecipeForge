import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Upload, Briefcase, TrendingUp, Key, Plus, Bell, Download, Eye, GitBranch, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Modal states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<any>(null);

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/stats'],
  }) as { data: any, isLoading: boolean };

  // Fetch resumes
  const { data: resumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ['/api/resumes'],
  }) as { data: any[], isLoading: boolean };

  // Fetch resume versions
  const { data: versions = [], isLoading: versionsLoading } = useQuery({
    queryKey: ['/api/resume-versions'],
  }) as { data: any[], isLoading: boolean };

  // Fetch cover letters
  const { data: coverLetters = [], isLoading: coverLettersLoading, error: coverLettersError } = useQuery({
    queryKey: ['/api/cover-letters'],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch('/api/cover-letters', {
          credentials: 'include',
        });
        if (response.status === 401) {
          return [];
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching cover letters:', error);
        return [];
      }
    },
  }) as { data: any[], isLoading: boolean, error: any };

  // Fetch interview questions
  const { data: interviewQuestions = [], isLoading: interviewQuestionsLoading, error: interviewQuestionsError } = useQuery({
    queryKey: ['/api/interview-questions'],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch('/api/interview-questions', {
          credentials: 'include',
        });
        if (response.status === 401) {
          return [];
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching interview questions:', error);
        return [];
      }
    },
  }) as { data: any[], isLoading: boolean, error: any };

  // Debug logging
  console.log('Dashboard Data:', {
    coverLetters: coverLetters.length,
    coverLettersError,
    interviewQuestions: interviewQuestions.length,
    interviewQuestionsError,
    versions: versions.length
  });

  const handleAnalyze = async () => {
    if (!selectedResumeId || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a resume and enter a job description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    // Analysis will be handled in the Tailor page
    window.location.href = `/tailor?resumeId=${selectedResumeId}&jobDescription=${encodeURIComponent(jobDescription)}`;
  };

  const handleNewResume = () => {
    setLocation('/upload');
  };

  const handleCreateCoverLetter = () => {
    if (versions.length === 0) {
      toast({
        title: "No Resume Versions",
        description: "Please create a resume version first before generating a cover letter",
        variant: "destructive",
      });
      return;
    }
    setLocation('/cover-letter');
  };

  const handlePrepareForInterview = () => {
    if (versions.length === 0) {
      toast({
        title: "No Resume Versions",
        description: "Please create a resume version first before preparing for interviews",
        variant: "destructive",
      });
      return;
    }
    setLocation('/interview');
  };

  const handleViewAllCoverLetters = () => {
    setLocation('/cover-letter');
  };

  const handleViewAllInterviewQuestions = () => {
    setLocation('/interview');
  };

  const handleGetStarted = () => {
    setLocation('/upload');
  };

  const handleDownloadVersion = (version: any) => {
    const content = version.tailoredContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${version.versionName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Resume version downloaded successfully",
    });
  };

  const handleDownloadWordVersion = async (version: any) => {
    try {
      const response = await fetch(`/api/resume-versions/${version.id}/download-word`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download Word document');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${version.versionName || 'Tailored Resume'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded",
        description: "ATS-friendly Word document downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download Word document",
        variant: "destructive",
      });
    }
  };

  const handlePreviewVersion = (version: any) => {
    setSelectedVersion(version);
    setPreviewModalOpen(true);
  };

  const handleCompareVersion = (version: any) => {
    // Navigate to comparison page
    setLocation(`/versions?compare=${version.id}`);
  };

  const handleViewCoverLetter = (letter: any) => {
    setSelectedCoverLetter(letter);
    setCoverLetterModalOpen(true);
  };

  const handleDownloadCoverLetter = (letter: any) => {
    const content = letter.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${letter.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Cover letter downloaded successfully",
    });
  };

  // Recent activity mock data based on versions
  const recentActivities = versions.slice(0, 4).map((version: any) => ({
    id: version.id,
    type: 'tailor',
    title: `Resume tailored for ${version.jobTitle}`,
    time: version.createdAt,
    icon: FileText,
  }));

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
              <p className="text-muted-foreground">Manage your resume versions and job applications</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="relative">
                <Button variant="ghost" size="icon" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
              </div>
              <Button data-testid="button-new-resume" onClick={handleNewResume}>
                <Plus className="w-4 h-4 mr-2" />
                New Resume
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Resumes</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-resumes">
                      {stats?.totalResumes || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-chart-1">+{Math.floor(Math.random() * 3) + 1}</span> this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job Applications</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-job-applications">
                      {stats?.totalApplications || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-chart-1/10 rounded-full flex items-center justify-center">
                    <Briefcase className="text-chart-1" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-chart-1">+{Math.floor(Math.random() * 5) + 1}</span> this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ATS Score</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-ats-score">
                      {stats?.averageAtsScore || 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-chart-4/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-chart-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-chart-1">+5%</span> improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Versions</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-versions">
                      {stats?.totalVersions || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                    <Key className="text-chart-2" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Latest version
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Start */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Quick Start</CardTitle>
                    <Upload className="text-muted-foreground h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FileUpload 
                    onFileUploaded={(resume) => setSelectedResumeId(resume.id)}
                    selectedResumeId={selectedResumeId}
                    resumes={resumes}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Job Description
                    </label>
                    <Textarea
                      className="h-32 resize-none"
                      placeholder="Paste the job description here or provide a job posting URL..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      data-testid="textarea-job-description"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-muted-foreground">
                        Or paste a job posting URL for automatic extraction
                      </p>
                      <Button onClick={handleAnalyze} data-testid="button-analyze">
                        <FileText className="w-4 h-4 mr-2" />
                        Analyze & Tailor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm">View all</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  ) : (
                    recentActivities.map((activity: any) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <activity.icon className="text-primary text-xs w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resume Versions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Resume Versions</CardTitle>
                <div className="flex items-center gap-2">
                  <select className="px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm">
                    <option>All versions</option>
                    <option>This week</option>
                    <option>This month</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No resume versions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a resume and job description to create your first tailored version.
                  </p>
                  <Button onClick={handleGetStarted}>Get Started</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Version</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Job Title</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ATS Score</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {versions.map((version: any) => (
                        <tr key={version.id} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm font-medium text-foreground">{version.versionName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-foreground">{version.jobTitle}</span>
                            <p className="text-xs text-muted-foreground">{version.company}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                {version.atsScore ? Math.round(parseFloat(version.atsScore)) : 0}%
                              </span>
                              <Progress 
                                value={version.atsScore ? parseFloat(version.atsScore) : 0} 
                                className="w-16 h-2" 
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Download Word (ATS-friendly)"
                                data-testid={`button-download-word-${version.id}`}
                                onClick={() => handleDownloadWordVersion(version)}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Download Text"
                                data-testid={`button-download-${version.id}`}
                                onClick={() => handleDownloadVersion(version)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                data-testid={`button-preview-${version.id}`}
                                onClick={() => handlePreviewVersion(version)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                data-testid={`button-compare-${version.id}`}
                                onClick={() => handleCompareVersion(version)}
                              >
                                <GitBranch className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letters Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Cover Letters</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleViewAllCoverLetters}>View all</Button>
              </div>
            </CardHeader>
            <CardContent>
              {coverLetters.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No cover letters yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate cover letters for your resume versions.
                  </p>
                  <Button onClick={handleCreateCoverLetter}>Create Cover Letter</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {coverLetters.slice(0, 3).map((letter: any) => (
                    <div key={letter.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">Cover Letter</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(letter.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewCoverLetter(letter)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadCoverLetter(letter)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground line-clamp-3">
                        {letter.content.substring(0, 200)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview Prep Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Interview Preparation</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleViewAllInterviewQuestions}>View all</Button>
              </div>
            </CardHeader>
            <CardContent>
              {interviewQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No interview questions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate interview questions for your resume versions.
                  </p>
                  <Button onClick={handlePrepareForInterview}>Prepare for Interview</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviewQuestions.slice(0, 3).map((question: any) => (
                    <div key={question.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{question.category} Question</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {question.question}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Resume Version Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Resume Version Preview</span>
              <Button variant="ghost" size="sm" onClick={() => setPreviewModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedVersion.versionName}</h3>
                <Badge variant="outline">
                  {selectedVersion.atsScore ? Math.round(parseFloat(selectedVersion.atsScore)) : 0}% ATS Score
                </Badge>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">Job Details</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedVersion.jobTitle} at {selectedVersion.company}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Tailored Resume Content</h4>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    {selectedVersion.tailoredContent}
                  </pre>
                </div>
              </div>
              {selectedVersion.improvements && selectedVersion.improvements.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Key Improvements</h4>
                  <div className="space-y-2">
                    {selectedVersion.improvements.map((improvement: any, index: number) => (
                      <div key={index} className="text-sm p-2 bg-muted/20 rounded">
                        <p className="font-medium text-xs text-muted-foreground mb-1">
                          {improvement.section || 'General'}
                        </p>
                        <p className="text-xs mb-1">
                          <span className="text-red-500">Before:</span> {improvement.before?.substring(0, 100)}...
                        </p>
                        <p className="text-xs mb-1">
                          <span className="text-green-500">After:</span> {improvement.after?.substring(0, 100)}...
                        </p>
                        <p className="text-xs">{improvement.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cover Letter View Modal */}
      <Dialog open={coverLetterModalOpen} onOpenChange={setCoverLetterModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Cover Letter</span>
              <Button variant="ghost" size="sm" onClick={() => setCoverLetterModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedCoverLetter && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cover Letter</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(selectedCoverLetter.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Content</h4>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    {selectedCoverLetter.content}
                  </pre>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleDownloadCoverLetter(selectedCoverLetter)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isAnalyzing && <LoadingOverlay />}
    </div>
  );
}
