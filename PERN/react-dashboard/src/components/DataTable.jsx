import { useMemo, useState, useEffect } from "react";
import { Loader2, ArrowUpDown, Download, HelpCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import Model from "./Model";

const DataTable = ({
  title,
  columns,
  data = [],
  loading = false,
  error = null,
  onEdit,
  onDelete,
  filterFn,
  csv = true,
  csvFullData = false,
  // Server-side pagination props (optional)
  totalItems = 0,
  currentPage: externalCurrentPage = 1,
  onPageChange = null,
  pageSize: externalPageSize = 20,
  onPageSizeChange = null,
}) => {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(externalPageSize);
  const [openCSVInfo, setOpenCSVInfo] = useState(false);

  // Determine if using server-side pagination
  const useServerPagination = !!onPageChange;
  
  // Use external or internal page size
  const itemsPerPage = useServerPagination ? externalPageSize : internalPageSize;
  
  // Use external page if server pagination, otherwise internal
  const currentPage = useServerPagination ? externalCurrentPage : internalCurrentPage;

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    if (useServerPagination && onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalCurrentPage(1); // Reset to first page when changing page size
    }
  };

  // Helpers
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const shortenText = (text, limit = 60) =>
    text?.length > limit ? text.slice(0, limit) + "..." : text;

  // Helper to flatten nested objects for CSV
  const flattenObject = (obj, prefix = '') => {
    const flattened = {};
    
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          flattened[newKey] = JSON.stringify(value);
        } else {
          flattened[newKey] = value;
        }
      }
    }
    
    return flattened;
  };

  // CSV Helpers - Export ALL fields if csvFullData is true
  const convertToCSV = (rows) => {
    if (!rows?.length) return "";

    let headers, keys;

    if (csvFullData) {
      const flattenedRows = rows.map(row => flattenObject(row));
      const allKeys = new Set();
      flattenedRows.forEach(row => {
        Object.keys(row).forEach(key => allKeys.add(key));
      });
      
      const excludeKeys = ['actions', 'content', 'faqs', 'schema_markup', 'secondary_keywords'];
      keys = Array.from(allKeys).filter(key => !excludeKeys.some(exclude => key.includes(exclude)));
      headers = keys.map(key => key.replace(/_/g, ' ').toUpperCase());
      
      const csvRows = flattenedRows.map(item => {
        return keys.map(key => {
          let value = item[key];
          
          if (key.includes('created_at') || key.includes('updated_at') || key.includes('published_at')) {
            value = formatDateTime(value);
          }
          
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          
          if (typeof value === 'string') {
            value = value.replace(/"/g, '""');
          }
          
          return `"${value ?? ""}"`;
        }).join(",");
      });
      
      return [headers.join(","), ...csvRows].join("\n");
    } else {
      headers = columns
        .filter(col => col?.key !== "actions")
        .map(col => col?.label) || [];

      keys = columns
        .filter(col => col?.key !== "actions")
        .map(col => col?.key) || [];

      const csvRows = rows.map(item => {
        return keys.map(key => {
          let value = item?.[key];

          if (key === "created_at") value = formatDateTime(value);
          if (key === "updated_at") value = formatDateTime(value);

          if (typeof value === "string") {
            value = value.replace(/"/g, '""');
          }

          return `"${value ?? ""}"`;
        }).join(",");
      });

      return [headers.join(","), ...csvRows].join("\n");
    }
  };

  const downloadCSV = () => {
    // For CSV export, use the current data (already filtered/sorted)
    const exportData = sortedData;
    const csvData = convertToCSV(exportData);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title || "data"}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter + Search
  const filteredData = useMemo(() => {
    let result = filterFn ? data?.filter(filterFn) : data;
    if (!result) return [];

    if (!search) return result;
    
    return result?.filter((item) =>
      Object?.values(item)
        ?.join(" ")
        ?.toLowerCase()
        ?.includes(search?.toLowerCase())
    );
  }, [data, search, filterFn]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig?.key) return filteredData;
    return [...filteredData]?.sort((a, b) => {
      let aVal = a?.[sortConfig?.key];
      let bVal = b?.[sortConfig?.key];
      
      // Handle dates
      if (sortConfig?.key === "created_at" || sortConfig?.key === "updated_at") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortConfig?.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig?.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    if (!key || !columns.find(col => col.key === key)?.sortable) return;
    let direction = "asc";
    if (sortConfig?.key === key && sortConfig?.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // Reset page when search changes (client-side only)
  useEffect(() => {
    if (!useServerPagination) {
      setInternalCurrentPage(1);
    }
  }, [search, filterFn, data, useServerPagination]);

  // Calculate pagination
  let totalPages, paginatedData;
  
  if (useServerPagination) {
    // Server-side pagination
    totalPages = Math.ceil(totalItems / itemsPerPage);
    paginatedData = sortedData; // Data is already paginated from API
  } else {
    // Client-side pagination
    totalPages = Math.ceil(sortedData?.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    paginatedData = sortedData?.slice(start, start + itemsPerPage);
  }

  const handlePageChange = (newPage) => {
    if (useServerPagination && onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  // Check if actions column has custom render
  const actionsColumn = columns?.find(col => col?.key === "actions");
  const hasCustomActions = actionsColumn?.render && typeof actionsColumn.render === 'function';

  return (
    <section className={`${filterFn ? "" : "min-h-1/2"}`}>
      <div className="mx-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="mb-6 flex flex-col items-center justify-between gap-3 md:flex-row">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            {title}
          </h2>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            {/* Search Input - Always visible */}
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e?.target?.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none transition-all focus:ring-2 focus:ring-[var(--brand-primary)]"
            />

            {/* Items Per Page Selector */}
            <select
              value={itemsPerPage}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--text-primary)] outline-none transition-all focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            {/* CSV Buttons */}
            {csv && (
              <div className="flex gap-2">
                <button
                  onClick={downloadCSV}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  <Download size={16} />
                  Download CSV {csvFullData ? '(All Fields)' : ''}
                </button>

                <button
                  onClick={() => setOpenCSVInfo(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table with loading state only in body */}
        <div className="overflow-x-auto rounded-lg transition-all duration-300 animate-in fade-in">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--brand-primary)] sticky top-0">
              <tr>
                {columns?.map((col) => (
                  <th
                    key={col?.key}
                    onClick={() => handleSort(col?.key)}
                    className={`px-4 py-3 text-left font-semibold text-white whitespace-nowrap ${
                      col?.sortable 
                        ? "cursor-pointer select-none hover:bg-[var(--brand-secondary)] transition-colors" 
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {col?.label}
                      {col?.sortable && <ArrowUpDown className="h-4 w-4 opacity-80" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns?.length} className="py-20 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
                      <span className="ml-3 text-[var(--text-secondary)]">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns?.length} className="py-10 text-center">
                    <p className="text-red-500">{error}</p>
                  </td>
                </tr>
              ) : paginatedData?.length > 0 ? (
                paginatedData?.map((item, index) => (
                  <tr
                    key={item?.id || item?._id || index}
                    className={`border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-hover)] ${
                      index % 2 === 0 ? "bg-[var(--surface)]" : "bg-[var(--background)]"
                    }`}
                  >
                    {columns?.map((col) => {
                      // If actions column and has custom render, use it
                      if (col?.key === "actions" && hasCustomActions) {
                        return (
                          <td key={col?.key} className="px-4 py-2">
                            {col.render(item)}
                          </td>
                        );
                      }
                      
                      // If actions column and no custom render, show default buttons
                      if (col?.key === "actions") {
                        return (
                          <td key={col?.key} className="px-4 py-2">
                            <div className="flex gap-2">
                              {onEdit && (
                                <button
                                  onClick={() => onEdit(item)}
                                  className="text-blue-500 transition-colors hover:text-blue-600"
                                >
                                  Edit
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete?.(item?.id ?? item?.staff_id, item)}
                                  className="text-red-500 transition-colors hover:text-red-600"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      }

                      if (col?.type === "image") {
                        const imagesArray = Array.isArray(item?.[col?.key]) ? item?.[col?.key] : [];
                        const imgSrc = imagesArray?.[0] || "/placeholder-img.jpg";

                        return (
                          <td key={col?.key} className="px-4 py-2 align-top">
                            {imagesArray?.length ? (
                              <img
                                src={imgSrc}
                                alt={item?.name || "image"}
                                className="h-16 w-20 rounded object-cover"
                              />
                            ) : "-"}
                          </td>
                        );
                      }

                      let value = col?.render ? col?.render(item) : item?.[col?.key];

                      if (!col?.render) {
                        if (col?.key === "created_at" || col?.key === "updated_at") {
                          value = formatDateTime(value);
                        }
                        if (col?.type === "date") value = formatDate(value);
                        if (col?.type === "text" && col?.maxLength) {
                          value = shortenText(value, col?.maxLength);
                        }
                      }

                      return (
                        <td key={col?.key} className="px-4 py-2 align-top text-[var(--text-primary)]">
                          {value || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns?.length} className="py-10 text-center">
                    <p className="text-[var(--text-secondary)]">No data found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Only show when not loading and has data */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <span className="text-sm text-[var(--text-secondary)]">
              Page {currentPage} of {totalPages}
              {useServerPagination && totalItems > 0 && (
                <span className="ml-2 text-xs">({totalItems} total items)</span>
              )}
            </span>

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* CSV Info Modal */}
      <Model open={openCSVInfo} onClose={() => setOpenCSVInfo(false)} title="About CSV Export">
        <p className="mb-2 text-[var(--text-primary)]">CSV = Comma-Separated Values</p>
        <p className="text-[var(--text-secondary)]">👉 Opens directly in Excel, Google Sheets</p>
        <p className="text-[var(--text-secondary)]">👉 Lightweight and fast</p>
        <p className="text-[var(--text-secondary)]">👉 Industry standard for export</p>
        {csvFullData && (
          <p className="mt-2 text-[var(--brand-primary)]">✅ Exporting ALL fields from database</p>
        )}
        <p className="mt-4 font-medium text-[var(--text-primary)]">
          CSV Format Use Case → Data export, analysis ✅
        </p>
      </Model>
    </section>
  );
};

export default DataTable;