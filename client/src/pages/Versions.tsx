import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Eye, GitBranch, FileText } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { formatDistanceToNow } from "date-fns";

export default function Versions() {
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['/api/resume-versions'],
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Version History</h2>
              <p className="text-muted-foreground">View and manage all your resume versions</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="px-3 py-2 border border-input rounded-md bg-background text-foreground">
                <option>All versions</option>
                <option>This week</option>
                <option>This month</option>
                <option>High ATS score</option>
              </select>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Resume Versions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {versions.length} version{versions.length !== 1 ? 's' : ''} total
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading versions...</p>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-2">No resume versions yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first tailored resume version by uploading a resume and job description.
                  </p>
                  <Button onClick={() => window.location.href = '/tailor'} data-testid="button-create-version">
                    Create First Version
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((version: any) => (
                    <Card key={version.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-foreground">
                                {version.versionName}
                              </h4>
                              <Badge 
                                variant={version.isActive ? "default" : "secondary"}
                                data-testid={`badge-status-${version.id}`}
                              >
                                {version.isActive ? "Active" : "Archived"}
                              </Badge>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Job Title</p>
                                <p className="font-medium text-foreground">{version.jobTitle}</p>
                                {version.company && (
                                  <p className="text-sm text-muted-foreground">{version.company}</p>
                                )}
                              </div>
                              
                              <div>
                                <p className="text-sm text-muted-foreground">ATS Score</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-semibold text-foreground">
                                    {version.atsScore ? Math.round(parseFloat(version.atsScore)) : 0}%
                                  </span>
                                  <Progress 
                                    value={version.atsScore ? parseFloat(version.atsScore) : 0}
                                    className="w-20 h-2"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="font-medium text-foreground">
                                  {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(version.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {/* Keywords */}
                            {version.keywordMatches && version.keywordMatches.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-2">Matched Keywords</p>
                                <div className="flex flex-wrap gap-1">
                                  {version.keywordMatches.slice(0, 8).map((keyword: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                  {version.keywordMatches.length > 8 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{version.keywordMatches.length - 8} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Improvements Summary */}
                            {version.improvements && version.improvements.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-2">Key Improvements</p>
                                <div className="text-sm text-foreground">
                                  {version.improvements.slice(0, 2).map((improvement: any, index: number) => (
                                    <div key={index} className="flex items-start gap-2 mb-1">
                                      <div className="w-1.5 h-1.5 bg-chart-1 rounded-full mt-2 flex-shrink-0"></div>
                                      <span>{improvement.reasoning}</span>
                                    </div>
                                  ))}
                                  {version.improvements.length > 2 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{version.improvements.length - 2} more improvements
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Download"
                              data-testid={`button-download-${version.id}`}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Preview"
                              data-testid={`button-preview-${version.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Compare versions"
                              data-testid={`button-compare-${version.id}`}
                            >
                              <GitBranch className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
