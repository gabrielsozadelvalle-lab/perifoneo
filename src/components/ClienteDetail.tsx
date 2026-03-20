import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServicioDialog } from "./ServicioDialog";
import { useServicios } from "@/hooks/useServicios";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { openWhatsApp } from "@/utils/whatsapp";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
}

export function ClienteDetail({ open, onOpenChange, cliente }: Props) {
  const [servicioOpen, setServicioOpen] = useState(false);
  const { addServicio, deleteServicio } = useServicios();

  if (!cliente) return null;

  const contratados = cliente.servicios_contratados ?? [];
  const realizados = (cliente.servicios_realizados ?? []).sort(
    (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const actContratadas = contratados.find((s: any) => s.tipo === "activacion")?.cantidad_mensual ?? 0;
  const perContratados = contratados.find((s: any) => s.tipo === "perifoneo")?.cantidad_mensual ?? 0;
  const actRealizadas = realizados.filter((s: any) => s.tipo === "activacion").length;
  const perRealizados = realizados.filter((s: any) => s.tipo === "perifoneo").length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] max-w-[95vw] sm:w-auto sm:max-w-2xl rounded-lg">
          <DialogHeader>
            <DialogTitle>{cliente.nombre}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Teléfono:</span>{" "}
              {cliente.telefono || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Ciudad:</span>{" "}
              {cliente.ciudades?.nombre}
            </div>
            <div>
              <span className="text-muted-foreground">Monto mensual:</span>{" "}
              <span className="font-semibold">C$ {Number(cliente.monto_mensual).toLocaleString("es-NI")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Día de pago:</span>{" "}
              {cliente.dia_pago}
            </div>
          </div>

          {/* Service summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg border p-3 space-y-1">
              <div className="text-sm font-medium">Activaciones</div>
              <div className="text-xs text-muted-foreground">
                {actRealizadas} / {actContratadas} realizadas
              </div>
              <Badge variant={actContratadas - actRealizadas > 0 ? "default" : "secondary"}>
                {Math.max(0, actContratadas - actRealizadas)} pendientes
              </Badge>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <div className="text-sm font-medium">Perifoneos</div>
              <div className="text-xs text-muted-foreground">
                {perRealizados} / {perContratados} realizados
              </div>
              <Badge variant={perContratados - perRealizados > 0 ? "default" : "secondary"}>
                {Math.max(0, perContratados - perRealizados)} pendientes
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-2">
            <Button size="sm" onClick={() => setServicioOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Registrar Servicio
            </Button>
          </div>

          {/* History */}
          <div className="mt-2">
            <h3 className="text-sm font-semibold mb-2">Historial de Servicios</h3>
            {realizados.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin servicios registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="hidden sm:table-cell">Notas</TableHead>
                      <TableHead className="w-24 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {realizados.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell>{new Date(s.fecha).toLocaleDateString("es-NI")}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.tipo === "activacion" ? "Activación" : "Perifoneo"}</Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{s.notas || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openWhatsApp(cliente, s)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Compartir por WhatsApp"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteServicio.mutate(s.id)}
                              className="text-destructive hover:text-destructive"
                              title="Eliminar registro"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ServicioDialog
        open={servicioOpen}
        onOpenChange={setServicioOpen}
        loading={addServicio.isPending}
        onSubmit={(data) => {
          addServicio.mutate({ ...data, cliente_id: cliente.id }, {
            onSuccess: (newServicio) => {
              setServicioOpen(false);
              // Open WhatsApp automatically or offer choice? 
              // The user said "Permiteme poder enviar...", so we should probably offer it or just do it.
              // We'll call openWhatsApp directly.
              openWhatsApp(cliente, newServicio);
            },
          });
        }}
      />
    </>
  );
}
