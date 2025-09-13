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
import { Receta, RECETA_CATEGORIES } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchableRecetaSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  availableRecetas: Receta[] | undefined;
}

const SearchableRecetaSelect: React.FC<SearchableRecetaSelectProps> = ({
  value,
  onChange,
  disabled,
  availableRecetas,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS"); // Default to 'TODOS'

  const selectedReceta = availableRecetas?.find((receta) => receta.id === value);

  const filteredRecetas = availableRecetas
    ?.filter(receta => {
      const matchesSearch = receta.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "TODOS" || receta.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

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
          {selectedReceta
            ? `${selectedReceta.nombre} (${selectedReceta.category})`
            : "Selecciona una receta..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[400px] overflow-y-auto">
        <Command>
          <div className="p-2 border-b dark:border-gray-700">
            <CommandInput
              placeholder="Buscar receta..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Select onValueChange={setSelectedCategory} value={selectedCategory} disabled={disabled}>
              <SelectTrigger className="mt-2 h-10 text-base">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas las Categorías</SelectItem>
                {RECETA_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CommandList>
            <CommandEmpty>No se encontraron recetas.</CommandEmpty>
            <CommandGroup>
              {filteredRecetas?.map((receta) => (
                <CommandItem
                  key={receta.id}
                  value={`${receta.nombre} (${receta.category})`}
                  onSelect={() => {
                    onChange(receta.id);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === receta.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {receta.nombre} ({receta.category})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableRecetaSelect;