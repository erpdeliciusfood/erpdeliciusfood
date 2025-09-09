import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Bienvenido a tu ERP</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          Gestiona tus operaciones de restaurante de forma eficiente.
        </p>
        <Link to="/insumos">
          <Button className="w-full px-8 py-4 text-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 ease-in-out shadow-md hover:shadow-lg">
            <Utensils className="mr-3 h-6 w-6" />
            Ir a Gestión de Insumos
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;