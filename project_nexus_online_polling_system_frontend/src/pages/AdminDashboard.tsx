import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi, pollsApi, AuditLog } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Vote,
  BarChart3,
  Activity,
  XCircle,
  FileText,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import { format } from "date-fns";

const AUDIT_LIMIT = 15;

const actionColors: Record<string, string> = {
  POLL_VOTE: "bg-blue-100 text-blue-700 border-blue-200",
  POLL_PUBLISH: "bg-emerald-100 text-emerald-700 border-emerald-200",
  POLL_CREATE: "bg-green-100 text-green-700 border-green-200",
  POLL_DELETED: "bg-red-100 text-red-700 border-red-200",
  POLL_CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  USER_DELETE: "bg-red-100 text-red-700 border-red-200",
  LOGIN_OTP_REQUESTED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  LOGIN_SUCCESS: "bg-emerald-100 text-emerald-700 border-emerald-200",
  AUTH_FAILURE: "bg-amber-100 text-amber-700 border-amber-200",
};

function getResultLabel(action: string): { text: string; color: string } {
  if (action.includes("FAILURE") || action.includes("DELETE")) {
    return {
      text: action.includes("FAILURE") ? "Failed" : "Success",
      color: action.includes("FAILURE") ? "text-red-500" : "text-emerald-600",
    };
  }
  return { text: "Success", color: "text-emerald-600" };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isSystemAdmin = user?.role === "SYSTEM_ADMIN";

  // Audit log state
  const [auditOffset, setAuditOffset] = useState(0);
  const [auditSearch, setAuditSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  // Poll admin: derive metrics from polls list
  const { data: allPolls, isLoading: pollsLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: () => pollsApi.list(),
    enabled: !isSystemAdmin,
  });

  // System admin: use admin metrics endpoint
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["adminMetrics"],
    queryFn: () => adminApi.metrics(),
    enabled: isSystemAdmin,
  });

  // System admin: audit logs
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["auditLogs", auditOffset],
    queryFn: () => adminApi.auditLogs({ limit: AUDIT_LIMIT, offset: auditOffset }),
    enabled: isSystemAdmin,
  });

  // Derive poll admin metrics
  const pollAdminMetrics = allPolls
    ? {
        total_polls: allPolls.length,
        active_polls: allPolls.filter((p) => p.status === "active").length,
        closed_polls: allPolls.filter((p) => p.status === "closed").length,
        total_votes: allPolls.reduce(
          (sum, p) => sum + p.options.reduce((s, o) => s + (o.vote_count || 0), 0),
          0
        ),
      }
    : null;

  const allActions = useMemo(() => {
    if (!auditData?.logs) return [];
    const set = new Set(auditData.logs.map((l) => l.action));
    return Array.from(set).sort();
  }, [auditData]);

  const filteredLogs = useMemo(() => {
    if (!auditData?.logs) return [];
    return auditData.logs.filter((log) => {
      const matchesSearch =
        !auditSearch ||
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.actor_user_id?.toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(auditSearch.toLowerCase()));
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [auditData, auditSearch, actionFilter]);

  const handleExportCSV = () => {
    if (!filteredLogs.length) return;
    const header = "Timestamp,User,Action,Entity Type,Entity ID,IP Address\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${format(new Date(l.created_at), "MMM d, yyyy HH:mm:ss")}","${l.actor_user_id || "Unknown"}","${l.action}","${l.entity_type || ""}","${l.entity_id || ""}","${l.ip_address || ""}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statsLoading = isSystemAdmin ? metricsLoading : pollsLoading;
  const initials =
    user?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "U";

  const totalAuditPages = auditData ? Math.ceil(auditData.total / AUDIT_LIMIT) : 0;
  const currentAuditPage = Math.floor(auditOffset / AUDIT_LIMIT) + 1;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {isSystemAdmin ? "Admin Dashboard" : "Poll Dashboard"}
      </h1>

      {/* Admin Profile Card (System Admin only) */}
      {isSystemAdmin && (
        <Card className="mb-8">
          <CardContent className="p-6 flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {user?.username || user?.email}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-primary font-medium mt-0.5">System Administrator</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isSystemAdmin && metrics ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <MetricCard icon={Users} label="Total Users" value={metrics.users.total} />
            <MetricCard icon={Vote} label="Total Polls" value={metrics.polls.total} />
            <MetricCard icon={Activity} label="Active Polls" value={metrics.polls.active} />
            <MetricCard icon={BarChart3} label="Total Votes" value={metrics.votes.total} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard icon={FileText} label="Draft Polls" value={metrics.polls.draft} />
            <MetricCard icon={XCircle} label="Closed Polls" value={metrics.polls.closed} />
            <MetricCard
              icon={Clock}
              label="Polls (24h)"
              value={metrics.polls.created_last_24h}
              subtitle="Created last 24h"
            />
            <MetricCard
              icon={TrendingUp}
              label="Votes (24h)"
              value={metrics.votes.submitted_last_24h}
              subtitle="Submitted last 24h"
            />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard icon={Vote} label="Total Polls" value={pollAdminMetrics?.total_polls ?? 0} />
          <MetricCard
            icon={Activity}
            label="Active Polls"
            value={pollAdminMetrics?.active_polls ?? 0}
          />
          <MetricCard
            icon={XCircle}
            label="Closed Polls"
            value={pollAdminMetrics?.closed_polls ?? 0}
          />
          <MetricCard
            icon={BarChart3}
            label="Total Votes"
            value={pollAdminMetrics?.total_votes ?? 0}
          />
        </div>
      )}

      {/* Audit Logs Section (System Admin only) */}
      {isSystemAdmin && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Audit Logs</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Track all system activities for compliance and security.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {allActions.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {auditLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Timestamp
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        User
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Action
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Resource
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                        Result
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => {
                        const result = getResultLabel(log.action);
                        const userDisplay = log.actor_user_id
                          ? log.actor_user_id.slice(0, 8)
                          : "Unknown";
                        const subLabel = log.actor_role
                          ? log.actor_role
                          : log.ip_address?.split(",")[0] || "";
                        return (
                          <TableRow key={log.id} className="hover:bg-muted/30">
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-muted">
                                    {userDisplay.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {userDisplay}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{subLabel}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium ${actionColors[log.action] || "bg-muted text-muted-foreground"}`}
                              >
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.entity_id ? (
                                <span>
                                  {log.entity_type}:{" "}
                                  <span className="text-primary font-medium">
                                    #{log.entity_id.slice(0, 8).toUpperCase()}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  {log.entity_type || "System"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`text-sm font-medium ${result.color}`}>
                                {result.text}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {auditData && auditData.total > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {auditOffset + 1}-
                      {Math.min(auditOffset + AUDIT_LIMIT, auditData.total)} of{" "}
                      {auditData.total} logs
                    </p>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={auditOffset === 0}
                        onClick={() => setAuditOffset(Math.max(0, auditOffset - AUDIT_LIMIT))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentAuditPage >= totalAuditPages}
                        onClick={() => setAuditOffset(auditOffset + AUDIT_LIMIT)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle || label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
