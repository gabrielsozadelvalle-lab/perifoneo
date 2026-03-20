import { useState } from "react";
import { useCiudades } from "@/hooks/useCiudades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Ciudades() {
  const { data: ciudades, isLoading, addCiudad, deleteCiudad } = useCiudades();
  const [nombre, setNombre] = useState("");

  const handleAdd = () => {
    if (!nombre.trim()) {
      toast.error("Ingresá un nombre");
      return;
    }
    addCiudad.mutate(nombre.trim());
    setNombre("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ciudades</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar Ciudad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de la ciudad"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={addCiudad.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ciudad</TableHead>
                <TableHead className="w-20">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Cargando...</TableCell></TableRow>
              ) : ciudades?.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No hay ciudades</TableCell></TableRow>
              ) : (
                ciudades?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {c.nombre}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCiudad.mutate(c.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
