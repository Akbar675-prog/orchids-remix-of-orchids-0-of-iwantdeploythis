"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getTables, getTableData, executeQuery, getTableInfo } from "./actions"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Database, 
  Table, 
  Play, 
  ArrowsClockwise, 
  CaretRight, 
  Rows, 
  Columns, 
  Plus, 
  MagnifyingGlass, 
  Funnel, 
  CaretDown,
  Layout,
  Terminal,
  Check,
  Sidebar as SidebarIcon
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface TableInfo {
  column_name: string
  data_type: string
  is_nullable: string
}

export default function DatabaseMsaPage() {
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([])
  const [customQuery, setCustomQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"data" | "schema">("data")
  const [rowCount, setRowCount] = useState<number>(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"studio" | "sql">("studio")

  useEffect(() => {
    loadTables()
  }, [])

  async function loadTables() {
    setTableLoading(true)
    const res = await getTables()
    if (res.success) {
      setTables(res.data.map((t: any) => t.tablename))
    } else {
      setError(res.error)
    }
    setTableLoading(false)
  }

  async function handleTableClick(tableName: string) {
    setSelectedTable(tableName)
    setViewMode("studio")
    setLoading(true)
    setError(null)
    setSuccess(null)
    setActiveTab("data")
    
    const [dataRes, infoRes] = await Promise.all([
      getTableData(tableName),
      getTableInfo(tableName)
    ])
    
    if (dataRes.success) {
      setTableData(dataRes.data)
      setRowCount(dataRes.data.length)
    } else {
      setError(dataRes.error)
    }
    
    if (infoRes.success) {
      setTableInfo(infoRes.data)
    }
    
    setLoading(false)
  }

  async function handleExecuteQuery() {
    if (!customQuery.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    const res = await executeQuery(customQuery)
    if (res.success) {
      setTableData(res.data)
      setRowCount(res.data.length)
      setSuccess(`Query executed - ${res.data.length} row(s) returned`)
      setSelectedTable(null)
      if (customQuery.toLowerCase().includes("create") || customQuery.toLowerCase().includes("drop") || customQuery.toLowerCase().includes("alter")) {
        loadTables()
      }
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleExecuteQuery()
    }
  }, [customQuery])

  const filteredTables = useMemo(() => {
    return tables.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [tables, searchQuery])

  const formatValue = (value: any) => {
    if (value === null) return <span className="text-slate-400 italic">NULL</span>
    if (typeof value === "boolean") return <span className={value ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>{String(value)}</span>
    if (typeof value === "object") return <span className="text-slate-500 font-mono text-[11px]">{JSON.stringify(value)}</span>
    const str = String(value)
    if (str.length > 100) return str.substring(0, 100) + "..."
    return str
  }

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans selection:bg-slate-100">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 0 : 280 }}
        className={cn(
          "border-r border-slate-200 bg-white flex flex-col overflow-hidden transition-all duration-300",
          sidebarCollapsed && "border-none"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Top Actions */}
          <div className="p-3 space-y-1">
            <button 
              onClick={() => setViewMode("sql")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                viewMode === "sql" ? "bg-slate-50 text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Terminal size={18} weight={viewMode === "sql" ? "bold" : "regular"} />
              <span className="font-medium">SQL console</span>
            </button>
            <button 
              onClick={() => setViewMode("studio")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                viewMode === "studio" && !selectedTable ? "bg-slate-50 text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Database size={18} weight={viewMode === "studio" && !selectedTable ? "bold" : "regular"} />
              <span className="font-medium">Database studio</span>
            </button>
          </div>

          <div className="px-3 py-2 border-t border-slate-100 mt-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
              <span>Explorer</span>
            </div>
            
            {/* Schema Selector */}
            <div className="px-2 mb-3">
              <button className="w-full flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-600 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-normal">schema:</span>
                  <span className="font-medium">public</span>
                </div>
                <CaretDown size={12} className="text-slate-400" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-1 px-2 mb-2">
              <div className="relative flex-1">
                <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                />
              </div>
              <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
                <Funnel size={14} />
              </button>
              <button 
                onClick={loadTables}
                className={cn("p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors", tableLoading && "animate-spin")}
              >
                <ArrowsClockwise size={14} />
              </button>
              <button className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all">
                <Plus size={14} />
              </button>
            </div>

            {/* Tables List */}
            <div className="space-y-0.5 mt-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar">
              {filteredTables.map((table) => (
                <button
                  key={table}
                  onClick={() => handleTableClick(table)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] transition-all group",
                    selectedTable === table 
                      ? "bg-slate-100 text-slate-900 font-medium" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  )}
                >
                  <Table size={16} weight={selectedTable === table ? "fill" : "regular"} className={cn(selectedTable === table ? "text-slate-900" : "text-slate-400 group-hover:text-slate-500")} />
                  <span className="truncate">{table}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Header Bar */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-md transition-colors border border-transparent hover:border-slate-200"
            >
              <SidebarIcon size={18} />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <button className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white rounded-md shadow-sm hover:bg-slate-800 transition-all">
              <Plus size={18} weight="bold" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
              <button className="px-2 py-1.5 text-slate-400 hover:bg-slate-50 border-r border-slate-100 transition-colors">
                <CaretRight size={14} className="rotate-180" />
              </button>
              <div className="px-3 py-1.5 text-sm font-medium text-slate-700 min-w-[50px] text-center bg-slate-50/50">
                {rowCount}
              </div>
              <button className="px-2 py-1.5 text-slate-400 hover:bg-slate-50 border-l border-slate-100 transition-colors">
                <CaretRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {viewMode === "sql" ? (
            /* SQL Editor Mode */
            <div className="flex flex-col h-full bg-white">
              <div className="flex-1 relative">
                <textarea
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="-- Write your SQL query here
SELECT * FROM users LIMIT 100;"
                  spellCheck={false}
                  className="w-full h-full p-6 text-sm font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none resize-none bg-slate-50/30"
                />
                <button
                  onClick={handleExecuteQuery}
                  disabled={loading || !customQuery.trim()}
                  className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
                >
                  <Play size={16} weight="fill" />
                  Run Query
                  <span className="text-slate-400 text-[10px] ml-1 opacity-60">⌘↵</span>
                </button>
              </div>
              
              {/* Query Results / Logs */}
              <AnimatePresence>
                {(error || success || (tableData.length > 0 && selectedTable === null)) && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "40%" }}
                    className="border-t border-slate-200 flex flex-col overflow-hidden"
                  >
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Results</span>
                      <div className="flex items-center gap-2">
                        {error && <span className="text-[11px] text-rose-600 font-medium">Error</span>}
                        {success && <span className="text-[11px] text-emerald-600 font-medium">Success</span>}
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-white p-4">
                      {error ? (
                        <div className="text-sm font-mono text-rose-600 whitespace-pre-wrap">{error}</div>
                      ) : tableData.length > 0 ? (
                        <div className="overflow-x-auto">
                           <DataTable data={tableData} formatValue={formatValue} />
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 italic">{success || "Ready"}</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : selectedTable ? (
            /* Studio Table Mode */
            <div className="flex flex-col h-full overflow-hidden bg-white">
              {/* Table Toolbar */}
              <div className="px-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab("data")}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2",
                      activeTab === "data" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Rows size={16} />
                    Data
                  </button>
                  <button
                    onClick={() => setActiveTab("schema")}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2",
                      activeTab === "schema" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Columns size={16} />
                    Schema
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    {selectedTable}
                  </span>
                </div>
              </div>

              {/* Data View */}
              <div className="flex-1 overflow-auto relative">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                    <div className="flex flex-col items-center gap-3">
                      <ArrowsClockwise size={32} className="text-slate-400 animate-spin" />
                      <span className="text-sm text-slate-500 font-medium">Loading table data...</span>
                    </div>
                  </div>
                ) : activeTab === "schema" ? (
                  <div className="p-8">
                    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-left">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Column Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Data Type</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Nullable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tableInfo.map((col, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-slate-900">{col.column_name}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-mono border border-slate-200 uppercase">
                                  {col.data_type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {col.is_nullable === "YES" ? (
                                  <span className="text-slate-400 text-xs">Optional</span>
                                ) : (
                                  <span className="text-slate-900 text-xs font-medium">Required</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <DataTable 
                    data={tableData} 
                    formatValue={formatValue} 
                    tableInfo={tableInfo}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                <Database size={40} className="text-slate-200" />
              </div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2">Visora Database Explorer</h3>
              <p className="text-slate-500 text-sm max-w-sm text-center px-6">
                Select a table from the sidebar to browse its content or use the SQL console to execute custom queries.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setViewMode("sql")}
                  className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-400 transition-all shadow-sm"
                >
                  <Terminal size={18} />
                  Open SQL Console
                </button>
                <button 
                  onClick={loadTables}
                  className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-400 transition-all shadow-sm"
                >
                  <ArrowsClockwise size={18} />
                  Refresh Tables
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Status */}
        <div className="h-8 bg-white border-t border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Connected</span>
            </div>
            <span className="text-[10px] text-slate-300 font-bold">•</span>
            <span className="text-[10px] font-medium text-slate-400">PostgreSQL (Supabase)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-medium">Visora Labs — fwijwgpsdakpnnfvqkfg</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  )
}

function DataTable({ 
  data, 
  formatValue,
  tableInfo = []
}: { 
  data: any[], 
  formatValue: (v: any) => React.ReactNode,
  tableInfo?: TableInfo[]
}) {
  if (data.length === 0) return (
    <div className="p-8 text-center text-slate-400 text-sm italic">
      No rows found
    </div>
  )

  const headers = Object.keys(data[0])

  return (
    <div className="relative border-collapse w-full">
      <table className="w-full text-left border-collapse table-fixed">
        <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_#e2e8f0]">
          <tr>
            <th className="w-12 px-4 py-3 border-r border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border border-slate-300 rounded bg-white shadow-inner" />
              </div>
            </th>
            {headers.map((key) => {
              const colInfo = tableInfo.find(c => c.column_name === key)
              return (
                <th key={key} className="px-4 py-3 border-r border-slate-100 min-w-[180px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-slate-900 truncate">
                      {key}
                    </span>
                    {colInfo && (
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                        {colInfo.data_type}
                      </span>
                    )}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors group">
              <td className="px-4 py-2 border-r border-slate-100 bg-slate-50/30 group-hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border border-slate-200 rounded bg-white group-hover:border-slate-300 transition-all" />
                </div>
              </td>
              {headers.map((key) => (
                <td key={key} className="px-4 py-2 text-[13px] text-slate-600 border-r border-slate-100 truncate font-mono">
                  {formatValue(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
