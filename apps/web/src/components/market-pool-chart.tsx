import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/chart";
import { cn } from "@/lib/utils";

const chartConfig = {
  yes: {
    color: "#c8ff00",
    label: "Ja",
  },
  no: {
    color: "var(--destructive)",
    label: "Nein",
  },
} satisfies ChartConfig;

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
  const chartData = createPoolSeries({ noPool, yesPool });

  return (
    <ChartContainer
      className={cn("h-28 min-h-0 w-full", className)}
      config={chartConfig}
    >
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 0, right: 0 }}
      >
        <defs>
          <linearGradient id="fillYes" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-yes)" stopOpacity={0.65} />
            <stop
              offset="95%"
              stopColor="var(--color-yes)"
              stopOpacity={0.08}
            />
          </linearGradient>
          <linearGradient id="fillNo" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-no)" stopOpacity={0.55} />
            <stop offset="95%" stopColor="var(--color-no)" stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="label"
          minTickGap={18}
          tickLine={false}
          tickMargin={8}
        />
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
              indicator="dot"
            />
          }
          cursor={false}
        />
        <Area
          dataKey="no"
          fill="url(#fillNo)"
          stackId="pool"
          stroke="var(--color-no)"
          type="natural"
        />
        <Area
          dataKey="yes"
          fill="url(#fillYes)"
          stackId="pool"
          stroke="var(--color-yes)"
          type="natural"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}

function createPoolSeries({
  noPool,
  yesPool,
}: {
  noPool: number;
  yesPool: number;
}) {
  const totalPool = noPool + yesPool;

  if (totalPool === 0) {
    return [
      { label: "Start", yes: 1, no: 1 },
      { label: "Jetzt", yes: 1, no: 1 },
    ];
  }

  return [
    {
      label: "Start",
      yes: Math.round(yesPool * 0.25),
      no: Math.round(noPool * 0.25),
    },
    {
      label: "Mitte",
      yes: Math.round(yesPool * 0.65),
      no: Math.round(noPool * 0.65),
    },
    { label: "Jetzt", yes: yesPool, no: noPool },
  ];
}
