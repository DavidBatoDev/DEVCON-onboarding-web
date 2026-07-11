import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  File,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Folder,
  Play,
  Clock,
  ArrowLeft,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";

const DriveFilesFetcher = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rebuildStatus, setRebuildStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  // Local-admin console: the backend requires X-Admin-Token for Drive endpoints.
  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem("devcon-admin-token") || ""
  );
  useEffect(() => {
    localStorage.setItem("devcon-admin-token", adminToken);
  }, [adminToken]);

  // API base URL - adjust this to match your backend
  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  // Ensure the URL doesn't end with a slash to avoid double slashes
  const getApiUrl = (endpoint: string) => {
    const baseUrl = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    return `${baseUrl}${endpoint}`;
  };

  const fetchDriveFiles = async (
    folderId = "1eocL8T8BH6EwnP5siOtDz3FG2CqGHveS"
  ) => {
    setLoading(true);
    setError(null);

    try {
      // First get current stats
      try {
        const statsResponse = await fetch(getApiUrl("/api/v1/stats"));
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (statsError) {
        console.warn("Could not fetch stats:", statsError);
      }

      // Fetch files from Google Drive (without rebuilding)
      const filesResponse = await fetch(getApiUrl("/api/v1/files/fetch"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken,
        },
        body: JSON.stringify({
          folder_id: folderId,
        }),
      });

      if (!filesResponse.ok) {
        throw new Error(`HTTP error! status: ${filesResponse.status}`);
      }

      const filesData = await filesResponse.json();

      if (filesData.files) {
        setFiles(filesData.files);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching drive files:", err);
    } finally {
      setLoading(false);
    }
  };

  // Manual rebuild function - only triggered by user action
  const handleRebuildIndex = async (selectedFileIds = null) => {
    // Confirm action with user
    const fileCount = selectedFileIds ? selectedFileIds.length : files.length;
    const message = selectedFileIds
      ? `Are you sure you want to rebuild the index with ${fileCount} selected files?`
      : `Are you sure you want to rebuild the index with all ${fileCount} files?`;

    if (!window.confirm(message)) {
      return;
    }

    setIsRebuilding(true);
    setError(null);
    setRebuildStatus(null);

    try {
      const rebuildPayload: {
        folder_id: string;
        batch_size: number;
        file_ids?: string[];
      } = {
        folder_id: "1eocL8T8BH6EwnP5siOtDz3FG2CqGHveS",
        batch_size: 25,
      };

      // Add selected file IDs if any are selected
      if (selectedFileIds && selectedFileIds.length > 0) {
        rebuildPayload.file_ids = selectedFileIds;
      }

      const rebuildResponse = await fetch(getApiUrl("/api/v1/rebuild"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken,
        },
        body: JSON.stringify(rebuildPayload),
      });

      if (!rebuildResponse.ok) {
        throw new Error(`HTTP error! status: ${rebuildResponse.status}`);
      }

      const rebuildData = await rebuildResponse.json();
      setRebuildStatus(rebuildData);

      // Update file statuses based on rebuild results
      if (rebuildData.files_details) {
        const updatedFiles = files.map((file) => {
          const processedFile = rebuildData.files_details.find(
            (f) => f.id === file.id
          );
          if (processedFile) {
            return { ...file, status: processedFile.status };
          }
          return file;
        });
        setFiles(updatedFiles);
      }

      // Refresh stats after rebuild
      try {
        const statsResponse = await fetch(getApiUrl("/api/v1/stats"));
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (statsError) {
        console.warn("Could not refresh stats after rebuild:", statsError);
      }

      // Clear selected files after successful rebuild
      setSelectedFiles(new Set());
    } catch (err) {
      setError(err.message);
      console.error("Error rebuilding index:", err);
    } finally {
      setIsRebuilding(false);
    }
  };

  // Only fetch files on initial mount - NO automatic rebuild
  useEffect(() => {
    fetchDriveFiles();
  }, []);

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("pdf")) return <File className="text-muted-foreground" />;
    if (mimeType?.includes("document"))
      return <FileText className="text-muted-foreground" />;
    if (mimeType?.includes("presentation"))
      return <FileText className="text-muted-foreground" />;
    if (mimeType?.includes("text"))
      return <FileText className="text-muted-foreground" />;
    return <File className="text-muted-foreground" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="text-emerald-500" size={16} />;
      case "failed":
        return <XCircle className="text-red-500" size={16} />;
      case "available":
        return <Clock className="text-muted-foreground" size={16} />;
      default:
        return <AlertCircle className="text-amber-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processed":
        return "text-emerald-400";
      case "failed":
        return "text-red-400";
      case "available":
        return "text-muted-foreground";
      default:
        return "text-amber-400";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleFileSelection = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  const downloadFile = (fileId, fileName) => {
    const downloadUrl = getApiUrl(`/files/download/${fileId}`);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGoogleDocsUrl = (fileId) => {
    return `https://docs.google.com/document/d/${fileId}/edit`;
  };

  const getGoogleDriveUrl = (fileId) => {
    return `https://drive.google.com/file/d/${fileId}/view`;
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Fetching Drive files
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connecting to Google Drive and listing your documents…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                <Folder size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  DEVCON Drive Files
                </h1>
                <a
                  href="https://drive.google.com/drive/folders/1eocL8T8BH6EwnP5siOtDz3FG2CqGHveS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink size={14} />
                  Open with Google Drive
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Admin token"
                className="h-8 w-36 rounded-md border border-border bg-card px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/40"
                title="X-Admin-Token required by the backend for Drive endpoints (local use)"
              />
              <div className="mr-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Connected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDriveFiles()}
                disabled={loading || isRebuilding}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh Files
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  handleRebuildIndex(
                    selectedFiles.size > 0 ? Array.from(selectedFiles) : null
                  )
                }
                disabled={loading || isRebuilding || files.length === 0}
              >
                <Play className={`h-4 w-4 ${isRebuilding ? "animate-spin" : ""}`} />
                {isRebuilding
                  ? "Rebuilding…"
                  : selectedFiles.size > 0
                  ? `Rebuild Selected (${selectedFiles.size})`
                  : "Rebuild All"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Cards */}
        {(stats || rebuildStatus) && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats && (
              <>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
                      <File size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Indexed Docs
                      </p>
                      <p className="text-2xl font-semibold tracking-tight">
                        {stats.document_count || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Index Status
                      </p>
                      <p className="text-lg font-semibold capitalize tracking-tight">
                        {stats.status || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
                  <Folder size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Drive Files</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {files.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Selected</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {selectedFiles.size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-xl border border-destructive/40 bg-destructive/10 p-5">
            <div className="flex items-center gap-3">
              <XCircle className="text-destructive" size={20} />
              <div>
                <h3 className="font-semibold text-destructive">Error</h3>
                <p className="mt-0.5 text-sm text-destructive/90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rebuild Status */}
        {rebuildStatus && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold tracking-tight">Rebuild Summary</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Status:{" "}
                  <span className="font-medium text-foreground">
                    {rebuildStatus.status}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Processing Time:{" "}
                  <span className="font-medium text-foreground">
                    {rebuildStatus.processing_time?.toFixed(2)}s
                  </span>
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Processed:{" "}
                  <span className="font-medium text-emerald-400">
                    {rebuildStatus.processed_files || 0}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Failed:{" "}
                  <span className="font-medium text-red-400">
                    {rebuildStatus.failed_files || 0}
                  </span>
                </p>
              </div>
            </div>
            {rebuildStatus.message && (
              <p className="mt-3 text-sm text-muted-foreground">
                Message:{" "}
                <span className="text-foreground">{rebuildStatus.message}</span>
              </p>
            )}
          </div>
        )}

        {/* Files List */}
        {files.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="font-semibold tracking-tight">
                Drive Files ({files.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={selectAllFiles}>
                {selectedFiles.size === files.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="divide-y divide-border">
              {files.map((file, index) => (
                <div
                  key={file.id || index}
                  className="p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="h-4 w-4 flex-shrink-0 rounded border-border bg-background accent-primary"
                      />
                      <div className="flex-shrink-0">
                        {getFileIcon(file.mime_type)}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex min-w-0 items-center gap-2">
                          <h4 className="min-w-0 flex-1 truncate font-medium text-foreground">
                            {file.name}
                          </h4>
                          {file.status && (
                            <div className="flex flex-shrink-0 items-center gap-1">
                              {getStatusIcon(file.status)}
                              <span
                                className={`text-xs font-medium ${getStatusColor(
                                  file.status
                                )}`}
                              >
                                {file.status}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-4 overflow-hidden text-sm text-muted-foreground">
                          <span className="truncate">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="truncate">
                            Modified: {formatDate(file.modified_time)}
                          </span>
                          {file.mime_type && (
                            <span className="flex-shrink-0 rounded border border-border bg-secondary px-2 py-0.5 text-xs">
                              {file.mime_type.split("/")[1]?.toUpperCase() ||
                                "FILE"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        onClick={() => openInNewTab(getGoogleDocsUrl(file.id))}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Open in Google Docs"
                      >
                        <LinkIcon size={16} />
                      </button>
                      <button
                        onClick={() => openInNewTab(getGoogleDriveUrl(file.id))}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Open in Google Drive"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && files.length === 0 && !error && (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <Folder className="mx-auto mb-4 text-muted-foreground" size={40} />
            <h3 className="text-lg font-semibold tracking-tight">
              No Files Found
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              No files were found in the specified Google Drive folder.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => fetchDriveFiles()}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveFilesFetcher;
