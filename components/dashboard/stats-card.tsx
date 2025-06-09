import * as React from "react";
import {
  ArrowUpRight,
  ChevronDown,
  PieChart,
  Calendar,
  Mail,
  FileIcon,
  LucideIcon,
  CircleCheck,
  CircleX,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  label: string;
  value: string;
}

interface StatsCardProps {
  /**
   * The title of the stats card
   */
  title: string;
  /**
   * The numeric value to display
   */
  value: number | string;
  /**
   * The percentage value to display (will be formatted with + prefix)
   */
  percentage: number;
  /**
   * Optional description text to display below the value
   */
  description?: string;
  /**
   * Whether the card is in a loading state
   */
  isLoading?: boolean;
  /**
   * Optional CSS class name for additional styling
   */
  className?: string;
  /**
   * Optional filter options for the dropdown
   */
  filterOptions?: FilterOption[];
  /**
   * Currently selected filter value
   */
  selectedFilter?: string;
  /**
   * Callback function when filter selection changes
   */
  onFilterChange?: React.Dispatch<React.SetStateAction<string>>;
  /**
   * Optional icon to display in the card
   */
  icon?: LucideIcon;
  /**
   * Badge icon type - 'check' for positive states, 'x' for negative states
   */
  badgeIconType?: "check" | "x";
}

/**
 * StatsCard component for displaying statistics with a title, value, and trend indicator
 */
export function StatsCard({
  title,
  value,
  percentage,
  description,
  isLoading = false,
  className,
  filterOptions,
  selectedFilter,
  onFilterChange,
  icon: Icon,
  badgeIconType,
}: StatsCardProps) {
  // Determine if we should show the percentage (hide for "Totale Formulari")
  const showPercentage = title !== "Totale Formulari" && percentage > 0;

  // Determine which icon to show based on the selected filter
  const getBadgeIcon = () => {
    const selectedOption = filterOptions?.find(
      (option) => option.value === selectedFilter
    );

    if (!selectedOption) return null;

    // Check for specific filter labels that should show check icon
    if (
      selectedOption.label.toLowerCase().includes("con appuntamento") ||
      selectedOption.label.toLowerCase().includes("pec inviata")
    ) {
      return <CircleCheck className="h-4 w-4" />;
    }

    // Check for specific filter labels that should show X icon
    if (
      selectedOption.label.toLowerCase().includes("senza appuntamento") ||
      selectedOption.label.toLowerCase().includes("pec non inviata")
    ) {
      return <CircleX className="h-4 w-4" />;
    }

    // Use badgeIconType prop if provided
    if (badgeIconType === "check") {
      return <CircleCheck className="h-4 w-4" />;
    }

    if (badgeIconType === "x") {
      return <CircleX className="h-4 w-4" />;
    }

    // Default: no icon
    return null;
  };

  return (
    <Card className={`p-6 ${className || ""}`}>
      <CardHeader className="p-0 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          {filterOptions ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-lg font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                {title}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onFilterChange?.(option.value)}
                    className={
                      selectedFilter === option.value ? "bg-muted" : ""
                    }
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <CardTitle className="text-lg font-medium text-muted-foreground">
              {title}
            </CardTitle>
          )}
        </div>

        {filterOptions && (
          <Badge
            variant="outline"
            className="text-xs border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
          >
            {getBadgeIcon()}
            {filterOptions.find((option) => option.value === selectedFilter)
              ?.label || "Filter"}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0 pt-4 flex justify-between items-end">
        <div>
          <div className="text-3xl font-bold">{isLoading ? "..." : value}</div>
          {description && (
            <CardDescription className="pt-1">{description}</CardDescription>
          )}
        </div>
        {showPercentage && (
          <div className="flex justify-end items-center text-sm text-green-600 mt-2">
            {/* <ArrowUpRight className="mr-1 h-4 w-4" /> */}
            <span>{percentage}% del totale</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
