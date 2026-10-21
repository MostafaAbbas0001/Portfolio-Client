import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteImage,
  getApiAssetUrl,
  getImageFiles,
  uploadMedia,
  type MediaUploadResponse,
} from "@/api/siteDataApi";

const IMAGE_QUERY_KEY = ["admin", "media", "images"];

export function MediaManager({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const imagesQuery = useQuery({ queryKey: IMAGE_QUERY_KEY, queryFn: getImageFiles });
  const [uploading, setUploading] = useState<"image" | "resume" | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<MediaUploadResponse | null>(null);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>, kind: "image" | "resume") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(kind);
    setMessage(null);
    setError(null);
    try {
      const result = await uploadMedia(token, file);
      setLastUpload(result);
      setMessage(
        kind === "resume" ? "Resume replaced successfully." : "Image uploaded successfully.",
      );
      if (kind === "image") await queryClient.invalidateQueries({ queryKey: IMAGE_QUERY_KEY });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  useEffect(() => {
    if (!pendingDelete) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) setPendingDelete(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleting, pendingDelete]);

  async function handleDelete() {
    if (!pendingDelete) return;
    const fileName = pendingDelete;
    setDeleting(fileName);
    setMessage(null);
    setError(null);
    try {
      await deleteImage(token, fileName);
      await queryClient.invalidateQueries({ queryKey: IMAGE_QUERY_KEY });
      setMessage("Image deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Delete failed.");
    } finally {
      setDeleting(null);
      setPendingDelete(null);
    }
  }

  return (
    <div className="grid gap-0">
      <section className="border-b border-border p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="label-mono">Assets</p>
            <h2 className="mt-2 text-2xl font-semibold">Images</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload public site images and copy the backend path into your JSON content.
            </p>
          </div>
          <UploadButton
            busy={uploading === "image"}
            disabled={uploading !== null}
            label="Upload image"
            busyLabel="Uploading..."
            accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif"
            onChange={(event) => handleUpload(event, "image")}
          />
        </div>

        <div className="mt-5 grid border border-border bg-muted/35 sm:grid-cols-3">
          <Stat label="Image count" value={String(imagesQuery.data?.length ?? 0)} />
          <Stat label="Max image size" value="10 MB" />
          <Stat label="Formats" value="JPG, PNG, WebP" />
        </div>

        {imagesQuery.isLoading && <EmptyState>Loading images...</EmptyState>}
        {imagesQuery.isError && <Notice type="error">Could not load images.</Notice>}
        {imagesQuery.data?.length === 0 && <EmptyState>No uploaded images yet.</EmptyState>}

        {imagesQuery.data && imagesQuery.data.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {imagesQuery.data.map((fileName) => {
              const imageUrl = getApiAssetUrl(`/Uploads/images/${encodeURIComponent(fileName)}`);
              return (
                <article
                  key={fileName}
                  className="overflow-hidden border border-border bg-background"
                >
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-[4/3] bg-muted"
                  >
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                  <div className="p-3">
                    <p className="truncate font-mono text-[11px]" title={fileName}>
                      {fileName}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                      /Uploads/images/{fileName}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(`/Uploads/images/${fileName}`)}
                        className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                      >
                        Copy path
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(fileName)}
                        disabled={deleting === fileName}
                        className="text-xs font-semibold text-destructive disabled:opacity-50"
                      >
                        {deleting === fileName ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="p-4 md:p-6">
        <div className="grid gap-5 border border-border bg-muted/35 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="label-mono">Document</p>
            <h2 className="mt-2 text-xl font-semibold">Resume PDF</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Uploading a PDF replaces the current public resume.
            </p>
            <a
              href={getApiAssetUrl("/Site/media/resume")}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4"
            >
              Open current resume
            </a>
          </div>
          <UploadButton
            busy={uploading === "resume"}
            disabled={uploading !== null}
            label="Replace resume"
            busyLabel="Uploading..."
            accept="application/pdf,.pdf"
            variant="secondary"
            onChange={(event) => handleUpload(event, "resume")}
          />
        </div>
      </section>

      <div className="border-t border-border p-4 md:p-6" aria-live="polite">
        {message && <Notice type="success">{message}</Notice>}
        {error && <Notice type="error">{error}</Notice>}
        {lastUpload && (
          <p className="mt-3 break-all border border-border bg-muted/35 px-3 py-2 font-mono text-[11px] text-muted-foreground">
            {lastUpload.originalFileName} - {lastUpload.url}
          </p>
        )}
        {!message && !error && !lastUpload && (
          <p className="text-sm text-muted-foreground">No recent media activity.</p>
        )}
      </div>

      {pendingDelete && (
        <DeleteConfirmationModal
          fileName={pendingDelete}
          deleting={deleting === pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function DeleteConfirmationModal({
  fileName,
  deleting,
  onCancel,
  onConfirm,
}: {
  fileName: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-image-title"
        aria-describedby="delete-image-description"
        className="w-full max-w-md border border-border bg-background p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:p-7"
      >
        <p className="label-mono text-destructive">Delete image</p>
        <h2 id="delete-image-title" className="mt-3 text-2xl font-semibold">
          Remove this file?
        </h2>
        <p id="delete-image-description" className="mt-3 text-sm leading-6 text-muted-foreground">
          This permanently deletes the image from the server. Content using its path will show a
          broken image until updated.
        </p>
        <p className="mt-5 break-all border border-border bg-muted/45 px-3 py-2 font-mono text-xs">
          {fileName}
        </p>
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            autoFocus
            className="min-h-11 border border-border bg-background px-5 text-sm font-semibold transition-colors hover:border-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="min-h-11 bg-destructive px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </section>
    </div>
  );
}

function UploadButton({
  busy,
  disabled,
  label,
  busyLabel,
  accept,
  variant = "primary",
  onChange,
}: {
  busy: boolean;
  disabled: boolean;
  label: string;
  busyLabel: string;
  accept: string;
  variant?: "primary" | "secondary";
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center px-5 text-sm font-semibold transition-colors ${
        variant === "primary"
          ? "bg-foreground text-background hover:bg-primary"
          : "border border-foreground bg-background hover:border-primary hover:text-primary"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      {busy ? busyLabel : label}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border px-4 py-3 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
      <p className="label-mono">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function Notice({ type, children }: { type: "success" | "error"; children: ReactNode }) {
  return (
    <p
      className={`border px-3 py-2 text-sm ${
        type === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-primary/30 bg-primary/5 text-primary"
      }`}
      role="status"
    >
      {children}
    </p>
  );
}
