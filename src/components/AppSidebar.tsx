import { LayoutDashboard, Users, MapPin, LogOut, Receipt, Megaphone } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Facturación", url: "/facturacion", icon: Receipt },
  { title: "Ciudades", url: "/ciudades", icon: MapPin },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="h-full bg-sidebar flex flex-col">
        <SidebarHeader className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
              <Megaphone className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-sidebar-foreground leading-tight">
                Perifoneo
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                ERP Suite
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-11 rounded-full px-4">
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground transition-smooth"
                        activeClassName="!bg-sidebar-primary !text-sidebar-primary-foreground font-semibold shadow-md hover:!bg-sidebar-primary"
                        onClick={handleNavClick}
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="text-sm">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.email?.split("@")[0] ?? "Usuario"}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {user?.email}
              </div>
            </div>
          </div>
          <SidebarMenuButton
            onClick={signOut}
            className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10 rounded-lg h-10"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Cerrar sesión</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
