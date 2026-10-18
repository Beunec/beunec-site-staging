"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** A value people need to paste somewhere else, with a one-tap copy. */
export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-border bg-global">
      <code className="min-w-0 flex-1 break-all px-4 py-3 font-mono text-[15px] text-foreground" aria-label={label}>
        {value}
      </code>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(value).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          });
        }}
        className="inline-flex shrink-0 items-center gap-1.5 border-l border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="h-4 w-4 text-accent-sage" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
