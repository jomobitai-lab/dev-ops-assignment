import { useEffect, useState } from "react";

// A single rolling digit: a vertical 0–9 column clipped to one line, rolled with
// a CSS transform transition. Uses explicit inline styles so clipping is reliable
// regardless of utility-class quirks.
function RollDigit({ digit }: { digit: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(digit), 30);
    return () => clearTimeout(t);
  }, [digit]);
  return (
    <span style={{ display: "inline-block", height: "1em", lineHeight: "1em", overflow: "hidden", verticalAlign: "baseline" }}>
      <span style={{ display: "block", transform: `translateY(-${v}em)`, transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}>
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} style={{ display: "block", height: "1em", lineHeight: "1em", textAlign: "center" }}>{n}</span>
        ))}
      </span>
    </span>
  );
}

type Props = { value: number; padStart?: boolean; decimalSeparator?: string };

export function SlidingNumber({ value, padStart = false, decimalSeparator = "." }: Props) {
  const neg = value < 0;
  const [intPart, decPart] = Math.abs(value).toString().split(".");
  const intStr = padStart && intPart.length < 2 ? "0" + intPart : intPart;
  return (
    <span className="tabular-nums" style={{ display: "inline-flex", alignItems: "baseline" }}>
      {neg && <span>-</span>}
      {intStr.split("").map((ch, i) => <RollDigit key={`i${i}`} digit={Number(ch)} />)}
      {decPart !== undefined && (
        <>
          <span>{decimalSeparator}</span>
          {decPart.split("").map((ch, i) => <RollDigit key={`d${i}`} digit={Number(ch)} />)}
        </>
      )}
    </span>
  );
}
