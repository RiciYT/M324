import { Cell, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/chart";
import { cn } from "@/lib/utils";

const chartConfig = {
  coins: {
    label: "Coins",
  },
  yes: {
    color: "#c8ff00",
    label: "Ja",
  },
  no: {
    color: "var(--destructive)",
    label: "Nein",
  },
} satisfies ChartConfig;

const emptyChartData = [
  { fill: "var(--color-yes)", name: "Ja", result: "yes", coins: 1 },
  { fill: "var(--color-no)", name: "Nein", result: "no", coins: 1 },
] as const;

interface MarketPoolChartProps {
  className?: string;
  noPool: number;
  yesPool: number;
}

export function MarketPoolChart({
  className,
  noPool,
  yesPool,
}: MarketPoolChartProps) {
  const hasPool = yesPool + noPool > 0;
  const chartData = hasPool
    ? [
        { fill: "var(--color-yes)", name: "Ja", result: "yes", coins: yesPool },
        { fill: "var(--color-no)", name: "Nein", result: "no", coins: noPool },
      ]
    : emptyChartData;

  return (
    <ChartContainer
      className={cn("mx-auto aspect-square min-h-[180px] w-full", className)}
      config={chartConfig}
    >
      <PieChart accessibilityLayer>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <>
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-medium font-mono text-foreground tabular-nums">
                    {hasPool ? Number(value).toLocaleString("de-CH") : 0} Coins
                  </span>
                </>
              )}
              hideLabel
              nameKey="result"
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="coins"
          innerRadius="58%"
          nameKey="result"
          outerRadius="88%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {chartData.map((entry) => (
            <Cell fill={entry.fill} key={entry.result} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
