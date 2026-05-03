import { useClientes } from "@/hooks/useClientes";
import { useCiudades } from "@/hooks/useCiudades";
import { useFacturas } from "@/hooks/useFacturas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, MapPin, ClipboardList, TrendingUp, Receipt, CheckCircle2, AlertTriangle } from "lucide-react";
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Vista general del negocio</p>
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
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Facturación del mes
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Facturado</p>
                <p className="text-xl font-bold mt-1">{formatCordoba(cobradoMes + pendienteMes)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/60" />
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Cobrado</p>
                <p className="text-xl font-bold mt-1 text-success">{formatCordoba(cobradoMes)}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success/60" />
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Pendiente</p>
                <p className="text-xl font-bold mt-1 text-warning">{formatCordoba(pendienteMes)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning/60" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Por ciudad */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Resumen por ciudad
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byCiudad.map(({ ciudad, clientes: count, total }) => (
            <Card key={ciudad.id} className="shadow-card hover:shadow-elegant transition-smooth group">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    {ciudad.nombre}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">{count} clientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{formatCordoba(total)}</div>
                <p className="text-xs text-muted-foreground mt-1">ingreso mensual estimado</p>
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
    <Card className="shadow-card overflow-hidden hover:shadow-elegant transition-smooth">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold tracking-tight truncate">{value}</p>
          </div>
          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-md shrink-0", gradient)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
