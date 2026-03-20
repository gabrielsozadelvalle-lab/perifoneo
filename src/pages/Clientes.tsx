import { useState } from "react";
import { useClientes } from "@/hooks/useClientes";
import { useCiudades } from "@/hooks/useCiudades";
import { ClienteFormDialog } from "@/components/ClienteFormDialog";
import { ClienteDetail } from "@/components/ClienteDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Clientes() {
  const { data: clientes, isLoading, addCliente, updateCliente, deleteCliente } = useClientes();
  const { data: ciudades } = useCiudades();

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterCiudad, setFilterCiudad] = useState("all");

  const filtered = clientes?.filter((c) => {
    const matchSearch = c.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCiudad = filterCiudad === "all" || c.ciudad_id === filterCiudad;
    return matchSearch && matchCiudad;
  }) ?? [];

  const handleEdit = (c: any) => {
    setSelected(c);
    setFormOpen(true);
  };

  const handleView = (c: any) => {
    setSelected(c);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => { setSelected(null); setFormOpen(true); }} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" /> Nuevo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCiudad} onValueChange={setFilterCiudad}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas las ciudades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ciudades</SelectItem>
            {ciudades?.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile card list */}
      <div className="block sm:hidden space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay clientes</p>
        ) : (
          filtered.map((c) => {
            const contratados = c.servicios_contratados ?? [];
            const realizados = c.servicios_realizados ?? [];
            const totalC = contratados.reduce((s: number, sc: any) => s + sc.cantidad_mensual, 0);
            const totalR = realizados.length;
            const pending = Math.max(0, totalC - totalR);

            return (
              <Card key={c.id} className="cursor-pointer" onClick={() => handleView(c)}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{c.nombre}</span>
                    <span className="text-sm font-bold">C$ {Number(c.monto_mensual).toLocaleString("es-NI")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{c.ciudades?.nombre}</span>
                    <span>Día {c.dia_pago}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Badge variant={pending > 0 ? "default" : "secondary"} className="text-xs">
                        {totalR}/{totalC}
                      </Badge>
                      {pending > 0 && (
                        <Badge variant="outline" className="text-xs">{pending} pend.</Badge>
                      )}
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setSelected(c); setDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden sm:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Día Pago</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead className="w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Cargando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No hay clientes</TableCell></TableRow>
              ) : (
                filtered.map((c) => {
                  const contratados = c.servicios_contratados ?? [];
                  const realizados = c.servicios_realizados ?? [];
                  const totalC = contratados.reduce((s: number, sc: any) => s + sc.cantidad_mensual, 0);
                  const totalR = realizados.length;
                  const pending = Math.max(0, totalC - totalR);

                  return (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleView(c)}>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell>{c.ciudades?.nombre}</TableCell>
                      <TableCell>C$ {Number(c.monto_mensual).toLocaleString("es-NI")}</TableCell>
                      <TableCell>{c.dia_pago}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={pending > 0 ? "default" : "secondary"} className="text-xs">
                            {totalR}/{totalC}
                          </Badge>
                          {pending > 0 && (
                            <Badge variant="outline" className="text-xs">{pending} pend.</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => handleView(c)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelected(c); setDeleteOpen(true); }} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      

      {/* Form dialog */}
      <ClienteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        loading={addCliente.isPending || updateCliente.isPending}
        initialData={
          selected
            ? {
                nombre: selected.nombre,
                telefono: selected.telefono || "",
                ciudad_id: selected.ciudad_id,
                monto_mensual: Number(selected.monto_mensual),
                dia_pago: selected.dia_pago,
                servicios: (selected.servicios_contratados ?? []).map((s: any) => ({
                  tipo: s.tipo,
                  cantidad_mensual: s.cantidad_mensual,
                })),
              }
            : undefined
        }
        onSubmit={(cliente, servicios) => {
          if (selected) {
            updateCliente.mutate({ id: selected.id, cliente, servicios }, { onSuccess: () => setFormOpen(false) });
          } else {
            addCliente.mutate({ cliente, servicios }, { onSuccess: () => setFormOpen(false) });
          }
        }}
      />

      {/* Detail dialog */}
      <ClienteDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        cliente={selected}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a "{selected?.nombre}" y todos sus registros de servicios. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteCliente.mutate(selected.id);
                setDeleteOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
