import React, { useState } from 'react';
import {
  Calendar,
  Monitor,
  DoorOpen,
  Bell,
  Menu,
  X,
  ChevronLeft,
  History,
  Settings,
  LogOut,
  ChartColumn,
  User2,
  Edit,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetMe } from '@/modules/user/hooks/user.hook';
import { useLogout } from '@/modules/auth/api/auth.api';
import LoadingOverlay from '@/components/ui/loadingOverlay';
import { useQueryClient } from '@tanstack/react-query';
import { ChangePasswordModal } from '@/modules/user/components/changePasswordModal';

const navigationUser = [{ name: 'Calendar', href: '/', icon: Calendar }];
const navigationAdmin = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartColumn },
  { name: 'Calendar', href: '/', icon: Calendar },
  { name: 'Rooms', href: '/rooms', icon: DoorOpen },
  { name: 'Inventory', href: '/equipments', icon: Monitor },
  { name: 'Users', href: '/users', icon: User2 },
];

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openChangPass, setOpenChangePass] = React.useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const { data } = useGetMe();
  const { mutate, isPending } = useLogout();

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        queryClient.clear();
        navigate('/login', {
          replace: true,
        });
      },
    });
  };

  const navigation = data?.data.role === 'Admin' ? navigationAdmin : navigationUser;
  const isAdmin = data?.data.role === 'Admin';
  const fullNameSplit = data?.data?.fullName?.split(' ');
  return (
    <div className="min-h-screen bg-background">
      {isPending && <LoadingOverlay />}
      {openChangPass && (
        <ChangePasswordModal open={openChangPass} onOpenChange={() => setOpenChangePass(false)} />
      )}
      <header
        id="header-layout"
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 px-4 flex items-center justify-between shadow-soft"
      >
        {isAdmin && (
          <Button
            name="toggle-menu"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <span id="header-title" className="font-semibold text-foreground ">
          Infodation Meeting
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              name="toggle-dropdown"
              className={cn(
                'w-fit h-auto py-2',
                sidebarOpen ? 'justify-start px-3' : 'justify-center px-0',
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {fullNameSplit?.[fullNameSplit.length - 1]?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 text-left ">
                <p
                  id="header-username"
                  className="text-sm font-medium text-foreground truncate max-w-[150px]"
                >
                  {data?.data?.fullName}
                </p>
                <p id="header-use-role" className="text-xs text-muted-foreground">
                  {data?.data?.role}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card">
            <DropdownMenuItem
              id="button-change-pass"
              onClick={() => setOpenChangePass(true)}
              className=""
            >
              <Edit className="mr-2 h-4 w-4" />
              Change password
            </DropdownMenuItem>
            <DropdownMenuItem
              id="button-logout"
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div>
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px]
                  bg-card border-r border-border shadow-elevated
                  flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-border">
                <span id="sidebar-title" className="font-semibold text-lg text-foreground">
                  Infodation Meeting
                </span>
                <Button
                  id="button-close-sidebar"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="p-4 flex flex-col  flex-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}
                <Button
                  id="mobile-sidebar-logout"
                  onClick={handleLogout}
                  className="mt-auto flex items-center justify-start gap-2
                 bg-white shadow-none text-red-500 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </nav>
            </aside>
          </>
        )}
      </div>
      {isAdmin && (
        <aside
          className={cn(
            'hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-card border-r border-border transition-all duration-300 shadow-soft',
            sidebarOpen ? 'w-[260px]' : 'w-[72px]',
          )}
        >
          <div
            className={cn(
              'h-16 flex items-center border-b border-border px-4',
              sidebarOpen ? 'justify-between' : 'justify-center',
            )}
          >
            {sidebarOpen && (
              <div id="" className="font-semibold text-lg text-foreground">
                Infodation Meeting
              </div>
            )}
            <Button
              variant="ghost"
              id="toggle-expand-sidebar"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              <ChevronLeft
                className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')}
              />
            </Button>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    sidebarOpen ? '' : 'justify-center',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          <div className={cn('p-3 border-t border-border', !sidebarOpen && 'px-2')}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full h-auto py-2',
                    sidebarOpen ? 'justify-start px-3' : 'justify-center px-0',
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {fullNameSplit?.[fullNameSplit.length - 1]?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <div className="ml-3 text-left ">
                      <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                        {data?.data?.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">{data?.data?.role}</p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuItem
                  id="sidebar-button-change-pass"
                  onClick={() => setOpenChangePass(true)}
                  className=""
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Change password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
      )}

      <main
        className={cn(
          'min-h-screen transition-all duration-300 pt-16 lg:pt-0',
          isAdmin && (sidebarOpen ? 'lg:pl-[260px]' : 'lg:pl-[72px]'),
        )}
      >
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          {isAdmin ? (
            <div className=""></div>
          ) : (
            <div id="" className="font-semibold text-foreground">
              Infodation Meeting
            </div>
          )}

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className=""></div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    id="sidebar-logout"
                    className={cn(
                      'w-full h-auto py-2',
                      sidebarOpen ? 'justify-start px-3' : 'justify-center px-0',
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {fullNameSplit?.[fullNameSplit.length - 1]?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 text-left ">
                      <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                        {data?.data?.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">{data?.data?.role}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card">
                  <DropdownMenuItem
                    id="header-button-change-pass"
                    onClick={() => setOpenChangePass(true)}
                    className=""
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Change password
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    id="header-button-logout"
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default MainLayout;
