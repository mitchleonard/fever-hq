/**
 * Fever HQ wordmark. Pure typography lockup — no team IP, just brand-color text
 * in Bebas Neue. The dot between "FEVER" and "HQ" is a Fever Gold square,
 * locking the brand palette into the mark.
 */
type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_MAP = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl md:text-7xl",
} as const;

export function Wordmark({ size = "md", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-baseline gap-2 font-display tracking-tight leading-none ${SIZE_MAP[size]} ${className}`}
    >
      <span className="text-paper">FEVER</span>
      <span
        aria-hidden
        className="inline-block bg-fever-gold"
        style={{
          width: "0.5em",
          height: "0.5em",
          transform: "translateY(-0.05em)",
        }}
      />
      <span className="text-fever-gold">HQ</span>
    </span>
  );
}
