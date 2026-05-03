import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type FacturaEstado = "pendiente" | "pagado" | "vencido";

export interface FacturaInput {
  cliente_id: string;
  mes: number;
  anio: number;
  monto: number;
  fecha_emision?: string;
  fecha_vencimiento?: string | null;
  fecha_pago?: string | null;
  estado: FacturaEstado;
  metodo_pago?: string | null;
  notas?: string | null;
}

export function useFacturas() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["facturas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facturas")
        .select(`*, clientes(id, nombre, ciudad_id, ciudades(nombre))`)
        .order("anio", { ascending: false })
        .order("mes", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addFactura = useMutation({
    mutationFn: async (input: FacturaInput) => {
      const { data, error } = await supabase.from("facturas").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas"] });
      toast.success("Factura creada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateFactura = useMutation({
    mutationFn: async ({ id, ...input }: FacturaInput & { id: string }) => {
      const { error } = await supabase.from("facturas").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas"] });
      toast.success("Factura actualizada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteFactura = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("facturas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas"] });
      toast.success("Factura eliminada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const marcarPagada = useMutation({
    mutationFn: async ({ id, fecha_pago, metodo_pago }: { id: string; fecha_pago: string; metodo_pago?: string }) => {
      const { error } = await supabase
        .from("facturas")
        .update({ estado: "pagado", fecha_pago, metodo_pago: metodo_pago ?? null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas"] });
      toast.success("Factura marcada como pagada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Genera facturas del mes actual para todos los clientes que aún no tienen
  const generarMesActual = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const anio = now.getFullYear();

      const { data: clientes, error: cErr } = await supabase
        .from("clientes")
        .select("id, monto_mensual, dia_pago")
        .eq("user_id", user!.id);
      if (cErr) throw cErr;

      const { data: existentes, error: eErr } = await supabase
        .from("facturas")
        .select("cliente_id")
        .eq("mes", mes)
        .eq("anio", anio);
      if (eErr) throw eErr;

      const existSet = new Set((existentes ?? []).map((f) => f.cliente_id));
      const aCrear = (clientes ?? [])
        .filter((c) => !existSet.has(c.id) && Number(c.monto_mensual) > 0)
        .map((c) => {
          const venc = new Date(anio, mes - 1, c.dia_pago);
          return {
            cliente_id: c.id,
            mes,
            anio,
            monto: Number(c.monto_mensual),
            fecha_emision: new Date().toISOString().slice(0, 10),
            fecha_vencimiento: venc.toISOString().slice(0, 10),
            estado: "pendiente" as const,
          };
        });

      if (aCrear.length === 0) return 0;
      const { error } = await supabase.from("facturas").insert(aCrear);
      if (error) throw error;
      return aCrear.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["facturas"] });
      if (count === 0) toast.info("Todas las facturas del mes ya están generadas");
      else toast.success(`${count} factura(s) generada(s) para este mes`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addFactura, updateFactura, deleteFactura, marcarPagada, generarMesActual };
}
