import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface KeywordAnalysisProps {
  atsScore: number;
  keywordMatches: string[];
  improvements: Array<{
    section?: string;
    before?: string;
    after?: string;
    reasoning: string;
  }>;
}

export default function KeywordAnalysis({ atsScore, keywordMatches, improvements }: KeywordAnalysisProps) {
  // Mock missing keywords for demonstration - in production these would come from the API
  const mockMissingKeywords = ['TypeScript', 'MongoDB', 'Docker', 'AWS', 'GraphQL'];
  const missingKeywords = mockMissingKeywords.filter(keyword => 
    !keywordMatches.some(match => 
      match.toLowerCase().includes(keyword.toLowerCase())
    )
  ).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Keyword Analysis */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-md">Keyword Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Match Score</span>
              <span className="text-sm font-semibold text-primary">{Math.round(atsScore)}%</span>
            </div>
            <Progress value={atsScore} className="h-2" />
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {keywordMatches.slice(0, 8).map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-xs"
                  data-testid={`keyword-match-${index}`}
                >
                  {keyword}
                </Badge>
              ))}
              {missingKeywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-xs"
                  data-testid={`keyword-missing-${index}`}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground space-x-4">
              <span>
                <span className="inline-block w-2 h-2 bg-chart-1 rounded-full mr-1"></span>
                Found in resume
              </span>
              <span>
                <span className="inline-block w-2 h-2 bg-chart-2 rounded-full mr-1"></span>
                Missing keywords
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Suggested Improvements */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-md">Suggested Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {improvements.length > 0 ? improvements.slice(0, 3).map((improvement, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-foreground">{improvement.reasoning}</p>
                  {improvement.section && (
                    <p className="text-xs text-muted-foreground">Section: {improvement.section}</p>
                  )}
                </div>
              </div>
            )) : (
              // Fallback suggestions if none provided
              <>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-foreground">Add missing keywords naturally to relevant sections</p>
                    <p className="text-xs text-muted-foreground">Improve keyword density for better ATS matching</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-chart-4 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-foreground">Quantify achievements with specific metrics</p>
                    <p className="text-xs text-muted-foreground">Add numbers and percentages where possible</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-chart-1 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-foreground">Align experience descriptions with job requirements</p>
                    <p className="text-xs text-muted-foreground">Emphasize relevant skills and technologies</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
