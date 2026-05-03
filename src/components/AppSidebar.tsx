import { LayoutDashboard, Users, MapPin, LogOut, Receipt, Megaphone } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  { title: "Facturacion", url: "/facturacion", icon: Receipt },
  { title: "Ciudades", url: "/ciudades", icon: MapPin },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r-0">
      <div className="h-full gradient-sidebar flex flex-col">
        <SidebarHeader className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-sidebar-foreground leading-tight">Perifoneo</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">ERP Suite</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3">
              Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-10 rounded-lg">
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-smooth"
                        activeClassName="bg-sidebar-accent text-sidebar-foreground font-semibold shadow-sm"
                        onClick={handleNavClick}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</div>
          </div>
          <SidebarMenuButton onClick={signOut} className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg">
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
