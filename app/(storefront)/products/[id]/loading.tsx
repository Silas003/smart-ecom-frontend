export default function ProductDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-900" />
        <div className="space-y-3">
          <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}

