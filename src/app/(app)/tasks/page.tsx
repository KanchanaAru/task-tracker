import Board from "@/components/Board";

export default function TasksPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
        Board
      </h1>
      <p className="mt-1 mb-6 text-sm text-ink-soft">
        Drag a card between columns, or change its status from the card.
      </p>
      <Board />
    </div>
  );
}
