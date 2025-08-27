import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Eye, GitBranch, FileText, ChevronDown, ChevronUp, Trash2, FileText as FileTextIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Versions() {
  const { data: versions = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/resume-versions'],
  });
  const { toast } = useToast();
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [expandedImprovements, setExpandedImprovements] = useState<Set<string>>(new Set());

  const toggleVersionExpansion = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const toggleImprovementsExpansion = (versionId: string) => {
    const newExpanded = new Set(expandedImprovements);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedImprovements(newExpanded);
  };

  const handleDownload = (version: any) => {
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

  const handleDownloadWord = async (version: any) => {
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

  const handlePreview = (version: any) => {
    toggleVersionExpansion(version.id);
  };

  const handleDelete = async (versionId: string) => {
    if (confirm('Are you sure you want to delete this version?')) {
      try {
        const response = await fetch(`/api/resume-versions/${versionId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete version');
        }
        
        toast({
          title: "Deleted",
          description: "Version deleted successfully",
        });
        
        // Refresh the versions list
        window.location.reload();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete version",
          variant: "destructive",
        });
      }
    }
  };

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
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm text-muted-foreground">Key Improvements</p>
                                  {version.improvements.length > 2 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleImprovementsExpansion(version.id)}
                                      className="h-auto p-1 text-xs"
                                    >
                                      {expandedImprovements.has(version.id) ? (
                                        <>
                                          <ChevronUp className="w-3 h-3 mr-1" />
                                          Show Less
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="w-3 h-3 mr-1" />
                                          +{version.improvements.length - 2} more
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                                <div className="text-sm text-foreground">
                                  {version.improvements
                                    .slice(0, expandedImprovements.has(version.id) ? undefined : 2)
                                    .map((improvement: any, index: number) => (
                                      <div key={index} className="flex items-start gap-2 mb-2 p-2 bg-muted/30 rounded">
                                        <div className="w-1.5 h-1.5 bg-chart-1 rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="flex-1">
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
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Expanded Version Content */}
                            {expandedVersions.has(version.id) && (
                              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                                <h5 className="text-sm font-medium mb-2">Complete Tailored Resume</h5>
                                <div className="max-h-96 overflow-y-auto">
                                  <pre className="text-xs text-foreground whitespace-pre-wrap font-sans">
                                    {version.tailoredContent}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Download Word (ATS-friendly)"
                              onClick={() => handleDownloadWord(version)}
                              data-testid={`button-download-word-${version.id}`}
                            >
                              <FileTextIcon className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Download Text"
                              onClick={() => handleDownload(version)}
                              data-testid={`button-download-${version.id}`}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Preview"
                              onClick={() => handlePreview(version)}
                              data-testid={`button-preview-${version.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Delete"
                              onClick={() => handleDelete(version.id)}
                              data-testid={`button-delete-${version.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
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
