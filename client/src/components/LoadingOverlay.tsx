import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useState, useEffect } from "react";

interface LoadingOverlayProps {
  onCancel?: () => void;
}

export default function LoadingOverlay({ onCancel }: LoadingOverlayProps) {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [keywordProgress, setKeywordProgress] = useState(0);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  useEffect(() => {
    // Simulate progress
    const timer1 = setTimeout(() => setAnalysisProgress(100), 1000);
    const timer2 = setTimeout(() => setKeywordProgress(87), 2000);
    const timer3 = setTimeout(() => setOptimizationProgress(45), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center" data-testid="loading-overlay">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wand2 className="text-primary text-2xl w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Tailoring Your Resume</h3>
            <p className="text-muted-foreground mb-6">AI is analyzing the job description and optimizing your resume...</p>
            
            {/* Progress Indicators */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={analysisProgress === 100 ? "text-foreground" : "text-muted-foreground"}>
                    Analyzing job requirements
                  </span>
                  <span className={analysisProgress === 100 ? "text-chart-1" : "text-muted-foreground"}>
                    {analysisProgress}%
                  </span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={keywordProgress > 0 ? "text-foreground" : "text-muted-foreground"}>
                    Matching keywords
                  </span>
                  <span className={keywordProgress > 0 ? "text-chart-1" : "text-muted-foreground"}>
                    {keywordProgress}%
                  </span>
                </div>
                <Progress value={keywordProgress} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={optimizationProgress > 0 ? "text-foreground" : "text-muted-foreground"}>
                    Optimizing content
                  </span>
                  <span className={optimizationProgress > 0 ? "text-chart-1" : "text-muted-foreground"}>
                    {optimizationProgress}%
                  </span>
                </div>
                <Progress value={optimizationProgress} className="h-2" />
              </div>
            </div>
            
            {onCancel && (
              <Button 
                variant="outline" 
                className="mt-6" 
                onClick={onCancel}
                data-testid="button-cancel-loading"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
