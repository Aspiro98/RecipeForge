import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Wand2, BarChart3, Clock, Target, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TailorMyResume</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Resume Tailoring</p>
              </div>
            </div>
            <Button onClick={handleLogin} data-testid="button-login">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Tailor Your Resume for
              <span className="text-primary block">Every Job Application</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Use AI to automatically optimize your resume for each job posting. Improve your ATS score, 
              match more keywords, and land more interviews.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={handleLogin} data-testid="button-hero-start">
                Start Tailoring
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Land Your Dream Job
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need to create compelling, 
              ATS-optimized resumes and prepare for interviews.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Tailoring</CardTitle>
                <CardDescription>
                  Upload your resume and job description - our AI automatically optimizes content 
                  for maximum ATS compatibility.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-chart-1" />
                </div>
                <CardTitle>ATS Score Analysis</CardTitle>
                <CardDescription>
                  Get real-time feedback on your ATS score with detailed keyword matching 
                  and improvement suggestions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-chart-2" />
                </div>
                <CardTitle>Version Control</CardTitle>
                <CardDescription>
                  Keep track of all your resume versions with side-by-side comparisons 
                  and change history.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-chart-4" />
                </div>
                <CardTitle>Cover Letter Generator</CardTitle>
                <CardDescription>
                  Generate tailored cover letters that complement your resume and 
                  highlight your relevant experience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-chart-5/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-chart-5" />
                </div>
                <CardTitle>Interview Preparation</CardTitle>
                <CardDescription>
                  Get AI-generated interview questions and sample answers based on 
                  your resume and the job requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Multi-Job Analysis</CardTitle>
                <CardDescription>
                  Analyze multiple job postings to create a master resume that 
                  works across similar roles.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of job seekers who are already using TailorMyResume 
                to land more interviews.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={handleLogin} data-testid="button-cta-start">
                Start Tailoring Your Resume
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Free to get started • No credit card required
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">TailorMyResume</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 TailorMyResume. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
