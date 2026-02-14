import { useMutation } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { createLink, getLinkMetadata } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/CopyButton";
import type { CreateLinkRequest } from "@/types/api";
import { useLinksStore } from "@/store/links-store";

type CreateLinkFormProps = {
  onCreated?: (shortCode: string) => void;
};

function getDefaultExpiry(): string {
  return "";
}

export function CreateLinkForm({ onCreated }: CreateLinkFormProps): JSX.Element {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [expiresAt, setExpiresAt] = useState(getDefaultExpiry());
  const [password, setPassword] = useState("");
  const [lastShortUrl, setLastShortUrl] = useState<string | null>(null);

  const upsertFromMetadata = useLinksStore((state) => state.upsertFromMetadata);
  const toast = useToast();

  const payload = useMemo<CreateLinkRequest>(
    () => ({
      url: url.trim(),
      customSlug: customSlug.trim() || undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      password: password.trim() || undefined
    }),
    [url, customSlug, expiresAt, password]
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await createLink(payload);
      const metadata = await getLinkMetadata(created.shortCode);
      upsertFromMetadata(created.shortUrl, metadata);
      return created;
    },
    onSuccess: (created) => {
      setLastShortUrl(created.shortUrl);
      toast.success("Short link created", created.shortUrl);
      onCreated?.(created.shortCode);
    },
    onError: (error) => {
      toast.error("Unable to create link", error instanceof Error ? error.message : undefined);
    }
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!url.trim()) {
      toast.error("URL is required");
      return;
    }

    await createMutation.mutateAsync();
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-ink-900 to-ink-700 text-white">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Rocket className="h-5 w-5 text-sky-300" />
          Create New Short Link
        </CardTitle>
        <CardDescription className="text-ink-100">
          Launch a branded, trackable URL with optional security and expiry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="url" className="text-ink-100">
              Destination URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/campaign"
              className="border-white/20 bg-white/10 text-white placeholder:text-ink-200"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="slug" className="text-ink-100">
                Custom Slug
              </Label>
              <Input
                id="slug"
                value={customSlug}
                onChange={(event) => setCustomSlug(event.target.value)}
                placeholder="spring-launch"
                className="border-white/20 bg-white/10 text-white placeholder:text-ink-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expires" className="text-ink-100">
                Expires At
              </Label>
              <Input
                id="expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                className="border-white/20 bg-white/10 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-ink-100">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="optional"
                className="border-white/20 bg-white/10 text-white placeholder:text-ink-200"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="lg"
              className="bg-sky-300 text-ink-900 hover:bg-sky-200"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Generate Short Link"}
            </Button>
            {lastShortUrl ? <CopyButton value={lastShortUrl} label="Copy Last Link" /> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
