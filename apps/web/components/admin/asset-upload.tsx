"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Asset {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

interface AssetUploadProps {
  lessonId: string;
  assets: Asset[];
}

const FILE_ICONS: Record<string, string> = {
  "application/pdf": "📄",
  "text/plain": "📝",
  "text/markdown": "📝",
  "application/json": "📋",
  "image/png": "🖼️",
  "image/jpeg": "🖼️",
  "image/gif": "🖼️",
  "image/webp": "🖼️",
  "application/zip": "📦",
  "application/x-zip-compressed": "📦",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssetUpload({ lessonId, assets: initialAssets }: AssetUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(file.name);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lessonId", lessonId);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const { asset } = await response.json();
      setAssets([...assets, asset]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(assetId: string) {
    setDeletingId(assetId);
    setError(null);

    try {
      const response = await fetch(`/api/assets/upload?assetId=${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Delete failed");
      }

      setAssets(assets.filter((a) => a.id !== assetId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Lesson Assets</h3>
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
            accept=".pdf,.txt,.md,.json,.png,.jpg,.jpeg,.gif,.webp,.zip"
          />
          <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isUploading ? "Uploading..." : "Add Asset"}
          </span>
        </label>
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="rounded-lg border bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                Uploading to S3: {uploadingFileName}
              </p>
              <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Asset list */}
      {assets.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No assets uploaded yet. Add PDFs, images, or other resources for this lesson.
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center gap-3 rounded-md border bg-muted/30 p-3"
            >
              <span className="text-xl">
                {FILE_ICONS[asset.mimeType] || "📎"}
              </span>
              <div className="flex-1 min-w-0">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sm hover:text-primary truncate block"
                >
                  {asset.filename}
                </a>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(asset.size)}
                </span>
              </div>
              <button
                onClick={() => handleDelete(asset.id)}
                disabled={deletingId === asset.id}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                title="Delete asset"
              >
                {deletingId === asset.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Supported: PDF, TXT, MD, JSON, PNG, JPG, GIF, WebP, ZIP (max 10MB) • Stored on AWS S3
      </p>
    </div>
  );
}
