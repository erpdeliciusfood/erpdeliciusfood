import React from "react";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow overflow-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"> {/* Añadido padding responsivo aquí */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;