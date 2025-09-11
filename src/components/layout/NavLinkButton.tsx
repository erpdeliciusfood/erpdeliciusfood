import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavLinkButtonProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const NavLinkButton: React.FC<NavLinkButtonProps> = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} onClick={onClick}>
      <Button
        variant="ghost"
        className={cn(
          "px-4 py-2 text-base h-10",
          "text-primary-foreground dark:text-primary",
          "hover:bg-primary-foreground/20 dark:hover:bg-primary/20",
          isActive && "bg-primary-foreground/30 dark:bg-primary/30 font-semibold"
        )}
      >
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
};

export default NavLinkButton;