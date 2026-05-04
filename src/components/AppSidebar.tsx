import { LayoutDashboard, Users, MapPin, LogOut, Receipt, Megaphone, Sparkles } from "lucide-react";
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
    <Sidebar className="border-r-0">
      <div className="h-full gradient-sidebar flex flex-col relative overflow-hidden">
        {/* Halo decorativo dorado */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
          style={{ background: "hsl(var(--accent))" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 -left-16 h-48 w-48 rounded-full opacity-10 blur-3xl"
          style={{ background: "hsl(var(--primary-glow))" }}
        />

        <SidebarHeader className="p-5 border-b border-sidebar-border relative">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow ring-1 ring-white/10">
              <Megaphone className="h-5 w-5 text-sidebar-primary-foreground" />
              <Sparkles className="h-2.5 w-2.5 text-white absolute -top-0.5 -right-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-sidebar-foreground leading-tight">
                Perifoneo
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40 font-semibold">
                ERP Suite
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-5 relative">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/35 text-[10px] uppercase tracking-[0.18em] px-2 font-semibold">
              Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 mt-1">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-11 rounded-xl px-3">
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-smooth relative group"
                        activeClassName="!bg-sidebar-accent !text-sidebar-foreground font-semibold shadow-md before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-gradient-accent"
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

        <SidebarFooter className="border-t border-sidebar-border p-4 relative">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-sidebar-accent">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.email?.split("@")[0] ?? "Usuario"}
              </div>
              <div className="text-[10px] text-sidebar-foreground/45 truncate">
                {user?.email}
              </div>
            </div>
          </div>
          <SidebarMenuButton
            onClick={signOut}
            className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg h-10"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Cerrar sesión</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
