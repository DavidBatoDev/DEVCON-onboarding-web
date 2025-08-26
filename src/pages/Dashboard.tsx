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
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Settings,
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

  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* DEVCON Logo Animation */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping bg-yellow-400/20 rounded-full"></div>
          <div className="relative bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-full">
            <BarChart3 size={48} className="text-gray-900" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">Loading Dashboard</h2>
          <p className="text-white/70 text-lg max-w-md mx-auto">
            Connecting to services and gathering analytics...
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

              <button
                onClick={() => (window.location.href = "/")}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <BarChart3 className="size-4" />
                <span>Test Chat</span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-2 rounded-lg shadow-lg">
                  <BarChart3 className="text-gray-900" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    DEVCON Dashboard
                  </h1>
                  <p className="text-white/70 text-sm">
                    Monitor and manage your document processing system
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/60">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">System Online</span>
              </div>

              <button
                onClick={() => fetchDriveFiles()}
                disabled={loading || isRebuilding}
                className="flex items-center space-x-2 bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 backdrop-blur-sm"
                title="Refresh All Data"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh All</span>
              </button>

              <button
                onClick={() =>
                  handleRebuildIndex(
                    selectedFiles.size > 0 ? Array.from(selectedFiles) : null
                  )
                }
                disabled={loading || isRebuilding || files.length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 shadow-lg"
                title="Only use if you need to re-index documents"
              >
                <Play
                  className={`size-4 ${isRebuilding ? "animate-spin" : ""}`}
                />
                <span>
                  {isRebuilding
                    ? "Processing..."
                    : selectedFiles.size > 0
                    ? `Re-index Selected (${selectedFiles.size})`
                    : "Re-index All"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/30 p-3 rounded-lg">
                <File className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-white/70 text-sm">Indexed Documents</p>
                <p className="text-3xl font-bold text-white">
                  {actualDocumentCount}
                </p>
                <p className="text-green-400 text-xs">
                  {healthData?.document_count
                    ? "Chunked & Ready"
                    : stats?.document_count
                    ? "API Count"
                    : "File Count"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/30 p-3 rounded-lg">
                <Folder className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-white/70 text-sm">Source Files</p>
                <p className="text-3xl font-bold text-white">
                  {totalFilesCount}
                </p>
                <p className="text-blue-400 text-xs">In Drive</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/30 p-3 rounded-lg">
                <BarChart3 className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-white/70 text-sm">Chunk Ratio</p>
                <p className="text-3xl font-bold text-white">
                  {totalFilesCount > 0
                    ? Math.round(actualDocumentCount / totalFilesCount)
                    : 0}
                </p>
                <p className="text-purple-400 text-xs">Docs per File</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500/30 p-3 rounded-lg">
                <Activity className="text-orange-400" size={24} />
              </div>
              <div>
                <p className="text-white/70 text-sm">System Status</p>
                <p className="text-3xl font-bold text-white">
                  {healthData?.rag_status === "ready" ? "Ready" : "Loading"}
                </p>
                <p className="text-orange-400 text-xs">
                  {healthData?.rag_status === "ready"
                    ? "Operational"
                    : "Initializing"}
                </p>
              </div>
            </div>
          </div>
        </div>

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
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="text-yellow-400" size={20} />
              <span>Processing Summary</span>
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

        {/* Search and Filter Controls */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 size-4" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="text-white/50 size-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="processed">Processed</option>
                  <option value="available">Available</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <button
                onClick={selectAllFiles}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
              >
                {selectedFiles.size === files.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          </div>
        </div>

        {/* Files List */}
        {filteredFiles.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Folder className="text-blue-400" size={20} />
                  <span>
                    Drive Files ({filteredFiles.length} of {files.length})
                  </span>
                </h3>
                <div className="text-sm text-white/60">
                  {selectedFiles.size > 0 && `${selectedFiles.size} selected`}
                </div>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {filteredFiles.map((file, index) => (
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
        {!loading && filteredFiles.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <Search className="mx-auto text-white/50 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Files Found
              </h3>
              <p className="text-white/70 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "No files match your current search or filter criteria."
                  : "No files were found in the specified Google Drive folder."}
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
