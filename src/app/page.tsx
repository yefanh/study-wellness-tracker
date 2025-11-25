"use client";

import { useEffect, useMemo, useState } from "react";

type StudySession = {
  id: string;
  startedAt: string;
  endedAt?: string | null;
  focusArea?: string | null;
  notes?: string | null;
  durationMinutes?: number | null;
};

type Break = {
  id: string;
  startedAt: string;
  endedAt?: string | null;
  type: "SHORT" | "LONG" | "MOVEMENT" | "MEAL" | "OTHER";
  notes?: string | null;
  durationMinutes?: number | null;
};

type MoodLog = {
  id: string;
  recordedAt: string;
  mood: number;
  energy?: number | null;
  stress?: number | null;
  notes?: string | null;
};

type HabitCheckIn = {
  id: string;
  completedAt: string;
  value?: number | null;
  notes?: string | null;
};

type Habit = {
  id: string;
  name: string;
  targetPerWeek?: number | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  checkIns: HabitCheckIn[];
};

type DashboardData = {
  me: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  studySessions: StudySession[];
  breaks: Break[];
  moodLogs: MoodLog[];
  habits: Habit[];
};

const DASHBOARD_QUERY = /* GraphQL */ `
  query DashboardData {
    me {
      id
      name
      email
    }
    studySessions {
      id
      startedAt
      endedAt
      focusArea
      notes
      durationMinutes
    }
    breaks {
      id
      startedAt
      endedAt
      type
      notes
      durationMinutes
    }
    moodLogs {
      id
      recordedAt
      mood
      energy
      stress
      notes
    }
    habits {
      id
      name
      targetPerWeek
      archived
      createdAt
      updatedAt
      checkIns {
        id
        completedAt
        value
        notes
      }
    }
  }
`;

const START_SESSION_MUTATION = /* GraphQL */ `
  mutation StartSession($input: StartStudySessionInput!) {
    startStudySession(input: $input) {
      id
      startedAt
      focusArea
    }
  }
`;

const END_SESSION_MUTATION = /* GraphQL */ `
  mutation EndSession($input: EndStudySessionInput!) {
    endStudySession(input: $input) {
      id
      endedAt
      durationMinutes
    }
  }
`;

const LOG_BREAK_MUTATION = /* GraphQL */ `
  mutation LogBreak($input: LogBreakInput!) {
    logBreak(input: $input) {
      id
    }
  }
`;

const LOG_MOOD_MUTATION = /* GraphQL */ `
  mutation LogMood($input: LogMoodInput!) {
    logMood(input: $input) {
      id
      recordedAt
      mood
    }
  }
`;

const CREATE_HABIT_MUTATION = /* GraphQL */ `
  mutation CreateHabit($input: CreateHabitInput!) {
    createHabit(input: $input) {
      id
      name
    }
  }
`;

const CHECKIN_HABIT_MUTATION = /* GraphQL */ `
  mutation CheckIn($input: HabitCheckInInput!) {
    checkInHabit(input: $input) {
      id
    }
  }
`;

