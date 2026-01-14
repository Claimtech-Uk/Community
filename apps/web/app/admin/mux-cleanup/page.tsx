"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface MuxAsset {
  assetId: string;
  status: string;
  duration: number;
  createdAt: string;
  playbackIds: number;
  isLinkedToLesson: boolean;
  lessonTitle: string;
  lessonId?: string;
  canDelete: boolean;
}

interface MuxData {
  totalAssets: number;
  planLimit: number;
  remaining: number;
  linkedAssets: MuxAsset[];
  orphanedAssets: MuxAsset[];
}

export default function MuxCleanupPage() {
  const [data, setData] = useState<MuxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadAssets() {
    try {
      setLoading(true);
      const response = await fetch("/api/mux/list-assets");
      if (!response.ok) throw new Error("Failed to load assets");
      const data = await response.json();
      setData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  async function deleteAsset(assetId: string) {
    if (!confirm("Are you sure you want to delete this video asset? This cannot be undone.")) {
      return;
    }

    try {
      setDeleting(assetId);
      const response = await fetch(`/api/mux/delete-asset?assetId=${assetId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete");
      }

      // Reload assets list
      await loadAssets();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isOverLimit = data.remaining < 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mux Asset Cleanup</h1>
            <p className="text-muted-foreground mt-1">
              Manage your video assets to stay within plan limits
            </p>
          </div>
          <Link
            href="/admin/content"
            className="px-4 py-2 rounded-lg border hover:bg-muted"
          >
            ← Back
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`rounded-xl border p-4 ${isOverLimit ? 'bg-red-50 border-red-200' : 'bg-card'}`}>
            <div className="text-2xl font-bold">{data.totalAssets}</div>
            <div className="text-sm text-muted-foreground">Total Assets</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="text-2xl font-bold">{data.planLimit}</div>
            <div className="text-sm text-muted-foreground">Plan Limit</div>
          </div>
          <div className={`rounded-xl border p-4 ${isOverLimit ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className={`text-2xl font-bold ${isOverLimit ? 'text-red-600' : 'text-emerald-600'}`}>
              {data.remaining}
            </div>
            <div className="text-sm text-muted-foreground">
              {isOverLimit ? 'Over Limit' : 'Remaining'}
            </div>
          </div>
        </div>

        {isOverLimit && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-amber-900">Plan Limit Exceeded</h3>
                <p className="text-sm text-amber-700 mt-1">
                  You cannot upload new videos until you delete some assets or upgrade your Mux plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Orphaned Assets */}
        {data.orphanedAssets.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Orphaned Assets ({data.orphanedAssets.length}) - Safe to Delete
            </h2>
            <div className="rounded-lg border bg-card divide-y">
              {data.orphanedAssets.map((asset) => (
                <div key={asset.assetId} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm">{asset.assetId}</div>
                    <div className="text-xs text-muted-foreground">
                      Status: {asset.status} • Created: {new Date(asset.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAsset(asset.assetId)}
                    disabled={deleting === asset.assetId}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {deleting === asset.assetId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked Assets */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Linked Assets ({data.linkedAssets.length})
          </h2>
          <div className="rounded-lg border bg-card divide-y">
            {data.linkedAssets.map((asset) => (
              <div key={asset.assetId} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{asset.lessonTitle}</div>
                  <div className="font-mono text-xs text-muted-foreground mt-1">
                    Asset: {asset.assetId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Status: {asset.status} • Duration: {Math.floor(asset.duration || 0)}s
                  </div>
                </div>
                <div className="flex gap-2">
                  {asset.lessonId && (
                    <Link
                      href={`/admin/content/lessons/${asset.lessonId}`}
                      className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted"
                    >
                      Edit Lesson
                    </Link>
                  )}
                  <button
                    onClick={() => deleteAsset(asset.assetId)}
                    disabled={deleting === asset.assetId}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 disabled:opacity-50 text-sm"
                  >
                    {deleting === asset.assetId ? "Deleting..." : "Delete Video"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="rounded-xl border bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <h3 className="font-semibold mb-2">Need More Storage?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade to Mux&apos;s paid plan for unlimited video assets, better encoding, and more features.
          </p>
          <a
            href="https://dashboard.mux.com/settings/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm"
          >
            Upgrade Mux Plan →
          </a>
        </div>
      </div>
    </div>
  );
}
