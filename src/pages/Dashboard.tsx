import { useClientes } from "@/hooks/useClientes";
import { useCiudades } from "@/hooks/useCiudades";
import { useFacturas } from "@/hooks/useFacturas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, MapPin, ClipboardList, TrendingUp, Receipt, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { formatCordoba } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: clientes, isLoading } = useClientes();
  const { data: ciudades } = useCiudades();
  const { data: facturas = [] } = useFacturas();

  const totalClientes = clientes?.length ?? 0;
  const totalMensual = clientes?.reduce((sum, c) => sum + Number(c.monto_mensual), 0) ?? 0;
  const totalCiudades = ciudades?.length ?? 0;

  const pendingServices = clientes?.reduce((sum, c) => {
    const contratados = c.servicios_contratados ?? [];
    const realizados = c.servicios_realizados ?? [];
    const totalContratado = contratados.reduce((s: number, sc: any) => s + sc.cantidad_mensual, 0);
    const totalRealizado = realizados.length;
    return sum + Math.max(0, totalContratado - totalRealizado);
  }, 0) ?? 0;

  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const anioActual = now.getFullYear();
  const facturasMes = facturas.filter((f: any) => f.mes === mesActual && f.anio === anioActual);
  const cobradoMes = facturasMes.filter((f: any) => f.estado === "pagado").reduce((s: number, f: any) => s + Number(f.monto), 0);
  const pendienteMes = facturasMes.filter((f: any) => f.estado !== "pagado").reduce((s: number, f: any) => s + Number(f.monto), 0);

  const byCiudad = ciudades?.map((ciudad) => {
    const cityClients = clientes?.filter((c) => c.ciudad_id === ciudad.id) ?? [];
    const cityTotal = cityClients.reduce((sum, c) => sum + Number(c.monto_mensual), 0);
    return { ciudad, clientes: cityClients.length, total: cityTotal };
  }) ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 sm:p-8 text-white shadow-elevated">
        <div aria-hidden className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Resumen ejecutivo
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Bienvenido de vuelta
            </h1>
            <p className="text-white/70 mt-2 text-sm sm:text-base">
              Aquí tienes el pulso financiero de tu operación de perifoneo.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Ingreso mensual</span>
            <span className="font-display text-3xl sm:text-4xl font-bold mt-1">{formatCordoba(totalMensual)}</span>
          </div>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Clientes" value={String(totalClientes)} icon={Users} gradient="bg-gradient-primary" />
        <KpiCard label="Ingreso Mensual" value={formatCordoba(totalMensual)} icon={TrendingUp} gradient="bg-gradient-success" />
        <KpiCard label="Ciudades" value={String(totalCiudades)} icon={MapPin} gradient="bg-gradient-accent" />
        <KpiCard label="Servicios Pendientes" value={String(pendingServices)} icon={ClipboardList} gradient="bg-gradient-to-br from-primary to-primary-glow" />
      </div>

      {/* Facturación del mes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-display text-lg font-semibold">Facturación del mes</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Facturado</p>
                <p className="font-display text-2xl font-bold mt-1.5">{formatCordoba(cobradoMes + pendienteMes)}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-info-soft flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cobrado</p>
                <p className="font-display text-2xl font-bold mt-1.5 text-success">{formatCordoba(cobradoMes)}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-success-soft flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pendiente</p>
                <p className="font-display text-2xl font-bold mt-1.5 text-warning">{formatCordoba(pendienteMes)}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-warning-soft flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Por ciudad */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-accent" />
          </div>
          <h2 className="font-display text-lg font-semibold">Resumen por ciudad</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byCiudad.map(({ ciudad, clientes: count, total }) => (
            <Card key={ciudad.id} className="card-premium group">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between font-display">
                  <span className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-glow transition-smooth">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    {ciudad.nombre}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {count} clientes
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold tracking-tight text-gradient-primary">
                  {formatCordoba(total)}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">ingreso mensual estimado</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, gradient }: any) {
  return (
    <Card className="card-premium overflow-hidden relative group">
      <div aria-hidden className={cn("absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-smooth", gradient)} />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
            <p className="font-display text-2xl font-bold tracking-tight truncate">{value}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-spring", gradient)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