async function graphqlFetch<T>(query: string, variables?: Record<string, unknown>) {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GraphQL request failed with status ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }
  return json.data as T;
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function minutesLabel(minutes?: number | null) {
  if (minutes == null) return "—";
  return `${minutes}m`;
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{label}</span>
        <span>{clamped.toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-black/5">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-black">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

type FormState = {
  focusArea: string;
  notes: string;
  breakType: Break["type"];
  mood: number;
  energy?: number | null;
  stress?: number | null;
  habitName: string;
  habitTarget?: number | null;
  checkInHabitId?: string;
  checkInValue?: number | null;
  checkInNotes?: string;
};

const initialForm: FormState = {
  focusArea: "",
  notes: "",
  breakType: "SHORT",
  mood: 3,
  energy: null,
  stress: null,
  habitName: "",
  habitTarget: null,
  checkInHabitId: undefined,
  checkInValue: null,
  checkInNotes: "",
};

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const nextData = await graphqlFetch<DashboardData>(DASHBOARD_QUERY);
      setData(nextData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const ongoingSession = useMemo(
    () => data?.studySessions.find((s) => !s.endedAt) ?? null,
    [data?.studySessions]
  );

  const weeklyWindowStart = useMemo(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), []);

  const weeklyStudyMinutes = useMemo(() => {
    if (!data) return 0;
    return data.studySessions
      .filter((s) => new Date(s.startedAt) >= weeklyWindowStart)
      .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  }, [data, weeklyWindowStart]);

  const weeklyBreaks = useMemo(() => {
    if (!data) return 0;
    return data.breaks.filter((b) => new Date(b.startedAt) >= weeklyWindowStart).length;
  }, [data, weeklyWindowStart]);

  const latestMood = useMemo(() => {
    if (!data?.moodLogs.length) return null;
    return [...data.moodLogs].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];
  }, [data?.moodLogs]);

  const avgMood = useMemo(() => {
    if (!data?.moodLogs.length) return 0;
    const recent = data.moodLogs.filter((m) => new Date(m.recordedAt) >= weeklyWindowStart);
    if (!recent.length) return 0;
    const total = recent.reduce((sum, m) => sum + m.mood, 0);
    return total / recent.length;
  }, [data?.moodLogs, weeklyWindowStart]);

  const handleStartSession = async () => {
    try {
      setSaving(true);
      await graphqlFetch(START_SESSION_MUTATION, {
        input: {
          focusArea: form.focusArea || null,
          notes: form.notes || null,
        },
      });
      setForm((prev) => ({ ...prev, focusArea: "", notes: "" }));
      await fetchDashboard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleEndSession = async () => {
    if (!ongoingSession) return;
    try {
      setSaving(true);
      await graphqlFetch(END_SESSION_MUTATION, {
        input: { id: ongoingSession.id },
      });
      await fetchDashboard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogBreak = async () => {
    try {
      setSaving(true);
      await graphqlFetch(LOG_BREAK_MUTATION, {
        input: {
          type: form.breakType,
          notes: form.notes || null,
        },
      });
      setForm((prev) => ({ ...prev, notes: "" }));
      await fetchDashboard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogMood = async () => {
    try {
      setSaving(true);
      await graphqlFetch(LOG_MOOD_MUTATION, {
        input: {
          mood: Number(form.mood),
          energy: form.energy ?? null,
          stress: form.stress ?? null,
          notes: form.notes || null,
        },
      });
      setForm((prev) => ({ ...prev, mood: 3, energy: null, stress: null, notes: "" }));
      await fetchDashboard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateHabit = async () => {
    if (!form.habitName.trim()) return;
    try {
      setSaving(true);
      await graphqlFetch(CREATE_HABIT_MUTATION, {
        input: { name: form.habitName, targetPerWeek: form.habitTarget ?? null },
      });
      setForm((prev) => ({ ...prev, habitName: "", habitTarget: null }));
      await fetchDashboard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckInHabit = async () => {
    if (!form.checkInHabitId) return;
    try {
      setSaving(true);
      await graphqlFetch(CHECKIN_HABIT_MUTATION, {
        input: {
          habitId: form.checkInHabitId,
          value: form.checkInValue ?? null,
          notes: form.checkInNotes || null,
        },
      });
      setForm((prev) => ({ ...prev, checkInValue: null, checkInNotes: "" }));
      await fetchDashboard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 px-4 py-10 text-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Study & Wellness Tracker</p>
            <h1 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
              Focus, breaks, mood — all in one place
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Capture sessions, track habits, and watch your weekly trends.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            {data?.me?.email ?? "Demo user"}
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard title="Weekly focus time" value={`${weeklyStudyMinutes} min`} hint="Past 7 days" />
          <StatCard
            title="Breaks logged"
            value={weeklyBreaks.toString()}
            hint="Past 7 days"
          />
          <StatCard
            title="Avg mood (7d)"
            value={avgMood ? avgMood.toFixed(1) : "N/A"}
            hint={latestMood ? `Last: ${latestMood.mood}/5` : "Log a mood to start"}
          />
          <StatCard
            title="Habits active"
            value={(data?.habits.filter((h) => !h.archived).length ?? 0).toString()}
            hint="Manage habits below"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-md backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Focus sessions</h2>
              {ongoingSession ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  In progress
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              ) : (
                <span className="text-xs text-slate-500">No active session</span>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Focus area</label>
                <input
                  value={form.focusArea}
                  onChange={(e) => setForm((prev) => ({ ...prev, focusArea: e.target.value }))}
                  placeholder="Deep work, notes, etc."
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Notes</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Anything noteworthy?"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleStartSession}
                disabled={saving || Boolean(ongoingSession)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
              >
                {ongoingSession ? "Session running" : "Start session"}
              </button>
              <button
                onClick={handleEndSession}
                disabled={saving || !ongoingSession}
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-black/5 disabled:text-slate-500"
              >
                End session
              </button>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-500">Recent sessions</h3>
              <div className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white">
                {loading && <div className="px-4 py-3 text-sm text-slate-500">Loading…</div>}
                {!loading && data?.studySessions.length === 0 && (
                  <div className="px-4 py-3 text-sm text-slate-500">
                    No sessions yet. Start one to track focus time.
                  </div>
                )}
                {data?.studySessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">
                        {session.focusArea || "Focused work"}
                        {session.endedAt ? null : (
                          <span className="ml-2 text-xs text-emerald-600">(active)</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {minutesLabel(session.durationMinutes)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDateTime(session.startedAt)} → {formatDateTime(session.endedAt)}
                    </div>
                    {session.notes ? (
                      <div className="mt-1 text-xs text-slate-500">{session.notes}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-md backdrop-blur">
            <h2 className="text-lg font-semibold">Breaks & mood</h2>
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-500">Break type</label>
                <select
                  value={form.breakType}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, breakType: e.target.value as Break["type"] }))
                  }
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  <option value="SHORT">Short</option>
                  <option value="LONG">Long</option>
                  <option value="MOVEMENT">Movement</option>
                  <option value="MEAL">Meal</option>
                  <option value="OTHER">Other</option>
                </select>
                <button
                  onClick={handleLogBreak}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-black/5"
                >
                  Log break
                </button>
              </div>
              <div className="space-y-2 rounded-2xl border border-black/5 bg-sky-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Current mood</span>
                  <span className="text-slate-500">1-5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.mood}
                  onChange={(e) => setForm((prev) => ({ ...prev, mood: Number(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.energy ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        energy: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    placeholder="Energy 1-5"
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.stress ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        stress: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    placeholder="Stress 1-5"
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <button
                  onClick={handleLogMood}
                  disabled={saving}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
                >
                  Log mood
                </button>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-500">Latest mood entries</h3>
                <div className="space-y-2">
                  {loading && <div className="text-sm text-slate-500">Loading…</div>}
                  {!loading && (data?.moodLogs.length ?? 0) === 0 && (
                    <div className="text-sm text-slate-500">No mood logs yet.</div>
                  )}
                  {data?.moodLogs.slice(0, 4).map((mood) => (
                    <div
                      key={mood.id}
                      className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-3 py-2 text-sm"
                    >
                      <div>
                        <div className="font-semibold">Mood {mood.mood}/5</div>
                        <div className="text-xs text-slate-500">
                          {formatDateTime(mood.recordedAt)}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {mood.energy ? `Energy ${mood.energy}/5 ` : ""}
                        {mood.stress ? `Stress ${mood.stress}/5` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr,1.2fr]">
          <div className="space-y-4 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-md backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Habits</h2>
              <span className="text-xs text-slate-500">
                {data?.habits.filter((h) => !h.archived).length ?? 0} active
              </span>
            </div>
            <div className="space-y-2">
              <input
                value={form.habitName}
                onChange={(e) => setForm((prev) => ({ ...prev, habitName: e.target.value }))}
                placeholder="Habit name (e.g., Pomodoro x4)"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="number"
                min={1}
                value={form.habitTarget ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    habitTarget: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="Target per week (optional)"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={handleCreateHabit}
                disabled={saving}
                className="w-full rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/30"
              >
                Add habit
              </button>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-500">Check-in</h3>
              <select
                value={form.checkInHabitId ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, checkInHabitId: e.target.value || undefined }))
                }
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select habit</option>
                {data?.habits
                  .filter((h) => !h.archived)
                  .map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.name}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                min={0}
                value={form.checkInValue ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    checkInValue: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="Value (e.g., reps or minutes)"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <input
                value={form.checkInNotes ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    checkInNotes: e.target.value,
                  }))
                }
                placeholder="Notes (optional)"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={handleCheckInHabit}
                disabled={saving || !form.checkInHabitId}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-black/5 disabled:text-slate-500"
              >
                Log check-in
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-md backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Weekly trend</h2>
              <span className="text-xs text-slate-500">Past 7 days</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProgressBar
                label="Target focus time (600m)"
                value={Math.min(100, (weeklyStudyMinutes / 600) * 100)}
              />
              <ProgressBar
                label="Mood (avg vs 5)"
                value={avgMood ? (avgMood / 5) * 100 : 0}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-500">Habit check-ins</h3>
              <div className="space-y-2">
                {data?.habits.filter((h) => !h.archived).length === 0 ? (
                  <div className="rounded-xl border border-black/5 bg-white px-3 py-2 text-sm text-slate-500">
                    Add a habit to start tracking check-ins.
                  </div>
                ) : (
                  data?.habits
                    .filter((h) => !h.archived)
                    .map((habit) => {
                      const checkIns = habit.checkIns.filter(
                        (c) => new Date(c.completedAt) >= weeklyWindowStart
                      );
                      return (
                        <div
                          key={habit.id}
                          className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{habit.name}</div>
                            <div className="text-xs text-slate-500">
                              {checkIns.length} check-ins
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Target: {habit.targetPerWeek ?? "—"} / week
                          </div>
                          {checkIns.slice(0, 3).map((c) => (
                            <div key={c.id} className="mt-1 flex items-center justify-between text-xs">
                              <span>{formatDateTime(c.completedAt)}</span>
                              <span className="text-slate-500">
                                {c.value != null ? c.value : ""} {c.notes || ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
