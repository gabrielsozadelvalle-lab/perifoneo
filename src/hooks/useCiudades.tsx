import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCiudades() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["ciudades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ciudades")
        .select("*")
        .order("nombre");
      if (error) throw error;
      return data;
    },
  });

  const addCiudad = useMutation({
    mutationFn: async (nombre: string) => {
      const { error } = await supabase.from("ciudades").insert({ nombre });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ciudades"] });
      toast.success("Ciudad agregada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteCiudad = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ciudades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ciudades"] });
      toast.success("Ciudad eliminada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addCiudad, deleteCiudad };
}
