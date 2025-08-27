import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface BeforeAfterComparisonProps {
  originalContent: string;
  tailoredContent: string;
  improvements: Array<{
    section?: string;
    before?: string;
    after?: string;
    reasoning: string;
  }>;
  onRegenerate?: () => void;
  onApplyChanges?: () => void;
}

export default function BeforeAfterComparison({ 
  originalContent, 
  tailoredContent, 
  improvements,
  onRegenerate,
  onApplyChanges 
}: BeforeAfterComparisonProps) {
  
  // Extract a sample section for before/after comparison
  const getSampleSection = (content: string) => {
    // Try to extract first paragraph or first meaningful section
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const sampleLine = lines.find(line => 
      line.length > 50 && 
      !line.toLowerCase().includes('name:') &&
      !line.toLowerCase().includes('email:') &&
      !line.toLowerCase().includes('phone:')
    );
    
    return sampleLine || lines[0] || content.substring(0, 200);
  };

  const originalSample = getSampleSection(originalContent);
  const tailoredSample = getSampleSection(tailoredContent);

  // Highlight keywords in the tailored content
  const highlightKeywords = (text: string) => {
    const keywords = ['React', 'JavaScript', 'TypeScript', 'API', 'MongoDB', 'Node.js', 'Python', 'AWS', 'Docker'];
    let highlightedText = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="bg-primary/20 px-1 rounded">${keyword}</span>`);
    });
    
    return highlightedText;
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-md">Before & After Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Before */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-muted-foreground">BEFORE</h5>
              <Badge variant="outline" className="text-xs">Original</Badge>
            </div>
            <Card className="border border-border">
              <CardContent className="p-3">
                <div className="max-h-96 overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    {originalContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* After */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-muted-foreground">AFTER</h5>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                AI-Enhanced
              </Badge>
            </div>
            <Card className="border-2 border-primary">
              <CardContent className="p-3">
                <div className="max-h-96 overflow-y-auto">
                  <div 
                    className="text-sm text-foreground"
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(tailoredContent)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Improvements */}
        {improvements.length > 0 && (
          <div className="mt-4 p-3 bg-background/50 rounded-lg">
            <h6 className="text-sm font-medium text-foreground mb-2">Key Improvements Made:</h6>
            <div className="space-y-1">
              {improvements.slice(0, 3).map((improvement, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-xs text-muted-foreground">
                    {improvement.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            AI-enhanced with relevant keywords and metrics
          </p>
          <div className="flex gap-2">
            {onRegenerate && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRegenerate}
                data-testid="button-regenerate"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerate
              </Button>
            )}
            {onApplyChanges && (
              <Button 
                size="sm"
                onClick={onApplyChanges}
                data-testid="button-apply-changes"
              >
                Apply Changes
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
