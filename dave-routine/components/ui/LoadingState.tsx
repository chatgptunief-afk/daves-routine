'use client';

// Vervangt platte "Laden..."-tekst overal in de app. Eén zachte, ademende lichtbron —
// hetzelfde motief als het lichtpunt op de Boog — zodat zelfs het wachten al bij het
// product hoort in plaats van een generieke spinner te zijn.
export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-24 pb-8" aria-label="Laden" role="status">
      <div className="relative w-8 h-8">
        <div
          className="absolute inset-0 rounded-full animate-breathe"
          style={{ background: 'radial-gradient(circle, rgba(242,172,110,0.5), transparent 70%)' }}
        />
        <div className="absolute inset-[10px] rounded-full bg-paper/90" />
      </div>
    </div>
  );
}
