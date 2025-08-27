import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  Upload, 
  Wand2, 
  History, 
  Mail, 
  Mic, 
  Layers3,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location === "/",
    },
    {
      name: "Upload Resume",
      href: "/upload",
      icon: Upload,
      current: location === "/upload",
    },
    {
      name: "Tailor Resume",
      href: "/tailor",
      icon: Wand2,
      current: location === "/tailor",
    },
    {
      name: "Version History",
      href: "/versions",
      icon: History,
      current: location === "/versions",
    },
    {
      name: "Cover Letter",
      href: "/cover-letter",
      icon: Mail,
      current: location === "/cover-letter",
    },
    {
      name: "Interview Prep",
      href: "/interview",
      icon: Mic,
      current: location === "/interview",
    },
    {
      name: "Multi-Job Analysis",
      href: "/multi-job",
      icon: Layers3,
      current: location === "/multi-job",
    },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Redirect to landing page after successful logout
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to landing page even if logout fails
      window.location.href = '/';
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  return (
    <aside className={cn("w-64 bg-sidebar-background border-r border-sidebar-border flex-shrink-0", className)}>
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <FileText className="text-sidebar-primary-foreground w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">TailorMyResume</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Tailoring</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.current ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sm font-medium",
                  item.current 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImageUrl || ''} alt={getUserDisplayName()} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="text-user-name">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-sidebar-foreground transition-colors"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
