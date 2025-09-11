import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CalendarDays, PlusCircle } from "lucide-react"; // Added PlusCircle icon
import { EventType } from "@/types";
import { useDeleteEventType } from "@/hooks/useEventTypes";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface EventTypeListProps {
  eventTypes: EventType[];
  onEdit: (eventType: EventType) => void;
  onAddClick: () => void; // NEW: Prop to handle adding a new event type
}

const EventTypeList: React.FC<EventTypeListProps> = ({ eventTypes, onEdit, onAddClick }) => { // NEW: Destructure onAddClick
  const deleteMutation = useDeleteEventType();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (eventTypes.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <CalendarDays className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl mb-4">No hay tipos de evento registrados. ¡Añade el primero!</p> {/* Adjusted text */}
        <Button
          onClick={onAddClick} // NEW: Button to add event type
          className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Tipo de Evento Ahora
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Nombre</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[250px]">Descripción</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventTypes.map((eventType) => (
            <TableRow key={eventType.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[180px]">{eventType.name}</TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[250px]">{eventType.description || "N/A"}</TableCell>
              <TableCell className="flex justify-center space-x-2 py-3 px-6 min-w-[150px]">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(eventType)}
                  className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 ease-in-out"
                >
                  <Edit className="h-5 w-5 text-blue-600" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="p-6">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Estás absolutamente seguro?</AlertDialogTitle>
                      <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de evento <span className="font-semibold">{eventType.name}</span> de nuestros servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                      <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(eventType.id)}
                        className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EventTypeList;