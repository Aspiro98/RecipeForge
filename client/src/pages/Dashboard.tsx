import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Upload, Briefcase, TrendingUp, Key, Plus, Bell, Download, Eye, GitBranch } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  // Fetch resumes
  const { data: resumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ['/api/resumes'],
  });

  // Fetch resume versions
  const { data: versions = [], isLoading: versionsLoading } = useQuery({
    queryKey: ['/api/resume-versions'],
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
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
              <p className="text-muted-foreground">Manage your resume versions and job applications</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
              </Button>
              <Button data-testid="button-new-resume">
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
                  <Button>Get Started</Button>
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
                              <Button variant="ghost" size="sm" data-testid={`button-download-${version.id}`}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`button-preview-${version.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`button-compare-${version.id}`}>
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
        </div>
      </main>

      {isAnalyzing && <LoadingOverlay />}
    </div>
  );
}
