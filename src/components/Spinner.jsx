export default function Spinner() {
  return (
    <div role="status" className="flex flex-col items-center gap-5 py-24">
      <div className="spinner-ring" />
      <p className="text-sm text-white/70">Loading photos…</p>
    </div>
  );
}
