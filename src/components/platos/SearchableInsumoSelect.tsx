import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Insumo } from "@/types";

interface SearchableInsumoSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  availableInsumos: Insumo[] | undefined;
}

const SearchableInsumoSelect: React.FC<SearchableInsumoSelectProps> = ({
  value,
  onChange,
  disabled,
  availableInsumos,
}) => {
  const [open, setOpen] = useState(false);

  const selectedInsumo = availableInsumos?.find((insumo) => insumo.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 text-base"
          disabled={disabled}
        >
          {selectedInsumo
            ? `${selectedInsumo.nombre} (${selectedInsumo.base_unit})`
            : "Selecciona un insumo..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[300px] overflow-y-auto">
        <Command>
          <CommandInput placeholder="Buscar insumo..." />
          <CommandList>
            <CommandEmpty>No se encontraron insumos.</CommandEmpty>
            <CommandGroup>
              {availableInsumos?.map((insumo) => (
                <CommandItem
                  key={insumo.id}
                  value={`${insumo.nombre} (${insumo.base_unit})`}
                  onSelect={() => {
                    onChange(insumo.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === insumo.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {insumo.nombre} ({insumo.base_unit})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableInsumoSelect;