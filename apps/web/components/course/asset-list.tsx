interface Asset {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

interface AssetListProps {
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

export function AssetList({ assets }: AssetListProps) {
  if (assets.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Lesson Resources
      </h3>
      <div className="space-y-2">
        {assets.map((asset) => (
          <a
            key={asset.id}
            href={asset.url}
            download={asset.filename}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md border bg-muted/30 p-3 hover:bg-muted/50 transition-colors group"
          >
            <span className="text-xl">
              {FILE_ICONS[asset.mimeType] || "📎"}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm group-hover:text-primary truncate block">
                {asset.filename}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(asset.size)}
              </span>
            </div>
            <svg
              className="h-5 w-5 text-muted-foreground group-hover:text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
