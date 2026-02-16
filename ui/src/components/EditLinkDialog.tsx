import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getLinkMetadata, getPublicShortLink, updateLink } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLinksStore } from "@/store/links-store";
import { useUiStore } from "@/store/ui-store";

function isoToLocalDateTime(value?: string): string {
  if (!value) {
    return "";
  }
  return value.slice(0, 16);
}

export function EditLinkDialog(): JSX.Element {
  const shortCode = useUiStore((state) => state.editLinkShortCode);
  const closeDialog = useUiStore((state) => state.closeEditDialog);
  const upsertKnownLink = useLinksStore((state) => state.upsertKnownLink);
  const toast = useToast();
  const queryClient = useQueryClient();

  const [expiresAt, setExpiresAt] = useState("");
  const [password, setPassword] = useState("");
  const [removePassword, setRemovePassword] = useState(false);

  const enabled = Boolean(shortCode);

  const metadataQuery = useQuery({
    queryKey: ["link", shortCode],
    queryFn: () => getLinkMetadata(shortCode!),
    enabled
  });

  useEffect(() => {
    if (!metadataQuery.data) {
      return;
    }
    setExpiresAt(isoToLocalDateTime(metadataQuery.data.expiresAt));
    setRemovePassword(false);
    setPassword("");
  }, [metadataQuery.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!shortCode) {
        throw new Error("Missing shortCode");
      }

      return updateLink(shortCode, {
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        password: password || undefined,
        removePassword
      });
    },
    onSuccess: (updated) => {
      const shortUrl = getPublicShortLink(updated.shortCode);
      upsertKnownLink({
        shortCode: updated.shortCode,
        shortUrl,
        originalUrl: updated.originalUrl,
        createdAt: updated.createdAt,
        expiresAt: updated.expiresAt,
        isPasswordProtected: updated.isPasswordProtected,
        clickCount: updated.clickCount,
        lastAccessedAt: updated.lastAccessedAt
      });
      queryClient.setQueryData(["link", updated.shortCode], updated);
      queryClient.invalidateQueries({ queryKey: ["stats", updated.shortCode] });
      toast.success("Link settings updated");
      closeDialog();
    },
    onError: (error) => {
      toast.error("Update failed", error instanceof Error ? error.message : undefined);
    }
  });

  const isOpen = Boolean(shortCode);

  const canSave = useMemo(() => {
    return !mutation.isPending && !metadataQuery.isLoading;
  }, [metadataQuery.isLoading, mutation.isPending]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await mutation.mutateAsync();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit /{shortCode}</DialogTitle>
          <DialogDescription>Update expiration or protection without leaving the page.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="edit-expiry">Expiration</Label>
            <Input
              id="edit-expiry"
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-password">New password (optional)</Label>
            <Input
              id="edit-password"
              type="password"
              placeholder="Leave empty to keep current"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (event.target.value) {
                  setRemovePassword(false);
                }
              }}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
            <input
              type="checkbox"
              checked={removePassword}
              onChange={(event) => {
                setRemovePassword(event.target.checked);
                if (event.target.checked) {
                  setPassword("");
                }
              }}
            />
            Remove existing password
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
