"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Search,
  Swords,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";

type DashboardData = {
  profile: {
    handle: string;
    name: string;
    rank: string;
    currentRating: number | null;
    maxRating: number | null;
    avatar: string | null;
  };
  metrics: {
    totalSolved: number;
    averageRatingChange: number;
    activeWindow: string;
    lastUpdatedAt: string;
  };
  ratingHistory: Array<{
    contest: string;
    shortDate: string;
    fullDate: string;
    rating: number;
    delta: number;
    rank: number;
  }>;
  solvedByRating: Array<{
    rating: string;
    solved: number;
    fill?: string;
  }>;
  recentContests: Array<{
    contestId: number;
    name: string;
    date: string;
    rank: number;
    delta: number;
    newRating: number;
  }>;
};

const chartColors = [
  "#38bdf8",
  "#22c55e",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

function formatDelta(delta: number) {
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`;
}

function formatTooltipValue(
  value: number | string | readonly (number | string)[] | undefined,
  label: string,
) {
  if (Array.isArray(value)) {
    return [value.join(", "), label];
  }

  return [typeof value === "number" || typeof value === "string" ? value : "-", label];
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card/90 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-primary">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export function CodeforcesDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialHandle = searchParams.get("handle") ?? "";
  const [inputValue, setInputValue] = useState(initialHandle);
  const [activeHandle, setActiveHandle] = useState(initialHandle);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadDashboard(handle: string) {
    const normalized = handle.trim();
    if (!normalized) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/codeforces?handle=${encodeURIComponent(normalized)}`,
        {
          cache: "no-store",
        },
      );

      const payload = (await response.json()) as DashboardData & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to fetch Codeforces data.");
      }

      setData(payload);
      setActiveHandle(normalized);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to fetch Codeforces data.";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialHandle) return;
    void loadDashboard(initialHandle);
  }, [initialHandle]);

  useEffect(() => {
    if (!activeHandle) return;

    const timer = window.setInterval(() => {
      void loadDashboard(activeHandle);
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [activeHandle]);

  const contestCount = data?.ratingHistory.length ?? 0;
  const ratingChartData = useMemo(() => {
    if (!data) return [];

    return data.ratingHistory.map((point, index) => ({
      ...point,
      pointKey: `${point.fullDate}-${point.contest}-${index}`,
      tickLabel: point.shortDate,
    }));
  }, [data]);
  const chartCeiling = useMemo(() => {
    if (!data) return undefined;

    const historyMax = data.ratingHistory.reduce(
      (max, point) => Math.max(max, point.rating),
      Number.NEGATIVE_INFINITY,
    );
    const peak = Math.max(
      data.profile.maxRating ?? Number.NEGATIVE_INFINITY,
      historyMax,
    );

    if (!Number.isFinite(peak)) return undefined;

    return Math.ceil((peak + 50) / 50) * 50;
  }, [data]);
  const updatedLabel = useMemo(() => {
    if (!data?.metrics.lastUpdatedAt) return "";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(data.metrics.lastUpdatedAt));
  }, [data?.metrics.lastUpdatedAt]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = inputValue.trim();
    if (!normalized) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("handle", normalized);
    router.replace(`${pathname}?${params.toString()}`);
    void loadDashboard(normalized);
  }

  return (
    <section className="min-h-screen bg-background px-4 py-10 text-foreground md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="overflow-hidden rounded-4xl border border-border/60 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.9))] p-6 text-white shadow-2xl shadow-slate-950/20 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300/90">
                Codeforces Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                Enter a Codeforces handle, then inspect live profile performance.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                The dashboard pulls live data for the selected ID and shows total
                solved problems, current rating, average rating change per contest,
                the most active submission window, rating trend, solved-by-rating
                breakdown, and recent contests.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur md:flex-row"
            >
              <label className="sr-only" htmlFor="cf-handle">
                Codeforces handle
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="cf-handle"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Enter Codeforces handle"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </div>
              <Button type="submit" className="h-12 rounded-2xl px-6">
                Show Dashboard
              </Button>
            </form>
          </div>
        </div>

        {!activeHandle && !loading ? (
          <div className="rounded-4xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <p className="text-lg font-semibold">Enter a Codeforces ID to begin.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Example handles: `tourist`, `Benq`, `Petr`.
            </p>
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-60 items-center justify-center rounded-4xl border border-border bg-card/70">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Fetching live Codeforces data...
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-4xl border border-rose-500/20 bg-rose-500/10 px-6 py-5 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {data ? (
          <>
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-4xl border border-border/60 bg-card/90 p-6 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-muted font-black uppercase text-primary">
                      {data.profile.handle.slice(0, 2)}
                      {data.profile.avatar ? null : (
                        <span className="sr-only">{data.profile.handle}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Handle</p>
                      <h2 className="text-3xl font-black tracking-tight">
                        {data.profile.handle}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {data.profile.name} · {data.profile.rank}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl border border-border px-4 py-3 text-sm">
                      <p className="text-muted-foreground">Last updated</p>
                      <p className="font-semibold">{updatedLabel}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => void loadDashboard(activeHandle)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Total Questions Done"
                  value={String(data.metrics.totalSolved)}
                  hint="Unique accepted problems from the fetched submission history."
                  icon={<Trophy className="h-5 w-5" />}
                />
                <MetricCard
                  label="Current Rating"
                  value={data.profile.currentRating?.toString() ?? "Unrated"}
                  hint={`Max rating: ${data.profile.maxRating ?? "N/A"}`}
                  icon={<Activity className="h-5 w-5" />}
                />
                <MetricCard
                  label="Average Rating Change"
                  value={formatDelta(data.metrics.averageRatingChange)}
                  hint={`Computed across ${contestCount} rated contests.`}
                  icon={<BarChart3 className="h-5 w-5" />}
                />
                <MetricCard
                  label="Most Active On CF"
                  value={data.metrics.activeWindow}
                  hint="Based on recent submission timestamps in UTC."
                  icon={<Clock3 className="h-5 w-5" />}
                />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-4xl border border-border/60 bg-card/90 p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold">Current Rating Graph</h3>
                  <p className="text-sm text-muted-foreground">
                    Rating after each rated Codeforces contest. Peak rating is taken
                    from the live profile data.
                  </p>
                </div>
                <div className="h-85 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={ratingChartData}
                      margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis
                        dataKey="pointKey"
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                        tickFormatter={(_, index) =>
                          ratingChartData[index]?.tickLabel ?? ""
                        }
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={48}
                        domain={[ "dataMin - 50", chartCeiling ?? "dataMax + 50" ]}
                      />
                      <Tooltip
                        formatter={(value) => formatTooltipValue(value, "Rating")}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.contest ?? "Contest"
                        }
                      />
                      <Legend />
                      {typeof data.profile.maxRating === "number" ? (
                        <ReferenceLine
                          y={data.profile.maxRating}
                          stroke="#f59e0b"
                          strokeDasharray="6 6"
                          label={{
                            value: `Max ${data.profile.maxRating}`,
                            fill: "currentColor",
                            fontSize: 12,
                            position: "insideTopRight",
                          }}
                        />
                      ) : null}
                      <Line
                        type="monotone"
                        dataKey="rating"
                        name="Current rating"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={{ r: 3, strokeWidth: 2, fill: "#38bdf8" }}
                        activeDot={{ r: 6, strokeWidth: 2, fill: "#0f172a" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-4xl border border-border/60 bg-card/90 p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold">Questions Done By Rating</h3>
                  <p className="text-sm text-muted-foreground">
                    Unique accepted problems grouped by their Codeforces difficulty.
                  </p>
                </div>
                <div className="h-85 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.solvedByRating.map((entry, index) => ({
                        ...entry,
                        fill: chartColors[index % chartColors.length],
                      }))}
                      margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis dataKey="rating" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={36} />
                      <Tooltip formatter={(value) => formatTooltipValue(value, "Solved")} />
                      <Bar dataKey="solved" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rounded-4xl border border-border/60 bg-card/90 p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <Swords className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Latest Contest Given</h3>
                  <p className="text-sm text-muted-foreground">
                    Recent Codeforces contests for the selected handle.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {data.recentContests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                    No rated contests found for this handle.
                  </div>
                ) : (
                  data.recentContests.map((contest) => (
                    <div
                      key={`${contest.contestId}-${contest.name}`}
                      className="grid gap-3 rounded-2xl border border-border/60 px-4 py-4 md:grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr]"
                    >
                      <div>
                        <p className="font-semibold">{contest.name}</p>
                        <p className="text-sm text-muted-foreground">{contest.date}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Rank
                        </p>
                        <p className="font-medium">#{contest.rank}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Delta
                        </p>
                        <p
                          className={
                            contest.delta >= 0
                              ? "font-medium text-emerald-500"
                              : "font-medium text-rose-500"
                          }
                        >
                          {contest.delta >= 0 ? "+" : ""}
                          {contest.delta}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          New rating
                        </p>
                        <p className="font-medium">{contest.newRating}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
