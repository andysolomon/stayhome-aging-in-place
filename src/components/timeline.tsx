"use client";

type TimelineEvent = {
  id: string;
  type: "assessment" | "checklist" | "quote";
  title: string;
  description?: string;
  date: number;
  score?: number;
};

const TYPE_COLORS: Record<string, string> = {
  assessment: "bg-blue-500",
  checklist: "bg-green-500",
  quote: "bg-purple-500",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => b.date - a.date);

  if (sorted.length === 0) {
    return <p className="text-sm text-zinc-500">No events yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sorted.map((event) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`h-3 w-3 rounded-full ${TYPE_COLORS[event.type]}`} />
            <div className="w-px flex-1 bg-zinc-800" />
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium text-white">{event.title}</p>
            {event.description && (
              <p className="text-xs text-zinc-400">{event.description}</p>
            )}
            <p className="text-xs text-zinc-500">
              {new Date(event.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
