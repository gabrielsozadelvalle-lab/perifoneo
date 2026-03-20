import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface ClienteInput {
  nombre: string;
  telefono?: string;
  ciudad_id: string;
  monto_mensual: number;
  dia_pago: number;
}

export interface ServicioContratadoInput {
  tipo: "activacion" | "perifoneo";
  cantidad_mensual: number;
}

export function useClientes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select(`
          *,
          ciudades(nombre),
          servicios_contratados(*),
          servicios_realizados(*)
        `)
        .order("nombre");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addCliente = useMutation({
    mutationFn: async ({ cliente, servicios }: { cliente: ClienteInput; servicios: ServicioContratadoInput[] }) => {
      const { data, error } = await supabase
        .from("clientes")
        .insert({ ...cliente, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;

      if (servicios.length > 0) {
        const { error: sErr } = await supabase
          .from("servicios_contratados")
          .insert(servicios.map((s) => ({ ...s, cliente_id: data.id })));
        if (sErr) throw sErr;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente creado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateCliente = useMutation({
    mutationFn: async ({ id, cliente, servicios }: { id: string; cliente: ClienteInput; servicios: ServicioContratadoInput[] }) => {
      const { error } = await supabase
        .from("clientes")
        .update(cliente)
        .eq("id", id);
      if (error) throw error;

      // Replace servicios contratados
      await supabase.from("servicios_contratados").delete().eq("cliente_id", id);
      if (servicios.length > 0) {
        const { error: sErr } = await supabase
          .from("servicios_contratados")
          .insert(servicios.map((s) => ({ ...s, cliente_id: id })));
        if (sErr) throw sErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente actualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente eliminado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addCliente, updateCliente, deleteCliente };
}
