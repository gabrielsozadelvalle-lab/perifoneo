import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCiudades } from "@/hooks/useCiudades";
import type { ClienteInput, ServicioContratadoInput } from "@/hooks/useClientes";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (cliente: ClienteInput, servicios: ServicioContratadoInput[]) => void;
  initialData?: {
    nombre: string;
    telefono: string;
    ciudad_id: string;
    monto_mensual: number;
    dia_pago: number;
    servicios: ServicioContratadoInput[];
  };
  loading?: boolean;
}

export function ClienteFormDialog({ open, onOpenChange, onSubmit, initialData, loading }: Props) {
  const { data: ciudades } = useCiudades();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudadId, setCiudadId] = useState("");
  const [monto, setMonto] = useState("");
  const [diaPago, setDiaPago] = useState("1");
  const [activaciones, setActivaciones] = useState("0");
  const [perifoneos, setPerifoneos] = useState("0");

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setTelefono(initialData.telefono || "");
      setCiudadId(initialData.ciudad_id);
      setMonto(String(initialData.monto_mensual));
      setDiaPago(String(initialData.dia_pago));
      const act = initialData.servicios.find((s) => s.tipo === "activacion");
      const per = initialData.servicios.find((s) => s.tipo === "perifoneo");
      setActivaciones(String(act?.cantidad_mensual ?? 0));
      setPerifoneos(String(per?.cantidad_mensual ?? 0));
    } else {
      setNombre("");
      setTelefono("");
      setCiudadId(ciudades?.[0]?.id ?? "");
      setMonto("");
      setDiaPago("1");
      setActivaciones("0");
      setPerifoneos("0");
    }
  }, [initialData, open, ciudades]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const servicios: ServicioContratadoInput[] = [];
    if (Number(activaciones) > 0) servicios.push({ tipo: "activacion", cantidad_mensual: Number(activaciones) });
    if (Number(perifoneos) > 0) servicios.push({ tipo: "perifoneo", cantidad_mensual: Number(perifoneos) });

    onSubmit(
      {
        nombre,
        telefono: telefono || undefined,
        ciudad_id: ciudadId,
        monto_mensual: Number(monto),
        dia_pago: Number(diaPago),
      },
      servicios
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Ciudad</Label>
            <Select value={ciudadId} onValueChange={setCiudadId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar ciudad" /></SelectTrigger>
              <SelectContent>
                {ciudades?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monto Mensual (C$)</Label>
              <Input type="number" min="0" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Día de Pago</Label>
              <Input type="number" min="1" max="31" value={diaPago} onChange={(e) => setDiaPago(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Activaciones / mes</Label>
              <Input type="number" min="0" value={activaciones} onChange={(e) => setActivaciones(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Perifoneos / mes</Label>
              <Input type="number" min="0" value={perifoneos} onChange={(e) => setPerifoneos(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear Cliente"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
