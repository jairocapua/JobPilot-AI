import type { ReactElement, ReactNode } from "react";

type Props = {
  activity: ReactNode;
};

type ChartDatum = {
  label: string;
  value: number;
};

type Point = {
  x: number;
  y: number;
};

const WEEKLY_RESEARCH: ChartDatum[] = [
  { label: "Mon", value: 2 },
  { label: "Tue", value: 5 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 8 },
  { label: "Fri", value: 12 },
  { label: "Sat", value: 4 },
  { label: "Sun", value: 1 },
];

const JOBS_OVER_TIME: ChartDatum[] = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 45 },
  { label: "Wed", value: 32 },
  { label: "Thu", value: 60 },
  { label: "Fri", value: 85 },
  { label: "Sat", value: 42 },
  { label: "Sun", value: 10 },
];

const MATCH_DISTRIBUTION: ChartDatum[] = [
  { label: "50-60%", value: 5 },
  { label: "60-70%", value: 15 },
  { label: "70-80%", value: 45 },
  { label: "80-90%", value: 85 },
  { label: "90-100%", value: 35 },
];

function buildSmoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const commands = [`M ${points[0].x} ${points[0].y}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const previous = points[index - 1] ?? current;
    const following = points[index + 2] ?? next;
    const controlOneX = current.x + (next.x - previous.x) / 6;
    const controlOneY = current.y + (next.y - previous.y) / 6;
    const controlTwoX = next.x - (following.x - current.x) / 6;
    const controlTwoY = next.y - (following.y - current.y) / 6;

    commands.push(
      `C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${next.x} ${next.y}`,
    );
  }

  return commands.join(" ");
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <section
      className={`rounded-xl border border-border bg-surface p-6 shadow-sm ${className}`}
    >
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

function BarChart({
  data,
  max,
  yTicks,
  fill,
}: {
  data: ChartDatum[];
  max: number;
  yTicks: number[];
  fill: string;
}): ReactElement {
  const width = 680;
  const height = 300;
  const left = 50;
  const right = 14;
  const top = 28;
  const bottom = 40;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const baseline = top + plotHeight;
  const slotWidth = plotWidth / data.length;
  const barWidth = 42;

  const yForValue = (value: number): number =>
    baseline - (value / max) * plotHeight;

  return (
    <div className="mt-8 h-[300px]">
      <svg
        role="img"
        aria-label="Bar chart"
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full overflow-visible"
      >
        {yTicks.map((tick) => {
          const y = yForValue(tick);

          return (
            <g key={tick}>
              <text
                x={left - 12}
                y={y + 5}
                textAnchor="end"
                className="fill-text-muted text-xs"
              >
                {tick}
              </text>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="4 4"
              />
            </g>
          );
        })}
        {data.map((item, index) => {
          const barHeight = baseline - yForValue(item.value);
          const x = left + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = baseline - barHeight;

          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={fill}
              />
              <text
                x={x + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                className="fill-text-muted text-xs"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function JobsLineChart(): ReactElement {
  const width = 860;
  const height = 310;
  const left = 48;
  const right = 18;
  const top = 22;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const baseline = top + plotHeight;
  const yTicks = [100, 75, 50, 25, 0];
  const slotWidth = plotWidth / (JOBS_OVER_TIME.length - 1);
  const points = JOBS_OVER_TIME.map((item, index) => ({
    x: left + index * slotWidth,
    y: baseline - (item.value / 100) * plotHeight,
  }));
  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;

  return (
    <div className="mt-8 h-[320px]">
      <svg
        role="img"
        aria-label="Jobs found over time"
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient id="jobsFoundGradient" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-accent)"
              stopOpacity="0.22"
            />
            <stop
              offset="100%"
              stopColor="var(--color-accent)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        {yTicks.map((tick) => {
          const y = baseline - (tick / 100) * plotHeight;

          return (
            <g key={tick}>
              <text
                x={left - 12}
                y={y + 5}
                textAnchor="end"
                className="fill-text-muted text-xs"
              >
                {tick}
              </text>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="4 4"
              />
            </g>
          );
        })}
        <path d={areaPath} fill="url(#jobsFoundGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeLinecap="round"
          strokeWidth="3"
        />
        {JOBS_OVER_TIME.map((item, index) => (
          <text
            key={item.label}
            x={left + index * slotWidth}
            y={height - 6}
            textAnchor="middle"
            className="fill-text-muted text-xs"
          >
            {item.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function AnalyticsCharts({ activity }: Props): ReactElement {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {activity}
        <ChartCard title="Company Research Activity" className="min-h-[410px]">
          <BarChart
            data={WEEKLY_RESEARCH}
            max={12}
            yTicks={[12, 9, 6, 3, 0]}
            fill="var(--color-info)"
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ChartCard title="Jobs Found Over Time" className="min-h-[380px]">
          <JobsLineChart />
        </ChartCard>

        <ChartCard title="Match Score Distribution" className="min-h-[380px]">
          <BarChart
            data={MATCH_DISTRIBUTION}
            max={100}
            yTicks={[100, 75, 50, 25, 0]}
            fill="var(--color-success)"
          />
        </ChartCard>
      </div>
    </>
  );
}
