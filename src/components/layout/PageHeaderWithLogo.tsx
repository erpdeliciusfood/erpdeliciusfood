import React from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderWithLogoProps {
  title: string;
  description?: string;
  icon?: LucideIcon; // Optional icon for the page title
}

const PageHeaderWithLogo: React.FC<PageHeaderWithLogoProps> = ({ title, description, icon: Icon }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div className="flex items-center mb-4 md:mb-0">
        <img src="/logo-erp.png" alt="App Logo" className="h-12 w-auto mr-3" /> {/* Cambiado de h-10 a h-12 */}
        {/* <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">ERP App</span> */}
      </div>
      <div className="flex flex-col md:items-end">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center">
          {Icon && <Icon className="mr-4 h-10 w-10 text-primary dark:text-primary-foreground" />}
          {title}
        </h1>
        {description && (
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2 md:text-right">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeaderWithLogo;