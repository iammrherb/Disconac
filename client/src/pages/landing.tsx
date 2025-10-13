import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, BookOpen, Download, Shield, Network, Server } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://www.portnox.com/wp-content/uploads/2021/03/Portnotx_Logo_Color-768x193.png" 
                alt="Portnox" 
                className="h-8 w-auto"
              />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                Scoping Tool
              </span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
              className="bg-primary hover:bg-primary/90"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Professional <span className="font-semibold text-primary">Portnox</span> Scoping Tool
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Streamline your Network Access Control, TACACS+, and ZTNA assessments with our comprehensive scoping and deployment planning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90 text-base"
                data-testid="button-get-started"
              >
                Get Started
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-base"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to scope customer environments and create deployment plans with integrated documentation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Interactive Questionnaire</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive scoping framework covering Network Infrastructure, Authentication, TACACS+, and ZTNA requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-chart-2" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Auto-Generated Checklists</h3>
                <p className="text-sm text-muted-foreground">
                  Deployment prerequisites automatically created based on your scoping responses and customer environment.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-chart-4" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Documentation Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Smart linking to relevant Portnox documentation for configurations and explanations from docs.portnox.com.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-chart-3" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
                <p className="text-sm text-muted-foreground">
                  Organize and track all your customer profiles and scoping sessions in one centralized location.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-chart-5/10 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-chart-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Professional Exports</h3>
                <p className="text-sm text-muted-foreground">
                  Export comprehensive reports to PDF and Excel with Portnox branding and complete scoping data.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <Network className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Network Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed infrastructure evaluation covering switches, wireless controllers, and security solutions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-semibold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Sign in to create your first scoping session and streamline your Portnox deployments.
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-cta-signin"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://www.portnox.com/wp-content/uploads/2021/03/Portnotx_Logo_Color-768x193.png" 
                alt="Portnox" 
                className="h-6 w-auto opacity-80"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Portnox Scoping Tool. Version 2.1
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
