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
  BarChart3,
  Activity,
  TrendingUp,
  Loader2,
  Search,
  Filter,
} from "lucide-react";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rebuildStatus, setRebuildStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // API base URL - adjust this to match your backend
  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    "https://devcon-onboarding-rag.onrender.com";

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
      // Fetch files from Google Drive first
      const filesResponse = await fetch(getApiUrl("/api/v1/files/fetch"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        console.log("Fetched files:", filesData.files);
      }

      // Then get current stats after files are loaded
      try {
        // Try health endpoint first as it's more reliable
        const healthResponse = await fetch(getApiUrl("/api/v1/health"));
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log("Health check response:", healthData);

          // Try to get detailed stats
          try {
            const statsResponse = await fetch(getApiUrl("/api/v1/stats"));
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              setStats(statsData);
              console.log("Fetched stats:", statsData);
            } else {
              // Use health data as fallback
              console.warn(
                "Stats endpoint failed, using health data as fallback"
              );
              setStats({
                status: healthData.rag_status || "unknown",
                document_count: healthData.document_count || 0,
                error: null,
              });
            }
          } catch (statsError) {
            console.warn(
              "Stats endpoint error, using health data:",
              statsError
            );
            setStats({
              status: healthData.rag_status || "unknown",
              document_count: healthData.document_count || 0,
              error: null,
            });
          }
        } else {
          console.warn("Health endpoint also failed");
        }
      } catch (statsError) {
        console.warn("Could not fetch stats:", statsError);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching drive files:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh just the stats
  const refreshStats = async () => {
    try {
      // Try the health endpoint first as it's more reliable
      const healthResponse = await fetch(getApiUrl("/api/v1/health"));
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log("Health check response:", healthData);

        // If health endpoint works, try to get more detailed stats
        try {
          const statsResponse = await fetch(getApiUrl("/api/v1/stats"));
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
            console.log("Refreshed stats:", statsData);
          } else {
            // If stats fails, use health data as fallback
            console.warn(
              "Stats endpoint failed, using health data as fallback"
            );
            setStats({
              status: healthData.rag_status || "unknown",
              document_count: healthData.document_count || 0,
              error: null,
            });
          }
        } catch (statsError) {
          console.warn("Stats endpoint error, using health data:", statsError);
          setStats({
            status: healthData.rag_status || "unknown",
            document_count: healthData.document_count || 0,
            error: null,
          });
        }
      } else {
        console.warn("Health endpoint also failed");
      }
    } catch (statsError) {
      console.warn("Could not refresh stats:", statsError);
    }
  };

  // Function to test if the RAG system has embedded documents
  const testRAGSystem = async () => {
    try {
      console.log("Testing RAG system with a simple query...");
      const testResponse = await fetch(getApiUrl("/api/v1/ask"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "test",
          history: [],
        }),
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log("RAG system test response:", testData);

        // If we get a response, it means there are embedded documents
        if (
          testData.answer &&
          testData.answer !==
            "I don't have enough information to answer this question."
        ) {
          console.log("✅ RAG system has embedded documents and is working!");
          // Update stats to reflect that documents are available
          setStats((prev) => ({
            ...prev,
            status: "operational",
            document_count: Math.max(prev?.document_count || 0, 1),
          }));
        } else {
          console.log(
            "⚠️ RAG system responded but no useful information found"
          );
        }
      } else {
        console.log("❌ RAG system test failed");
      }
    } catch (error) {
      console.warn("Could not test RAG system:", error);
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
    setSelectedFiles(new Set(newSelected));
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

  // Filter and search files
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || file.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics with better logic
  const processedCount = files.filter((f) => f.status === "processed").length;
  const failedCount = files.filter((f) => f.status === "failed").length;
  const availableCount = files.filter((f) => f.status === "available").length;
  const totalFilesCount = files.length;

  // Use the more reliable count - prioritize health endpoint data
  const totalDocuments = stats?.document_count || totalFilesCount;

  // If we have health data, use that for document count
  const [healthData, setHealthData] = useState(null);

  // Fetch health data separately for accurate document count
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const healthResponse = await fetch(getApiUrl("/api/v1/health"));
        if (healthResponse.ok) {
          const health = await healthResponse.json();
          setHealthData(health);
          console.log("Health data for document count:", health);
        }
      } catch (error) {
        console.warn("Could not fetch health data:", error);
      }
    };

    fetchHealthData();
  }, []);

  // Use health data if available, otherwise fall back to stats
  const actualDocumentCount =
    healthData?.document_count || stats?.document_count || totalFilesCount;

  // Debug logging
  console.log("Dashboard Stats:", {
    apiStats: stats,
    totalFiles: totalFilesCount,
    processed: processedCount,
    failed: failedCount,
    available: availableCount,
    totalDocuments,
  });

  const statCards = [
    {
      icon: File,
      label: "Indexed Documents",
      value: actualDocumentCount,
      hint: healthData?.document_count
        ? "Chunked & ready"
        : stats?.document_count
        ? "API count"
        : "File count",
    },
    {
      icon: Folder,
      label: "Source Files",
      value: totalFilesCount,
      hint: "In Drive",
    },
    {
      icon: BarChart3,
      label: "Chunk Ratio",
      value:
        totalFilesCount > 0
          ? Math.round(actualDocumentCount / totalFilesCount)
          : 0,
      hint: "Docs per file",
    },
    {
      icon: Activity,
      label: "System Status",
      value: healthData?.rag_status === "ready" ? "Ready" : "Loading",
      hint: healthData?.rag_status === "ready" ? "Operational" : "Initializing",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Loading dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connecting to services and gathering analytics…
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
                <BarChart3 size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  DEVCON Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor and manage your document processing system
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>System Online</span>
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
                onClick={() => (window.location.href = "/")}
              >
                <BarChart3 className="h-4 w-4" />
                Test Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDriveFiles()}
                disabled={loading || isRebuilding}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  handleRebuildIndex(
                    selectedFiles.size > 0 ? Array.from(selectedFiles) : null
                  )
                }
                disabled={loading || isRebuilding || files.length === 0}
                title="Only use if you need to re-index documents"
              >
                <Play className={`h-4 w-4 ${isRebuilding ? "animate-spin" : ""}`} />
                {isRebuilding
                  ? "Processing…"
                  : selectedFiles.size > 0
                  ? `Re-index Selected (${selectedFiles.size})`
                  : "Re-index All"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
                  <card.icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.hint}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

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
            <h3 className="mb-4 flex items-center gap-2 font-semibold tracking-tight">
              <TrendingUp className="text-primary" size={18} />
              Processing Summary
            </h3>
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

        {/* Search and Filter Controls */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Status</option>
                  <option value="processed">Processed</option>
                  <option value="available">Available</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <Button variant="ghost" size="sm" onClick={selectAllFiles}>
                {selectedFiles.size === files.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
          </div>
        </div>

        {/* Files List */}
        {filteredFiles.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="flex items-center gap-2 font-semibold tracking-tight">
                <Folder className="text-muted-foreground" size={18} />
                Drive Files ({filteredFiles.length} of {files.length})
              </h3>
              <div className="text-sm text-muted-foreground">
                {selectedFiles.size > 0 && `${selectedFiles.size} selected`}
              </div>
            </div>
            <div className="divide-y divide-border">
              {filteredFiles.map((file, index) => (
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
        {!loading && filteredFiles.length === 0 && !error && (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <Search className="mx-auto mb-4 text-muted-foreground" size={40} />
            <h3 className="text-lg font-semibold tracking-tight">
              No Files Found
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {searchTerm || filterStatus !== "all"
                ? "No files match your current search or filter criteria."
                : "No files were found in the specified Google Drive folder."}
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
