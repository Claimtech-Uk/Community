"use client";

import { useState, useEffect } from "react";
import MuxUploader from "@mux/mux-uploader-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface VideoUploadProps {
  lessonId: string;
  currentAssetId?: string | null;
  currentPlaybackId?: string | null;
  videoDuration?: number | null;
  onUploadComplete?: () => void;
}

interface MuxConfigStatus {
  configured: boolean;
  signingConfigured: boolean;
  missing: string[];
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoUpload({
  lessonId,
  currentAssetId,
  currentPlaybackId,
  videoDuration,
  onUploadComplete,
}: VideoUploadProps) {
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isGettingUrl, setIsGettingUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "complete"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [muxStatus, setMuxStatus] = useState<MuxConfigStatus | null>(null);
  const [isCheckingMux, setIsCheckingMux] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);

  // Determine current state
  const hasVideo = !!currentPlaybackId;
  const isProcessing = currentAssetId && !currentPlaybackId;

  // Check Mux configuration on mount
  useEffect(() => {
    async function checkMuxConfig() {
      try {
        const response = await fetch("/api/mux/upload-url");
        if (response.ok) {
          const status = await response.json();
          setMuxStatus(status);
        } else {
          setMuxStatus({ configured: false, signingConfigured: false, missing: [] });
        }
      } catch {
        setMuxStatus({ configured: false, signingConfigured: false, missing: [] });
      } finally {
        setIsCheckingMux(false);
      }
    }
    checkMuxConfig();
  }, []);

  // Poll for video status when processing
  useEffect(() => {
    if (!isProcessing && uploadStatus !== "processing") return;

    // Stop polling after 5 minutes (60 polls)
    if (pollingCount >= 60) {
      console.log("Stopped polling after 5 minutes");
      return;
    }

    const pollInterval = setInterval(() => {
      setPollingCount((c) => c + 1);
      onUploadComplete?.(); // This triggers a page refresh to get updated data
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [isProcessing, uploadStatus, pollingCount, onUploadComplete]);

  // Reset polling when video becomes ready
  useEffect(() => {
    if (hasVideo) {
      setPollingCount(0);
      setUploadStatus("complete");
    }
  }, [hasVideo]);

  async function getUploadUrl() {
    setIsGettingUrl(true);
    setError(null);

    try {
      const response = await fetch("/api/mux/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.notConfigured) {
          setMuxStatus({ configured: false, signingConfigured: false, missing: data.missing || [] });
          throw new Error(data.message || "Mux not configured");
        }
        
        // Check for plan limit error
        if (data.details && data.details.includes("limited to 10 assets")) {
          throw new Error("Mux free plan limit reached (10 videos). Delete old videos at /admin/mux-cleanup or upgrade your Mux plan.");
        }
        
        throw new Error(data.details || data.error || "Failed to get upload URL");
      }

      setUploadUrl(data.uploadUrl);
      setUploadStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get upload URL");
    } finally {
      setIsGettingUrl(false);
    }
  }

  function handleUploadStart() {
    setUploadStatus("uploading");
    setUploadProgress(0);
    setError(null);
  }

  function handleUploadProgress(event: unknown) {
    const progressEvent = event as { detail?: number };
    if (progressEvent.detail !== undefined) {
      setUploadProgress(Math.round(progressEvent.detail));
    }
  }

  function handleUploadSuccess() {
    setUploadStatus("processing");
    setUploadProgress(100);
    setUploadUrl(null);
    setPollingCount(0); // Start polling for video ready
    // Refresh the page after a short delay to show processing state
    setTimeout(() => {
      onUploadComplete?.();
    }, 2000);
  }

  function handleUploadError(event: unknown) {
    const errorEvent = event as { detail?: unknown };
    console.error("Upload error:", errorEvent.detail || event);
    setError("Upload failed. Please try again.");
    setUploadStatus("idle");
    setUploadProgress(0);
  }

  // Show loading state while checking Mux config
  if (isCheckingMux) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Lesson Video</h3>
        </div>
        <div className="rounded-lg border border-dashed p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Checking video configuration...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show configuration required message if Mux is not set up
  if (muxStatus && !muxStatus.configured) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Lesson Video</h3>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                Video Uploads Not Configured
              </h4>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                To enable video uploads, you need to set up Mux credentials in your environment variables.
              </p>
              
              <div className="mt-4 rounded-md bg-amber-100 dark:bg-amber-900/40 p-3">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Required environment variables:
                </p>
                <code className="block text-xs font-mono text-amber-700 dark:text-amber-300 space-y-1">
                  <span className="block">MUX_TOKEN_ID=your-token-id</span>
                  <span className="block">MUX_TOKEN_SECRET=your-token-secret</span>
                  <span className="block">MUX_SIGNING_KEY_ID=your-signing-key-id</span>
                  <span className="block">MUX_SIGNING_PRIVATE_KEY=your-base64-private-key</span>
                </code>
              </div>

              <a
                href="https://mux.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
              >
                Get Mux credentials →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Lesson Video</h3>
      </div>

      {/* Current video status */}
      {hasVideo && (
        <div className="rounded-md border bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Video Ready
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Duration: {videoDuration ? formatDuration(videoDuration) : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="rounded-md border bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/40">
              <LoadingSpinner size="sm" className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Processing Video
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                This may take a few minutes. Refresh to check status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload interface */}
      {!isProcessing && (
        <>
          {/* Error message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Get upload URL button */}
          {!uploadUrl && (
            <button
              onClick={getUploadUrl}
              disabled={isGettingUrl}
              className="w-full rounded-md border-2 border-dashed p-6 text-center hover:border-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              {isGettingUrl ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Preparing upload...</span>
                </div>
              ) : (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-muted-foreground mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium">
                    {hasVideo ? "Replace Video" : "Upload Video"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to select a video file
                  </p>
                </>
              )}
            </button>
          )}

          {/* Mux Uploader */}
          {uploadUrl && (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <MuxUploader
                  endpoint={uploadUrl}
                  onUploadStart={handleUploadStart}
                  onProgress={handleUploadProgress}
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                  className="w-full"
                />
              </div>

              {uploadStatus === "uploading" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading video...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Please don&apos;t close this page.
                  </p>
                </div>
              )}

              {uploadStatus === "processing" && (
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <LoadingSpinner size="sm" className="text-blue-600 dark:text-blue-400" />
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Upload complete! Processing video...
                    </p>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Mux is encoding your video. This typically takes 1-5 minutes.
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-500 mt-2">
                    Auto-refreshing every 5 seconds...
                  </p>
                </div>
              )}

              {uploadStatus !== "uploading" && uploadStatus !== "processing" && (
                <button
                  onClick={() => setUploadUrl(null)}
                  className="w-full rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
