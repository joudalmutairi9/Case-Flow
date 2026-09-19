"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground print:hidden"
    >
      طباعة / حفظ كـ PDF
    </button>
  );
}
