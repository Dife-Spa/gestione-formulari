import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StatsCardProps {
  /**
   * The title of the stats card
   */
  title: string
  /**
   * The numeric value to display
   */
  value: number | string
  /**
   * The percentage value to display (will be formatted with + prefix)
   */
  percentage: number
  /**
   * Optional description text to display below the value
   */
  description?: string
  /**
   * Whether the card is in a loading state
   */
  isLoading?: boolean
  /**
   * Optional CSS class name for additional styling
   */
  className?: string
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
}: StatsCardProps) {
  return (
    <Card className={`p-6 ${className || ''}`}>
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-medium text-muted-foreground">
          {title}
        </CardTitle>

      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="text-4xl font-bold">{isLoading ? '...' : value}</div>
        {/* {description && (
          <CardDescription className="pt-1">
            {description}
          </CardDescription>
        )} */}
      </CardContent>
      <div className="flex items-center text-sm text-green-600">
          <ArrowUpRight className="mr-1 h-4 w-4" />
          <span>+{percentage}%</span>
        </div>
    </Card>
  )
}