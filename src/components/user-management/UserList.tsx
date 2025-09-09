import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";
import { Profile } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateProfile } from "@/hooks/useProfile";
import { showSuccess, showError } from "@/utils/toast";

interface UserListProps {
  users: Profile[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const updateProfileMutation = useUpdateProfile();

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      // The useUpdateProfile hook gets the userId from the session,
      // so we only need to pass the profile data to update.
      // We pass the existing first_name and last_name to avoid overwriting them with null.
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) {
        showError("Usuario no encontrado para actualizar.");
        return;
      }
      await updateProfileMutation.mutateAsync({
        first_name: userToUpdate.first_name,
        last_name: userToUpdate.last_name,
        role: newRole
      });
      showSuccess("Rol de usuario actualizado exitosamente.");
    } catch (error: any) {
      showError(`Error al actualizar el rol: ${error.message}`);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <Users className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl">No hay usuarios registrados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Email</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Nombre</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Rol</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((userProfile) => (
            <TableRow key={userProfile.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6">
                {userProfile.email || "N/A"} {/* Display actual email */}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {userProfile.first_name || "N/A"} {userProfile.last_name || ""}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                <Select
                  onValueChange={(value: 'user' | 'admin') => handleRoleChange(userProfile.id, value)}
                  defaultValue={userProfile.role}
                  disabled={updateProfileMutation.isPending}
                >
                  <SelectTrigger className="w-[180px] h-10 text-base">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="flex justify-center space-x-2 py-3 px-6">
                {/* Add any other user management actions here */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;