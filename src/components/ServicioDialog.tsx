import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type MetodoCobro = "efectivo" | "transferencia" | "tarjeta" | "mixto";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    tipo: "activacion" | "perifoneo";
    fecha: string;
    notas?: string;
  }) => void;
  loading?: boolean;
}

export function ServicioDialog({ open, onOpenChange, onSubmit, loading }: Props) {
  const [tipo, setTipo] = useState<"activacion" | "perifoneo">("perifoneo");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [metodoCobro, setMetodoCobro] = useState<MetodoCobro>("efectivo");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [montoTransferencia, setMontoTransferencia] = useState("");
  const [montoTarjeta, setMontoTarjeta] = useState("");
  const [notas, setNotas] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const efectivo = metodoCobro === "efectivo" || metodoCobro === "mixto" ? Number(montoEfectivo || 0) : 0;
    const transferencia = metodoCobro === "transferencia" || metodoCobro === "mixto" ? Number(montoTransferencia || 0) : 0;
    const tarjeta = metodoCobro === "tarjeta" || metodoCobro === "mixto" ? Number(montoTarjeta || 0) : 0;
    const cobros = [
      efectivo > 0 && `Efectivo C$ ${efectivo.toLocaleString("es-NI")}`,
      transferencia > 0 && `Transferencia C$ ${transferencia.toLocaleString("es-NI")}`,
      tarjeta > 0 && `Tarjeta C$ ${tarjeta.toLocaleString("es-NI")}`,
    ].filter(Boolean);
    const cobro = cobros.length > 0
      ? cobros.join(" + ")
      : metodoCobro.charAt(0).toUpperCase() + metodoCobro.slice(1);
    const notasConCobro = [`Cobro: ${cobro}`, notas.trim()].filter(Boolean).join("\n");

    onSubmit({
      tipo,
      fecha,
      notas: notasConCobro,
    });
    setMontoEfectivo("");
    setMontoTransferencia("");
    setMontoTarjeta("");
    setNotas("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Servicio Realizado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="activacion">Activación</SelectItem>
                <SelectItem value="perifoneo">Perifoneo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Tipo de cobro</Label>
            <Select value={metodoCobro} onValueChange={(v) => setMetodoCobro(v as MetodoCobro)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="mixto">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={metodoCobro === "mixto" ? "grid grid-cols-1 sm:grid-cols-3 gap-3" : "space-y-2"}>
            {(metodoCobro === "efectivo" || metodoCobro === "mixto") && (
              <div className="space-y-2">
                <Label>Efectivo (C$)</Label>
                <Input type="number" min="0" step="0.01" value={montoEfectivo} onChange={(e) => setMontoEfectivo(e.target.value)} />
              </div>
            )}
            {(metodoCobro === "transferencia" || metodoCobro === "mixto") && (
              <div className="space-y-2">
                <Label>Transferencia (C$)</Label>
                <Input type="number" min="0" step="0.01" value={montoTransferencia} onChange={(e) => setMontoTransferencia(e.target.value)} />
              </div>
            )}
            {(metodoCobro === "tarjeta" || metodoCobro === "mixto") && (
              <div className="space-y-2">
                <Label>Tarjeta (C$)</Label>
                <Input type="number" min="0" step="0.01" value={montoTarjeta} onChange={(e) => setMontoTarjeta(e.target.value)} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando..." : "Registrar Servicio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
