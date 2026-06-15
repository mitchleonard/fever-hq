/**
 * Thin gold rule, evokes a court boundary line. Used as a section divider.
 */
export function CourtRule({ className = "" }: { className?: string }) {
  return <div className={`court-rule w-full ${className}`} aria-hidden />;
}
