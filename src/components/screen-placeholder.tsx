import { TopBar } from "@/components/top-bar";

/**
 * Shared shell for screens that have a route + real data model already
 * (see firestore-data-model.md) but whose UI/business logic hasn't been
 * built out yet. Every one of these is tracked in the project's screen
 * inventory (claude/design-handoff.md) — replace with the real screen when
 * its turn comes up.
 */
export function ScreenPlaceholder({
  title,
  back,
  blurb,
  notes,
}: {
  title: string;
  back?: string;
  blurb: string;
  notes?: string[];
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title={title} back={back} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="text-sm text-om-text-secondary">{blurb}</p>
        {notes?.length ? (
          <div className="rounded-lg border border-dashed border-om-border-strong bg-om-bg-panel p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-om-text-tertiary">
              Not built yet
            </p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-om-text-secondary">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
