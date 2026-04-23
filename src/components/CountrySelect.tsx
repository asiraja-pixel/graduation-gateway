import * as React from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COUNTRIES_NATIONALITIES, CountryNationality } from "@/data/countries";

interface CountrySelectProps {
  value: string;
  onValueChange: (country: string, nationality: string, callingCode: string) => void;
  className?: string;
}

export function CountrySelect({ value, onValueChange, className }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCountry = COUNTRIES_NATIONALITIES.find(
    (c) => c.country === value || c.nationality === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedCountry ? (
            <span>
              {selectedCountry.country} ({selectedCountry.nationality})
            </span>
          ) : (
            <span className="text-muted-foreground">Select your <br/> nationality</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country or nationality..." />
          <CommandList>
            <CommandEmpty>No country or nationality found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES_NATIONALITIES.map((country) => (
                <CommandItem
                  key={country.country}
                  value={`${country.country} ${country.nationality}`}
                  onSelect={() => {
                    onValueChange(country.country, country.nationality, country.callingCode);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCountry?.country === country.country
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{country.country}</span>
                    <span className="text-xs text-muted-foreground">
                      {country.nationality} • {country.callingCode}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
