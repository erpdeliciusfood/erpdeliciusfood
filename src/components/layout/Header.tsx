import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { ModeToggle } from "./ModeToggle";
import Navbar from "./Navbar"; // Import the new Navbar component

const Header: React.FC = () => {
  const { session } = useSession();
  const userRole = session?.user?.user_metadata?.role;

  if (!session) {
    return null;
  }

  return (
    <header className="bg-primary dark:bg-primary-foreground text-primary-foreground dark:text-primary p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="text-2xl font-bold flex items-center flex-shrink-0">
          <Home className="mr-2 h-6 w-6" />
          ERP App
        </Link>
        <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
          <Navbar userRole={userRole} />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;