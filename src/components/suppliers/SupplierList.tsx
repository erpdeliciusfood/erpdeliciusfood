"use client";

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
import { Edit, Trash2, Building2, PlusCircle, Phone, Mail, MapPin, User } from "lucide-react";
import { Supplier } from "@/types";
import { useDeleteSupplier } from "@/hooks/useSuppliers";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface SupplierListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onAddClick: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onEdit, onAddClick }) => {
  const deleteMutation = useDeleteSupplier();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <Building2 className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl mb-4">No hay proveedores registrados. ¡Añade el primero!</p>
        <Button
          onClick={onAddClick}
          className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Proveedor Ahora
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
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Contacto</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Teléfono</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[200px]">Email</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[250px]">Dirección</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[180px]">{supplier.name}</TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[180px]">
                {supplier.contact_person ? (
                  <span className="flex items-center"><User className="h-4 w-4 mr-2" />{supplier.contact_person}</span>
                ) : "N/A"}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[150px]">
                {supplier.phone ? (
                  <a href={`tel:${supplier.phone}`} className="flex items-center text-blue-600 hover:underline dark:text-blue-400"><Phone className="h-4 w-4 mr-2" />{supplier.phone}</a>
                ) : "N/A"}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[200px]">
                {supplier.email ? (
                  <a href={`mailto:${supplier.email}`} className="flex items-center text-blue-600 hover:underline dark:text-blue-400"><Mail className="h-4 w-4 mr-2" />{supplier.email}</a>
                ) : "N/A"}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[250px]">
                {supplier.address ? (
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{supplier.address}</span>
                ) : "N/A"}
              </TableCell>
              <TableCell className="flex justify-center space-x-2 py-3 px-6 min-w-[150px]">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(supplier)}
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
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el proveedor <span className="font-semibold">{supplier.name}</span> de nuestros servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                      <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(supplier.id)}
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

export default SupplierList;