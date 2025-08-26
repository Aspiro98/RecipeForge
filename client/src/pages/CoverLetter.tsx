import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import { formatDistanceToNow } from "date-fns";

export default function CoverLetter() {
  const { toast } = useToast();
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [generatedLetter, setGeneratedLetter] = useState("");

  const { data: versions = [] } = useQuery({
    queryKey: ['/api/resume-versions'],
  });

  const { data: coverLetters = [] } = useQuery({
    queryKey: ['/api/resume-versions', selectedVersionId, 'cover-letters'],
    enabled: !!selectedVersionId,
  });

  const generateMutation = useMutation({
    mutationFn: async ({ versionId, tone }: { versionId: string; tone: string }) => {
      return await apiRequest('POST', `/api/resume-versions/${versionId}/cover-letter`, { tone });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setGeneratedLetter(data.content);
      queryClient.invalidateQueries({ 
        queryKey: ['/api/resume-versions', selectedVersionId, 'cover-letters'] 
      });
      toast({
        title: "Success",
        description: "Cover letter generated successfully!",
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
        description: "Failed to generate cover letter",
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

    generateMutation.mutate({ versionId: selectedVersionId, tone: selectedTone });
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Cover letter copied to clipboard",
      });
    } catch {
      toast({
        title: "Failed to Copy",
        description: "Please copy the content manually",
        variant: "destructive",
      });
    }
  };

  const selectedVersion = versions.find((v: any) => v.id === selectedVersionId);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Cover Letter Generator</h2>
            <p className="text-muted-foreground">Generate tailored cover letters for your applications</p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Generator Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Version</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="version-select">Select Version</Label>
                <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
                  <SelectTrigger id="version-select" data-testid="select-version">
                    <SelectValue placeholder="Choose a resume version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version: any) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.versionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedVersion && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground">{selectedVersion.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">{selectedVersion.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        ATS: {Math.round(parseFloat(selectedVersion.atsScore || '0'))}%
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tone & Style</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="tone-select">Tone</Label>
                <Select value={selectedTone} onValueChange={setSelectedTone}>
                  <SelectTrigger id="tone-select" data-testid="select-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Tone descriptions:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li><strong>Professional:</strong> Standard business tone</li>
                    <li><strong>Enthusiastic:</strong> Shows excitement and passion</li>
                    <li><strong>Casual:</strong> More relaxed and conversational</li>
                    <li><strong>Formal:</strong> Traditional and conservative</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate</CardTitle>
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
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">
                  AI will analyze your resume and job requirements to create a personalized cover letter.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content */}
          {generatedLetter && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Cover Letter</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(generatedLetter)}
                      data-testid="button-copy"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-download-letter">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-foreground font-mono text-sm">
                      {generatedLetter}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previously Generated Letters */}
          {coverLetters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Cover Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coverLetters.map((letter: any) => (
                    <Card key={letter.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {letter.tone}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(letter.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopy(letter.content)}
                              data-testid={`button-copy-${letter.id}`}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-download-${letter.id}`}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-muted/30 rounded p-3 max-h-40 overflow-y-auto">
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {letter.content.substring(0, 300)}...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {versions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">No Resume Versions</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You need to create a tailored resume version before generating cover letters.
                </p>
                <Button onClick={() => window.location.href = '/tailor'} data-testid="button-create-version">
                  Create Resume Version
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
