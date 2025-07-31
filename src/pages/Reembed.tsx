import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  File,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Folder,
  Play,
  Clock,
  ArrowLeft,
  ExternalLink,
  Link,
} from "lucide-react";

const DriveFilesFetcher = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rebuildStatus, setRebuildStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());

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
    if (mimeType?.includes("pdf")) return <File className="text-red-500" />;
    if (mimeType?.includes("document"))
      return <FileText className="text-blue-500" />;
    if (mimeType?.includes("presentation"))
      return <FileText className="text-orange-500" />;
    if (mimeType?.includes("text"))
      return <FileText className="text-green-500" />;
    return <File className="text-gray-500" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "failed":
        return <XCircle className="text-red-500" size={16} />;
      case "available":
        return <Clock className="text-blue-500" size={16} />;
      default:
        return <AlertCircle className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processed":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "available":
        return "text-blue-400";
      default:
        return "text-yellow-400";
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

  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* DEVCON Logo Animation */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping bg-yellow-400/20 rounded-full"></div>
          <div className="relative bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-full">
            <Folder size={48} className="text-gray-900" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">
            Fetching Drive Files
          </h2>
          <p className="text-white/70 text-lg max-w-md mx-auto">
            Connecting to Google Drive and listing your documents...
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Progress Indicator */}
        <div className="w-64 mx-auto">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/95 via-purple-900/20 to-gray-900/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Single Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="size-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-2 rounded-lg shadow-lg">
                  <Folder className="text-gray-900" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    DEVCON Drive Files
                  </h1>
                  <a
                    href="https://drive.google.com/drive/folders/1eocL8T8BH6EwnP5siOtDz3FG2CqGHveS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    <ExternalLink size={14} />
                    <span>Open with Google Drive</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/60">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Connected</span>
              </div>

              <button
                onClick={() => fetchDriveFiles()}
                disabled={loading || isRebuilding}
                className="flex items-center space-x-2 bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 backdrop-blur-sm"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh Files</span>
              </button>

              <button
                onClick={() =>
                  handleRebuildIndex(
                    selectedFiles.size > 0 ? Array.from(selectedFiles) : null
                  )
                }
                disabled={loading || isRebuilding || files.length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 shadow-lg"
              >
                <Play
                  className={`size-4 ${isRebuilding ? "animate-spin" : ""}`}
                />
                <span>
                  {isRebuilding
                    ? "Rebuilding..."
                    : selectedFiles.size > 0
                    ? `Rebuild Selected (${selectedFiles.size})`
                    : "Rebuild All"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {(stats || rebuildStatus) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats && (
              <>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500/20 p-3 rounded-lg">
                      <File className="text-green-400" size={24} />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Indexed Docs</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.document_count || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-400/20 p-3 rounded-lg">
                      <AlertCircle className="text-yellow-400" size={24} />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Index Status</p>
                      <p className="text-lg font-semibold text-white capitalize">
                        {stats.status || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Folder className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Drive Files</p>
                  <p className="text-2xl font-bold text-white">
                    {files.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <CheckCircle className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Selected</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedFiles.size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <XCircle className="text-red-400" size={24} />
              <div>
                <h3 className="text-red-400 font-semibold">Error</h3>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rebuild Status */}
        {rebuildStatus && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Rebuild Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/70">
                  Status:{" "}
                  <span className="text-yellow-400 font-semibold">
                    {rebuildStatus.status}
                  </span>
                </p>
                <p className="text-white/70">
                  Processing Time:{" "}
                  <span className="text-white">
                    {rebuildStatus.processing_time?.toFixed(2)}s
                  </span>
                </p>
              </div>
              <div>
                <p className="text-white/70">
                  Processed:{" "}
                  <span className="text-green-400">
                    {rebuildStatus.processed_files || 0}
                  </span>
                </p>
                <p className="text-white/70">
                  Failed:{" "}
                  <span className="text-red-400">
                    {rebuildStatus.failed_files || 0}
                  </span>
                </p>
              </div>
            </div>
            {rebuildStatus.message && (
              <p className="text-white/70 mt-2">
                Message:{" "}
                <span className="text-white">{rebuildStatus.message}</span>
              </p>
            )}
          </div>
        )}

        {/* Files List */}
        {files.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Drive Files ({files.length})
                </h3>
                <button
                  onClick={selectAllFiles}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {selectedFiles.size === files.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {files.map((file, index) => (
                <div
                  key={file.id || index}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-shrink-0">
                        {getFileIcon(file.mime_type)}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center space-x-2 min-w-0">
                          <h4 className="text-white font-medium truncate flex-1 min-w-0">
                            {file.name}
                          </h4>
                          {file.status && (
                            <div className="flex items-center space-x-1 flex-shrink-0">
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
                        <div className="flex items-center space-x-4 mt-1 text-sm text-white/70 overflow-hidden">
                          <span className="truncate">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="truncate">
                            Modified: {formatDate(file.modified_time)}
                          </span>
                          {file.mime_type && (
                            <span className="text-xs bg-white/10 px-2 py-1 rounded flex-shrink-0">
                              {file.mime_type.split("/")[1]?.toUpperCase() ||
                                "FILE"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => openInNewTab(getGoogleDocsUrl(file.id))}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Open in Google Docs"
                      >
                        <Link size={16} />
                      </button>
                      <button
                        onClick={() => openInNewTab(getGoogleDriveUrl(file.id))}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
          <div className="text-center py-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <Folder className="mx-auto text-white/50 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Files Found
              </h3>
              <p className="text-white/70 mb-4">
                No files were found in the specified Google Drive folder.
              </p>
              <button
                onClick={() => fetchDriveFiles()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveFilesFetcher;
