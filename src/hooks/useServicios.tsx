import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServicioRealizadoInput {
  cliente_id: string;
  tipo: "activacion" | "perifoneo";
  fecha: string;
  notas?: string;
}

export function useServicios() {
  const queryClient = useQueryClient();

  const addServicio = useMutation({
    mutationFn: async (input: ServicioRealizadoInput) => {
      const { data, error } = await supabase
        .from("servicios_realizados")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Servicio registrado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteServicio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("servicios_realizados").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Servicio eliminado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { addServicio, deleteServicio };
}
