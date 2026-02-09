import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Copy" }: CopyButtonProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  async function onCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      toast.error("Unable to copy", error instanceof Error ? error.message : undefined);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={onCopy} className="transition hover:scale-[1.02]">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
