import { NextRequest, NextResponse } from "next/server";

type CodeforcesResponse<T> = {
  status: "OK" | "FAILED";
  comment?: string;
  result: T;
};

type CodeforcesUser = {
  handle: string;
  rank?: string;
  rating?: number;
  maxRank?: string;
  maxRating?: number;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  titlePhoto?: string;
};

type CodeforcesRatingChange = {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
};

type CodeforcesSubmission = {
  id: number;
  creationTimeSeconds: number;
  verdict?: string;
  problem: {
    contestId?: number;
    index?: string;
    name: string;
    rating?: number;
  };
};

type DashboardPayload = {
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
  streak: {
    current: number;
    longest: number;
    activeDays: number;
    calendar: Array<{
      date: string;
      count: number;
    }>;
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

const CODEFORCES_API_BASE = "https://codeforces.com/api";

async function fetchCodeforces<T>(path: string): Promise<T> {
  const response = await fetch(`${CODEFORCES_API_BASE}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Codeforces request failed with ${response.status}`);
  }

  const payload = (await response.json()) as CodeforcesResponse<T>;

  if (payload.status !== "OK") {
    throw new Error(payload.comment ?? "Codeforces API returned a failure.");
  }

  return payload.result;
}

function formatDate(timestampSeconds: number, monthOnly = false) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    ...(monthOnly
      ? {}
      : {
          day: "numeric",
        }),
    timeZone: "UTC",
  }).format(new Date(timestampSeconds * 1000));
}

function buildProblemKey(submission: CodeforcesSubmission) {
  const { contestId, index, name } = submission.problem;
  return `${contestId ?? "unknown"}-${index ?? "na"}-${name}`;
}

function buildSolvedByRating(submissions: CodeforcesSubmission[]) {
  const solvedBuckets = new Map<number, number>();
  const solvedKeys = new Set<string>();

  for (const submission of submissions) {
    if (submission.verdict !== "OK") continue;

    const key = buildProblemKey(submission);
    if (solvedKeys.has(key)) continue;
    solvedKeys.add(key);

    const rating = submission.problem.rating;
    if (typeof rating !== "number") continue;

    const bucket = Math.floor(rating / 100) * 100;
    solvedBuckets.set(bucket, (solvedBuckets.get(bucket) ?? 0) + 1);
  }

  return Array.from(solvedBuckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rating, solved]) => ({
      rating: `${rating}`,
      solved,
    }));
}

function buildActivityWindow(submissions: CodeforcesSubmission[]) {
  if (submissions.length === 0) return "No recent activity";

  const windows = new Array<number>(12).fill(0);

  for (const submission of submissions) {
    const hour = new Date(submission.creationTimeSeconds * 1000).getUTCHours();
    const index = Math.floor(hour / 2);
    windows[index] += 1;
  }

  let bestIndex = 0;

  for (let index = 1; index < windows.length; index += 1) {
    if (windows[index] > windows[bestIndex]) {
      bestIndex = index;
    }
  }

  const start = `${String(bestIndex * 2).padStart(2, "0")}:00`;
  const end = `${String((bestIndex * 2 + 2) % 24).padStart(2, "0")}:00`;
  return `${start} - ${end} UTC`;
}

function toUtcDateKey(timestampSeconds: number) {
  return new Date(timestampSeconds * 1000).toISOString().slice(0, 10);
}

function buildStreakData(submissions: CodeforcesSubmission[]) {
  const dailyCounts = new Map<string, number>();

  for (const submission of submissions) {
    const dateKey = toUtcDateKey(submission.creationTimeSeconds);
    dailyCounts.set(dateKey, (dailyCounts.get(dateKey) ?? 0) + 1);
  }

  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const calendar: Array<{ date: string; count: number }> = [];

  for (let offset = 139; offset >= 0; offset -= 1) {
    const date = new Date(todayUtc);
    date.setUTCDate(todayUtc.getUTCDate() - offset);
    const dateKey = date.toISOString().slice(0, 10);
    calendar.push({
      date: dateKey,
      count: dailyCounts.get(dateKey) ?? 0,
    });
  }

  const sortedActiveDates = Array.from(dailyCounts.keys()).sort();

  let longest = 0;
  let running = 0;
  let previousDate: Date | null = null;

  for (const dateKey of sortedActiveDates) {
    const currentDate = new Date(`${dateKey}T00:00:00.000Z`);

    if (previousDate) {
      const diffDays =
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
      running = diffDays === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }

    longest = Math.max(longest, running);
    previousDate = currentDate;
  }

  let current = 0;
  for (let offset = 0; offset < 366; offset += 1) {
    const date = new Date(todayUtc);
    date.setUTCDate(todayUtc.getUTCDate() - offset);
    const dateKey = date.toISOString().slice(0, 10);

    if ((dailyCounts.get(dateKey) ?? 0) > 0) {
      current += 1;
    } else {
      break;
    }
  }

  return {
    current,
    longest,
    activeDays: dailyCounts.size,
    calendar,
  };
}

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle")?.trim();

  if (!handle) {
    return NextResponse.json(
      { error: "Missing required query parameter: handle" },
      { status: 400 },
    );
  }

  try {
    const [users, ratingHistory, submissions] = await Promise.all([
      fetchCodeforces<CodeforcesUser[]>(
        `/user.info?handles=${encodeURIComponent(handle)}`,
      ),
      fetchCodeforces<CodeforcesRatingChange[]>(
        `/user.rating?handle=${encodeURIComponent(handle)}`,
      ),
      fetchCodeforces<CodeforcesSubmission[]>(
        `/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`,
      ),
    ]);

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: `No Codeforces user found for "${handle}".` },
        { status: 404 },
      );
    }

    const acceptedProblemKeys = new Set<string>();
    for (const submission of submissions) {
      if (submission.verdict === "OK") {
        acceptedProblemKeys.add(buildProblemKey(submission));
      }
    }

    const averageRatingChange =
      ratingHistory.length === 0
        ? 0
        : ratingHistory.reduce(
            (sum, contest) => sum + (contest.newRating - contest.oldRating),
            0,
          ) / ratingHistory.length;
    const streak = buildStreakData(submissions);

    const payload: DashboardPayload = {
      profile: {
        handle: user.handle,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.handle,
        rank: user.rank ?? "Unrated",
        currentRating: user.rating ?? null,
        maxRating: user.maxRating ?? null,
        avatar: user.titlePhoto ?? user.avatar ?? null,
      },
      metrics: {
        totalSolved: acceptedProblemKeys.size,
        averageRatingChange,
        activeWindow: buildActivityWindow(submissions.slice(0, 500)),
        lastUpdatedAt: new Date().toISOString(),
      },
      streak,
      ratingHistory: ratingHistory.map((contest) => ({
        contest: contest.contestName,
        shortDate: formatDate(contest.ratingUpdateTimeSeconds, true),
        fullDate: formatDate(contest.ratingUpdateTimeSeconds, false),
        rating: contest.newRating,
        delta: contest.newRating - contest.oldRating,
        rank: contest.rank,
      })),
      solvedByRating: buildSolvedByRating(submissions),
      recentContests: ratingHistory
        .slice(-8)
        .reverse()
        .map((contest) => ({
          contestId: contest.contestId,
          name: contest.contestName,
          date: formatDate(contest.ratingUpdateTimeSeconds, false),
          rank: contest.rank,
          delta: contest.newRating - contest.oldRating,
          newRating: contest.newRating,
        })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Codeforces data.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
