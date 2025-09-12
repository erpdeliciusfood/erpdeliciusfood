import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar"; // Import the new Sidebar component

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen"> {/* Changed to flex to accommodate sidebar */}
      <Sidebar /> {/* Render the Sidebar */}
      <div className="flex flex-col flex-grow"> {/* Main content area */}
        <Header />
        <main className="flex-grow overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;