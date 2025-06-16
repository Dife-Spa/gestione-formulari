"use client";

import { useState, useEffect } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/lib/supabase";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

type DailyEmissionData = {
  date: string;
  count: number;
  displayDate: string;
};

const chartConfig = {
  count: {
    label: "Formulari",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

/**
 * FormulariEmissionStats component for displaying daily formulari creation statistics
 * over the last 2 months
 */
export function FormulariEmissionStats() {
  const [chartData, setChartData] = useState<DailyEmissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalFormulari, setTotalFormulari] = useState(0);
  const [averageDaily, setAverageDaily] = useState(0);

  useEffect(() => {
    fetchEmissionData();
  }, []);

  /**
   * Fetches formulari creation data for the last 2 months
   */
  async function fetchEmissionData() {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range (2 months ago to today)
      const today = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(today.getMonth() - 2);

      // Fetch formulari data from the last 2 months
      const { data, error } = await supabase
        .from("formulari")
        .select("data_emissione")
        .gte("data_emissione", twoMonthsAgo.toISOString())
        .lte("data_emissione", today.toISOString())
        .order("data_emissione", { ascending: true });

      if (error) throw error;

      // Process data to group by day
      const dailyCounts: { [key: string]: number } = {};

      // Initialize all days in the range with 0
      const currentDate = new Date(twoMonthsAgo);
      while (currentDate <= today) {
        const dateKey = currentDate.toISOString().split("T")[0];
        dailyCounts[dateKey] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Count formulari per day
      data.forEach((formulario) => {
        const date = new Date(formulario.data_emissione);
        const dateKey = date.toISOString().split("T")[0];
        if (dailyCounts.hasOwnProperty(dateKey)) {
          dailyCounts[dateKey]++;
        }
      });

      // Convert to chart data format
      const processedData: DailyEmissionData[] = Object.entries(dailyCounts)
        .map(([date, count]) => {
          const dateObj = new Date(date);
          return {
            date,
            count,
            displayDate: dateObj.toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "2-digit",
            }),
          };
        })
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setChartData(processedData);

      // Calculate statistics
      const total = processedData.reduce((sum, item) => sum + item.count, 0);
      const average = total / processedData.length;
      setTotalFormulari(total);
      setAverageDaily(Math.round(average * 10) / 10);
    } catch (error) {
      console.error("Error fetching emission data:", error);
      setError("Impossibile caricare i dati delle emissioni");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Format date range for display
   */
  function getDateRangeText() {
    if (chartData.length === 0) return "";

    const startDate = new Date(chartData[0].date);
    const endDate = new Date(chartData[chartData.length - 1].date);

    return `${startDate.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })} - ${endDate.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`;
  }

  /**
   * Calculate trend percentage
   */
  function getTrendPercentage() {
    if (chartData.length < 14) return null;

    // Compare last 7 days with previous 7 days
    const lastWeek = chartData
      .slice(-7)
      .reduce((sum, item) => sum + item.count, 0);
    const previousWeek = chartData
      .slice(-14, -7)
      .reduce((sum, item) => sum + item.count, 0);

    if (previousWeek === 0) return null;

    const percentage = ((lastWeek - previousWeek) / previousWeek) * 100;
    return Math.round(percentage * 10) / 10;
  }

  const trendPercentage = getTrendPercentage();

  return (
    <Card className="bg-card rounded-xl border shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Emissioni Formulari Giornaliere
            </CardTitle>
            <CardDescription>
              {isLoading ? "Caricamento..." : "Statistiche delle emissioni giornaliere"}
            </CardDescription>
          </div>
          {!isLoading && !error && (
            <div className="flex gap-2">
              <Badge 
                variant="outline" 
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              >
                {getDateRangeText()}
              </Badge>
              <Badge 
                variant="outline" 
                className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              >
                Totale: {totalFormulari}
              </Badge>
              <Badge 
                variant="outline" 
                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              >
                Media: {averageDaily}/giorno
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-muted-foreground">Caricamento dati...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              height={200}
              margin={{
                top: 20,
                right: 12,
                left: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DailyEmissionData;
                    const fullDate = new Date(data.date).toLocaleDateString(
                      "it-IT",
                      {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    );
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{fullDate}</p>
                        <p className="text-primary">
                          {payload[0].value} formulari emessi
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                <LabelList
                  position="top"
                  offset={8}
                  className="fill-foreground"
                  fontSize={0}
                  formatter={(value: number) => (value > 0 ? value : "")}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {!isLoading && !error && (
          <div className="text-muted-foreground leading-none">
            Visualizzazione delle emissioni formulari negli ultimi due mesi
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
