export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-stone-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-400/30 border-t-amber-400" />
      </div>
    </main>
  );
}
