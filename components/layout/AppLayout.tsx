import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Briefcase,
  Settings,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Target,
  Building2,
  LogOut,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: Building2, label: 'Firm Dashboard', path: '/firm' },
  { icon: LayoutDashboard, label: 'Manager Dashboard', path: '/' },
  { icon: Briefcase, label: 'Advisor Dashboard', path: '/advisor-dashboard' },
  { icon: Wallet, label: 'My Clients', path: '/my-clients' },
  { icon: UserPlus, label: 'Prospect Routing', path: '/intake' },
  { icon: Users, label: 'Transfer Portal', path: '/clients' },
  { icon: Briefcase, label: 'Advisors', path: '/advisors' },
  { icon: Target, label: 'Match Results', path: '/matches' },
];

const adminItems = [
  { icon: Settings, label: 'Taxonomy', path: '/admin/taxonomy' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: FileText, label: 'Audit Log', path: '/audit' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profile, userRoles, signOut } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = () => {
    if (userRoles.includes('admin')) return 'Admin';
    if (userRoles.includes('manager')) return 'Manager';
    if (userRoles.includes('advisor')) return 'Advisor';
    if (userRoles.includes('recruiter')) return 'Recruiter';
    return 'User';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r bg-sidebar transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
                <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-sidebar-foreground">Valeo</h1>
                <p className="text-xs text-sidebar-foreground/60">Matchmaker</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary mx-auto">
              <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'nav-item',
                  isActive && 'active'
                )}
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          <Separator className="my-4 bg-sidebar-border" />

          <div className={cn('px-3 py-2', collapsed && 'hidden')}>
            <span className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
              Admin
            </span>
          </div>

          {adminItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'nav-item',
                  isActive && 'active'
                )}
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>

        {/* User */}
        <div className="border-t border-sidebar-border p-3">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                {profile?.full_name ? getInitials(profile.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {getRoleDisplay()}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={signOut}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="w-full mt-2 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              onClick={signOut}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
