import { useMemo, useState } from "react";
import { useFacturas } from "@/hooks/useFacturas";
import { useClientes } from "@/hooks/useClientes";
import { useCiudades } from "@/hooks/useCiudades";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, CheckCircle2, Pencil, Trash2, FileText, Receipt, Sparkles, AlertTriangle, Clock } from "lucide-react";
import { formatCordoba, MESES, nombreMes } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Facturacion() {
  const { data: facturas = [], isLoading, addFactura, updateFactura, deleteFactura, marcarPagada, generarMesActual } = useFacturas();
  const { data: clientes = [] } = useClientes();
  const { data: ciudades = [] } = useCiudades();

  const now = new Date();
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterCiudad, setFilterCiudad] = useState<string>("all");
  const [filterMes, setFilterMes] = useState<string>(String(now.getMonth() + 1));
  const [filterAnio, setFilterAnio] = useState<string>(String(now.getFullYear()));
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<any>(null);
  const [delTarget, setDelTarget] = useState<any>(null);

  const aniosDisponibles = useMemo(() => {
    const set = new Set<number>([now.getFullYear()]);
    facturas.forEach((f: any) => set.add(f.anio));
    return Array.from(set).sort((a, b) => b - a);
  }, [facturas]);

  const filtered = facturas.filter((f: any) => {
    if (filterEstado !== "all" && f.estado !== filterEstado) return false;
    if (filterCiudad !== "all" && f.clientes?.ciudad_id !== filterCiudad) return false;
    if (filterMes !== "all" && String(f.mes) !== filterMes) return false;
    if (filterAnio !== "all" && String(f.anio) !== filterAnio) return false;
    if (search && !f.clientes?.nombre?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Totales del set filtrado
  const totals = filtered.reduce(
    (acc: any, f: any) => {
      const m = Number(f.monto);
      acc.total += m;
      if (f.estado === "pagado") acc.pagado += m;
      else if (f.estado === "vencido") acc.vencido += m;
      else acc.pendiente += m;
      return acc;
    },
    { total: 0, pagado: 0, pendiente: 0, vencido: 0 }
  );

  const estadoBadge = (estado: string) => {
    const map: Record<string, { cls: string; icon: any; label: string }> = {
      pagado: { cls: "bg-success-soft text-success border-success/20", icon: CheckCircle2, label: "Pagado" },
      pendiente: { cls: "bg-warning-soft text-warning border-warning/20", icon: Clock, label: "Pendiente" },
      vencido: { cls: "bg-danger-soft text-destructive border-destructive/20", icon: AlertTriangle, label: "Vencido" },
    };
    const v = map[estado] ?? map.pendiente;
    const Icon = v.icon;
    return (
      <Badge variant="outline" className={cn("gap-1 font-medium", v.cls)}>
        <Icon className="h-3 w-3" /> {v.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Facturacion</h1>
          <p className="text-sm text-muted-foreground mt-1">Control de cobros mensuales por cliente</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => generarMesActual.mutate()} disabled={generarMesActual.isPending} className="gap-2">
            <Sparkles className="h-4 w-4" /> Generar mes actual
          </Button>
          <Button
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="gap-2 bg-gradient-primary hover:opacity-90 shadow-elegant"
          >
            <Plus className="h-4 w-4" /> Nueva factura
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total facturado" value={formatCordoba(totals.total)} icon={Receipt} gradient="bg-gradient-primary" />
        <KpiCard label="Cobrado" value={formatCordoba(totals.pagado)} icon={CheckCircle2} gradient="bg-gradient-success" />
        <KpiCard label="Pendiente" value={formatCordoba(totals.pendiente)} icon={Clock} gradient="bg-gradient-accent" />
        <KpiCard label="Vencido" value={formatCordoba(totals.vencido)} icon={AlertTriangle} gradient="bg-gradient-to-br from-destructive to-destructive/70" />
      </div>

      {/* Filtros */}
      <Card className="shadow-card">
        <CardContent className="p-4 grid gap-3 grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterMes} onValueChange={setFilterMes}>
            <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              {MESES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterAnio} onValueChange={setFilterAnio}>
            <SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los años</SelectItem>
              {aniosDisponibles.map((a) => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCiudad} onValueChange={setFilterCiudad}>
            <SelectTrigger><SelectValue placeholder="Ciudad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ciudades</SelectItem>
              {ciudades.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista */}
      {isLoading ? (
        <div className="text-muted-foreground py-12 text-center">Cargando...</div>
      ) : filtered.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-16 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">No hay facturas con esos filtros</p>
            <p className="text-sm text-muted-foreground">Crea una factura o genera las del mes actual</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((f: any) => (
              <Card key={f.id} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{f.clientes?.nombre}</p>
                      <p className="text-xs text-muted-foreground">{f.clientes?.ciudades?.nombre}</p>
                    </div>
                    {estadoBadge(f.estado)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{nombreMes(f.mes)} {f.anio}</span>
                    <span className="font-bold text-lg">{formatCordoba(f.monto)}</span>
                  </div>
                  {f.metodo_pago && (
                    <p className="text-xs text-muted-foreground">Cobro: {f.metodo_pago}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {f.estado !== "pagado" && (
                      <Button size="sm" className="gap-1 bg-gradient-success" onClick={() => { setPayTarget(f); setPayOpen(true); }}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pagar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setEditing(f); setFormOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDelTarget(f)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden md:block shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Cobro</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.clientes?.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{f.clientes?.ciudades?.nombre}</TableCell>
                    <TableCell>{nombreMes(f.mes)} {f.anio}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {f.fecha_vencimiento ?? "—"}
                    </TableCell>
                    <TableCell>{estadoBadge(f.estado)}</TableCell>
                    <TableCell className="max-w-56 truncate text-sm text-muted-foreground">{f.metodo_pago ?? "—"}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCordoba(f.monto)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {f.estado !== "pagado" && (
                          <Button size="sm" variant="ghost" className="text-success hover:text-success hover:bg-success-soft gap-1"
                            onClick={() => { setPayTarget(f); setPayOpen(true); }}>
                            <CheckCircle2 className="h-4 w-4" /> Pagar
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(f); setFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDelTarget(f)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      <FacturaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        clientes={clientes}
        onSubmit={(data) => {
          if (editing) updateFactura.mutate({ id: editing.id, ...data }, { onSuccess: () => setFormOpen(false) });
          else addFactura.mutate(data, { onSuccess: () => setFormOpen(false) });
        }}
      />

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como pagada</DialogTitle>
          </DialogHeader>
          <PayForm
            monto={Number(payTarget?.monto ?? 0)}
            onSubmit={(fecha_pago, metodo_pago) => {
              marcarPagada.mutate({ id: payTarget.id, fecha_pago, metodo_pago }, { onSuccess: () => setPayOpen(false) });
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delTarget} onOpenChange={(o) => !o && setDelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { deleteFactura.mutate(delTarget.id); setDelTarget(null); }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, gradient }: any) {
  return (
    <Card className="shadow-card overflow-hidden relative group hover:shadow-elegant transition-smooth">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
            <p className="text-xl lg:text-2xl font-bold tracking-tight truncate">{value}</p>
          </div>
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0", gradient)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PayForm({ monto, onSubmit }: { monto: number; onSubmit: (fecha: string, metodo: string) => void }) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [metodo, setMetodo] = useState("efectivo");
  const [efectivo, setEfectivo] = useState("");
  const [transferencia, setTransferencia] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const montoEfectivo = metodo === "efectivo" || metodo === "mixto" ? Number(efectivo || 0) : 0;
  const montoTransferencia = metodo === "transferencia" || metodo === "mixto" ? Number(transferencia || 0) : 0;
  const montoTarjeta = metodo === "tarjeta" || metodo === "mixto" ? Number(tarjeta || 0) : 0;
  const totalCobrado = montoEfectivo + montoTransferencia + montoTarjeta;
  const metodoPago = () => {
    const partes = [
      montoEfectivo > 0 && `Efectivo ${formatCordoba(montoEfectivo)}`,
      montoTransferencia > 0 && `Transferencia ${formatCordoba(montoTransferencia)}`,
      montoTarjeta > 0 && `Tarjeta ${formatCordoba(montoTarjeta)}`,
    ].filter(Boolean);

    if (partes.length > 0) return metodo === "mixto" ? `Mixto: ${partes.join(" + ")}` : String(partes[0]);
    return metodo.charAt(0).toUpperCase() + metodo.slice(1);
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(fecha, metodoPago()); }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Fecha de pago</Label>
        <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Metodo de pago</Label>
        <Select value={metodo} onValueChange={setMetodo}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="transferencia">Transferencia</SelectItem>
            <SelectItem value="tarjeta">Tarjeta</SelectItem>
            <SelectItem value="mixto">Mixto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className={metodo === "mixto" ? "grid grid-cols-1 sm:grid-cols-3 gap-3" : "space-y-2"}>
        {(metodo === "efectivo" || metodo === "mixto") && (
          <div className="space-y-2">
            <Label>Efectivo (C$)</Label>
            <Input type="number" min="0" step="0.01" value={efectivo} onChange={(e) => setEfectivo(e.target.value)} />
          </div>
        )}
        {(metodo === "transferencia" || metodo === "mixto") && (
          <div className="space-y-2">
            <Label>Transferencia (C$)</Label>
            <Input type="number" min="0" step="0.01" value={transferencia} onChange={(e) => setTransferencia(e.target.value)} />
          </div>
        )}
        {(metodo === "tarjeta" || metodo === "mixto") && (
          <div className="space-y-2">
            <Label>Tarjeta (C$)</Label>
            <Input type="number" min="0" step="0.01" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} />
          </div>
        )}
      </div>
      <div className="rounded-lg border bg-muted/40 p-3 text-sm flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Total factura</span>
        <span className="font-semibold">{formatCordoba(monto)}</span>
      </div>
      {totalCobrado > 0 && (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Total recibido</span>
          <span className="font-semibold">{formatCordoba(totalCobrado)}</span>
        </div>
      )}
      <DialogFooter>
        <Button type="submit" className="bg-gradient-success">Confirmar pago</Button>
      </DialogFooter>
    </form>
  );
}

function FacturaFormDialog({ open, onOpenChange, editing, clientes, onSubmit }: any) {
  const now = new Date();
  const [clienteId, setClienteId] = useState("");
  const [mes, setMes] = useState(String(now.getMonth() + 1));
  const [anio, setAnio] = useState(String(now.getFullYear()));
  const [monto, setMonto] = useState("0");
  const [estado, setEstado] = useState<"pendiente" | "pagado" | "vencido">("pendiente");
  const [vencimiento, setVencimiento] = useState("");
  const [notas, setNotas] = useState("");

  // resetear al abrir
  useMemo(() => {
    if (open) {
      if (editing) {
        setClienteId(editing.cliente_id);
        setMes(String(editing.mes));
        setAnio(String(editing.anio));
        setMonto(String(editing.monto));
        setEstado(editing.estado);
        setVencimiento(editing.fecha_vencimiento ?? "");
        setNotas(editing.notas ?? "");
      } else {
        setClienteId("");
        setMes(String(now.getMonth() + 1));
        setAnio(String(now.getFullYear()));
        setMonto("0");
        setEstado("pendiente");
        setVencimiento("");
        setNotas("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const onClienteChange = (id: string) => {
    setClienteId(id);
    if (!editing) {
      const c = clientes.find((x: any) => x.id === id);
      if (c) {
        setMonto(String(c.monto_mensual));
        const venc = new Date(Number(anio), Number(mes) - 1, c.dia_pago);
        setVencimiento(venc.toISOString().slice(0, 10));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar factura" : "Nueva factura"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              cliente_id: clienteId,
              mes: Number(mes),
              anio: Number(anio),
              monto: Number(monto),
              estado,
              fecha_vencimiento: vencimiento || null,
              notas: notas || null,
            });
          }}
        >
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={onClienteChange} required>
              <SelectTrigger><SelectValue placeholder="Selecciona cliente" /></SelectTrigger>
              <SelectContent>
                {clientes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Mes</Label>
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MESES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Año</Label>
              <Input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Monto (C$)</Label>
              <Input type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={(v: any) => setEstado(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fecha de vencimiento</Label>
            <Input type="date" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Opcional" />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-gradient-primary">{editing ? "Guardar" : "Crear factura"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
