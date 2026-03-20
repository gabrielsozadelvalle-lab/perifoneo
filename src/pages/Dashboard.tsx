import { useClientes } from "@/hooks/useClientes";
import { useCiudades } from "@/hooks/useCiudades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, MapPin, ClipboardList } from "lucide-react";

export default function Dashboard() {
  const { data: clientes, isLoading } = useClientes();
  const { data: ciudades } = useCiudades();

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

  // Group by city
  const byCiudad = ciudades?.map((ciudad) => {
    const cityClients = clientes?.filter((c) => c.ciudad_id === ciudad.id) ?? [];
    const cityTotal = cityClients.reduce((sum, c) => sum + Number(c.monto_mensual), 0);
    return { ciudad, clientes: cityClients.length, total: cityTotal };
  }) ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingreso Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">C$ {totalMensual.toLocaleString("es-NI")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ciudades</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCiudades}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Servicios Pendientes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingServices}</div>
          </CardContent>
        </Card>
      </div>

      {/* By city */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen por Ciudad</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byCiudad.map(({ ciudad, clientes: count, total }) => (
            <Card key={ciudad.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {ciudad.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-sm text-muted-foreground">{count} clientes</div>
                <div className="text-xl font-bold">C$ {total.toLocaleString("es-NI")}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
