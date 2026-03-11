import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Eye,
  Activity,
  Shield,
  Database,
  Globe,
  Server,
  ShoppingCart,
  Package,
  CreditCard,
} from 'lucide-react';
import { systemLogAPI } from '../../services/api';

const AdminSystemLogsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('24h');
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [refreshTick, setRefreshTick] = useState(0);
  const [logStats, setLogStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    success: 0,
    info: 0,
  });

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const response = await systemLogAPI.getLogs({
          page: '1',
          limit: '200',
          search: searchQuery || undefined,
          level: levelFilter !== 'all' ? levelFilter : undefined,
          source: sourceFilter !== 'all' ? sourceFilter : undefined,
          range: dateFilter,
          sort: 'created-desc',
        });

        setLogs(response?.data?.data?.items || []);
        setLogStats(response?.data?.data?.stats || {
          total: 0,
          errors: 0,
          warnings: 0,
          success: 0,
          info: 0,
        });
      } catch (error) {
        console.error('Failed to load system logs:', error);
        toast.error('Failed to load logs');
        setLogs([]);
        setLogStats({
          total: 0,
          errors: 0,
          warnings: 0,
          success: 0,
          info: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [searchQuery, levelFilter, sourceFilter, dateFilter, refreshTick]);

  const levelConfig = {
    error: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle, label: 'Error' },
    warning: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle, label: 'Warning' },
    info: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Info, label: 'Info' },
    success: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Success' },
  };

  const sourceConfig = {
    auth: { icon: Shield, color: 'text-violet-500' },
    payment: { icon: CreditCard, color: 'text-emerald-500' },
    order: { icon: ShoppingCart, color: 'text-blue-500' },
    orders: { icon: ShoppingCart, color: 'text-blue-500' },
    inventory: { icon: Package, color: 'text-amber-500' },
    database: { icon: Database, color: 'text-rose-500' },
    api: { icon: Globe, color: 'text-cyan-500' },
    security: { icon: Shield, color: 'text-indigo-500' },
    backup: { icon: Server, color: 'text-slate-500' },
    system: { icon: Activity, color: 'text-slate-500' },
  };

  const renderedLogs = useMemo(() => logs.map((log) => {
    const level = String(log.level || 'info').toLowerCase();
    return {
      ...log,
      level: levelConfig[level] ? level : 'info',
      source: String(log.source || 'system').toLowerCase(),
    };
  }), [logs]);

  const handleExportLogs = () => {
    if (renderedLogs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    const payload = JSON.stringify(renderedLogs, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                System Logs
              </h1>
              <p className="text-slate-600">Live audit trail from your system log records</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRefreshTick((prev) => prev + 1)}
                className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleExportLogs}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Logs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard title="Total Logs" value={logStats.total} icon={Activity} className="bg-slate-50" />
            <StatsCard title="Errors" value={logStats.errors} icon={XCircle} className="bg-rose-50 border border-rose-100 text-rose-900 text-rose-700 text-rose-500" />
            <StatsCard title="Warnings" value={logStats.warnings} icon={AlertCircle} className="bg-amber-50 border border-amber-100 text-amber-900 text-amber-700 text-amber-500" />
            <StatsCard title="Success" value={logStats.success} icon={CheckCircle} className="bg-emerald-50 border border-emerald-100 text-emerald-900 text-emerald-700 text-emerald-500" />
            <StatsCard title="Info" value={logStats.info} icon={Info} className="bg-blue-50 border border-blue-100 text-blue-900 text-blue-700 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs by message, ID, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              >
                <option value="all">All Levels</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              >
                <option value="all">All Sources</option>
                <option value="auth">Authentication</option>
                <option value="payment">Payment</option>
                <option value="order">Orders</option>
                <option value="inventory">Inventory</option>
                <option value="database">Database</option>
                <option value="api">API</option>
                <option value="security">Security</option>
                <option value="backup">Backup</option>
                <option value="system">System</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading logs...</div>
        ) : (
          <div className="space-y-4">
            {renderedLogs.map((log) => {
              const selected = selectedLogId === log.id;
              const levelMeta = levelConfig[log.level] || levelConfig.info;
              const sourceMeta = sourceConfig[log.source] || sourceConfig.system;
              return (
                <div key={log.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${levelMeta.color}`}>
                        <levelMeta.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-mono text-sm text-slate-600">{log.id}</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelMeta.color}`}>
                                {levelMeta.label}
                              </span>
                              <div className="flex items-center gap-1">
                                <sourceMeta.icon className={`h-3 w-3 ${sourceMeta.color}`} />
                                <span className="text-xs text-slate-600 capitalize">{log.source}</span>
                              </div>
                            </div>
                            <h3 className="font-medium text-slate-900">{log.message}</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedLogId(selected ? null : log.id)}
                            className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                          >
                            <Eye className="h-4 w-4 text-slate-600" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{formatDateTime(log.timestamp)}</span>
                          <span>User: {log.user || 'system'}</span>
                          <span>IP: {log.ip || '-'}</span>
                        </div>

                        {selected && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="bg-slate-50 rounded-lg p-4">
                              <h4 className="font-medium text-slate-900 mb-3">Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(log.details || {}).map(([key, value]) => (
                                  <div key={key} className="flex justify-between text-sm">
                                    <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                    <span className="font-medium text-slate-900">{String(value)}</span>
                                  </div>
                                ))}
                                {Object.keys(log.details || {}).length === 0 && (
                                  <div className="text-sm text-slate-500">No extra details recorded.</div>
                                )}
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-600">
                                  <strong>User Agent:</strong> {log.userAgent || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && renderedLogs.length === 0 && (
          <div className="text-center py-12">
            <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No logs found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your filters or time range</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setLevelFilter('all');
                setSourceFilter('all');
                setDateFilter('24h');
              }}
              className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, className = 'bg-slate-50' }) => {
  const tokens = className.split(' ');
  const valueClass = tokens.find((item) => item.startsWith('text-') && item.endsWith('-900')) || 'text-slate-900';
  const labelClass = tokens.find((item) => item.startsWith('text-') && item.endsWith('-700')) || 'text-slate-600';
  const iconClass = tokens.find((item) => item.startsWith('text-') && item.endsWith('-500')) || 'text-slate-400';

  return (
    <div className={`rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm ${labelClass}`}>{title}</span>
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </div>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
};

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

export default AdminSystemLogsPage;
