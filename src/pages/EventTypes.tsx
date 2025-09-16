import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle, CalendarDays } from "lucide-react";
import { useEventTypes } from "@/hooks/useEventTypes";
import EventTypeList from "@/components/event-types/EventTypeList";
import EventTypeForm from "@/components/event-types/EventTypeForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { EventType } from "@/types";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";

const EventTypes = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);

  const { data: eventTypes, isLoading, isError, error } = useEventTypes();

  const handleAddClick = () => {
    setEditingEventType(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (eventType: EventType) => {
    setEditingEventType(eventType);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEventType(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando tipos de evento...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los tipos de evento: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Tipos de Evento"
        description="Define y organiza los diferentes tipos de eventos."
        icon={CalendarDays}
      />
      <div className="flex justify-end items-center mb-6">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Añadir Tipo de Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingEventType ? "Editar Tipo de Evento" : "Añadir Nuevo Tipo de Evento"}
              </DialogTitle>
            </DialogHeader>
            <EventTypeForm
              initialData={editingEventType}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-grow">
        {eventTypes && eventTypes.length > 0 ? (
          <EventTypeList eventTypes={eventTypes} onEdit={handleEditClick} onAddClick={handleAddClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <CalendarDays className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">No hay tipos de evento registrados. ¡Añade el primero!</p>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Añadir Tipo de Evento Ahora
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default EventTypes;