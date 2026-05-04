import { useState } from "react";
import { useCiudades } from "@/hooks/useCiudades";
import { useClientes } from "@/hooks/useClientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

export default function Ciudades() {
  const { data: ciudades, isLoading, addCiudad, deleteCiudad } = useCiudades();
  const { data: clientes } = useClientes();
  const [nombre, setNombre] = useState("");

  const handleAdd = () => {
    if (!nombre.trim()) {
      toast.error("Ingresá un nombre");
      return;
    }
    addCiudad.mutate(nombre.trim());
    setNombre("");
  };

  const countByCity = (id: string) =>
    clientes?.filter((c) => c.ciudad_id === id).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Ciudades</h1>
        <p className="text-sm text-muted-foreground mt-1">Cobertura geográfica de tu operación</p>
      </div>

      <Card className="card-premium">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-md">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Agregar ciudad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Nombre de la ciudad"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1"
            />
            <Button
              onClick={handleAdd}
              disabled={addCiudad.isPending}
              className="bg-gradient-primary hover:opacity-90 shadow-elegant gap-2"
            >
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Cargando...</div>
      ) : ciudades?.length === 0 ? (
        <Card className="card-premium">
          <CardContent className="py-16 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">Aún no hay ciudades</p>
            <p className="text-sm text-muted-foreground">Agregá tu primera ciudad para empezar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ciudades?.map((c) => {
            const count = countByCity(c.id);
            return (
              <Card key={c.id} className="card-premium group">
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-glow transition-smooth shrink-0">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-base truncate">{c.nombre}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Users className="h-3 w-3" />
                        {count} {count === 1 ? "cliente" : "clientes"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCiudad.mutate(c.id)}
                    className="text-destructive hover:text-destructive hover:bg-danger-soft shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
