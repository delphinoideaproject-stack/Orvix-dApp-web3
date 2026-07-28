export default function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Base */}
      <div className="absolute inset-0 bg-bg-primary" />
    </div>
  );
}