import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from "react-router-dom";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Vista general del negocio" },
  "/clientes": { title: "Clientes", subtitle: "Gestión de cartera" },
  "/facturacion": { title: "Facturación", subtitle: "Cobros mensuales por cliente" },
  "/ciudades": { title: "Ciudades", subtitle: "Cobertura geográfica" },
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const meta = titles[pathname] ?? { title: "Perifoneo", subtitle: "" };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border/60 glass flex items-center px-4 sm:px-6 sticky top-0 z-30">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="ml-3 sm:ml-4 flex flex-col leading-tight min-w-0">
              <span className="font-display font-semibold text-sm sm:text-base text-foreground truncate">
                {meta.title}
              </span>
              <span className="text-[11px] text-muted-foreground truncate hidden sm:block">
                {meta.subtitle}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-soft text-success text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                En línea
              </div>
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto w-full animate-fade-in-up">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
