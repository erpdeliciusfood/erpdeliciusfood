import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo"; // Import PageHeaderWithLogo
import { Frown } from "lucide-react"; // Import an icon for the not found page

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <PageHeaderWithLogo
          title="404 - Página no encontrada"
          description="Lo sentimos, la página que buscas no existe."
          icon={Frown}
        />
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Parece que te has perdido.
        </p>
        <a href="/" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 underline text-lg">
          Volver a la página de inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;