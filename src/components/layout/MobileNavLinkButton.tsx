import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileNavLinkButtonProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const MobileNavLinkButton: React.FC<MobileNavLinkButtonProps> = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} onClick={onClick}>
      <Button
        variant="ghost"
        className={cn(
          "justify-start text-lg px-5 py-3.5 h-auto w-full", // Increased padding
          "text-sidebar-foreground dark:text-sidebar-primary-foreground",
          "hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent/50 dark:bg-sidebar-accent-foreground/50 font-semibold"
        )}
      >
        <Icon className="mr-3 h-6 w-6" />
        {label}
      </Button>
    </Link>
  );
};

export default MobileNavLinkButton;