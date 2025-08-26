import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Upload() {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  const { data: resumes = [] } = useQuery({
    queryKey: ['/api/resumes'],
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Upload Resume</h2>
            <p className="text-muted-foreground">Upload and manage your resume files</p>
          </div>
        </header>

        <div className="p-6">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onFileUploaded={(resume) => setSelectedResumeId(resume.id)}
                selectedResumeId={selectedResumeId}
                resumes={resumes}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
