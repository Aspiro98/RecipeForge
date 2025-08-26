import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CloudUpload, FileText, Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { cn } from "@/lib/utils";
import type { Resume } from "@shared/schema";

interface FileUploadProps {
  onFileUploaded?: (resume: Resume) => void;
  selectedResumeId?: string;
  resumes?: Resume[];
  className?: string;
}

export default function FileUpload({ onFileUploaded, selectedResumeId, resumes = [], className }: FileUploadProps) {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      onFileUploaded?.(data);
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "Resume uploaded successfully!",
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
        title: "Upload Failed",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      });
    },
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) return;
    
    if (!file.type.includes('pdf') && !file.type.includes('wordprocessingml')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  return (
    <div className={cn("space-y-6", className)}>
      {/* File Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50 hover:bg-accent/50",
          selectedFile && "border-chart-1 bg-chart-1/5"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        data-testid="file-upload-area"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {selectedFile ? (
            <Check className="text-chart-1 text-2xl w-8 h-8" />
          ) : (
            <CloudUpload className="text-primary text-2xl w-8 h-8" />
          )}
        </div>
        
        {selectedFile ? (
          <div>
            <h4 className="text-lg font-medium text-foreground mb-2">File Selected</h4>
            <p className="text-foreground mb-2">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handleUpload} 
                disabled={uploadMutation.isPending}
                data-testid="button-upload-selected"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload File"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedFile(null)}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-lg font-medium text-foreground mb-2">Upload Your Resume</h4>
            <p className="text-muted-foreground mb-4">Drag and drop your resume file or click to browse</p>
            <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOCX files up to 10MB</p>
            <Button asChild data-testid="button-choose-file">
              <label className="cursor-pointer">
                Choose File
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  data-testid="input-file"
                />
              </label>
            </Button>
          </div>
        )}
      </div>

      {/* Existing Resumes */}
      {resumes.length > 0 && (
        <div>
          <Label htmlFor="existing-resume">Or select an existing resume:</Label>
          <Select value={selectedResumeId} onValueChange={(value) => onFileUploaded?.(resumes.find(r => r.id === value)!)}>
            <SelectTrigger id="existing-resume" data-testid="select-existing-resume">
              <SelectValue placeholder="Choose from uploaded resumes" />
            </SelectTrigger>
            <SelectContent>
              {resumes.map((resume) => (
                <SelectItem key={resume.id} value={resume.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{resume.fileName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({new Date(resume.createdAt!).toLocaleDateString()})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedResume && (
            <Card className="mt-4 p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{selectedResume.fileName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedResume.fileType.toUpperCase()} • {(selectedResume.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(selectedResume.createdAt!).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-8 h-8 bg-chart-1/10 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-chart-1" />
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
