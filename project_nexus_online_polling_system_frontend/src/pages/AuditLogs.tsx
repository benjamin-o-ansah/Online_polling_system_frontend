import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi, AuditLog } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { format } from "date-fns";

const LIMIT = 20;

const actionColors: Record<string, string> = {
  POLL_VOTE: "bg-blue-100 text-blue-700 border-blue-200",
  POLL_PUBLISH: "bg-emerald-100 text-emerald-700 border-emerald-200",
  POLL_CREATE: "bg-green-100 text-green-700 border-green-200",
  POLL_DELETED: "bg-red-100 text-red-700 border-red-200",
  POLL_CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  USER_DELETE: "bg-red-100 text-red-700 border-red-200",
  USER_LOGIN: "bg-slate-100 text-slate-600 border-slate-200",
  AUTH_FAILURE: "bg-amber-100 text-amber-700 border-amber-200",
  LOGIN_OTP_REQUESTED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  LOGIN_SUCCESS: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function getResourceLabel(log: AuditLog): string {
  if (log.entity_type === "POLL" && log.entity_id) {
    return `Poll: #${log.entity_id.slice(0, 8).toUpperCase()}`;
  }
  if (log.entity_type === "AUTH") return "System Access";
  if (log.entity_type === "USER" && log.entity_id) {
    return `User: #${log.entity_id.slice(0, 8).toUpperCase()}`;
  }
  return log.entity_type || "System";
}

function getResultLabel(action: string): { text: string; color: string } {
  if (action.includes("FAILURE") || action.includes("DELETE")) {
    return { text: action.includes("FAILURE") ? "Failed" : "Success", color: action.includes("FAILURE") ? "text-red-500" : "text-emerald-600" };
  }
  return { text: "Success", color: "text-emerald-600" };
}

export default function AuditLogs() {
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["auditLogs", offset],
    queryFn: () => adminApi.auditLogs({ limit: LIMIT, offset }),
  });

  const allActions = useMemo(() => {
    if (!data?.logs) return [];
    const set = new Set(data.logs.map((l) => l.action));
    return Array.from(set).sort();
  }, [data]);

  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];
    return data.logs.filter((log) => {
      const matchesSearch =
        !search ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.actor_user_id?.toLowerCase().includes(search.toLowerCase()) ||
        log.entity_id?.toLowerCase().includes(search.toLowerCase()) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase()));
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [data, search, actionFilter]);

  const handleExportCSV = () => {
    if (!filteredLogs.length) return;
    const header = "Timestamp,User,Action,Resource,Entity ID,IP Address\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${format(new Date(l.created_at), "MMM d, yyyy HH:mm:ss")}","${l.actor_user_id || "Unknown"}","${l.action}","${getResourceLabel(l)}","${l.entity_id || ""}","${l.ip_address || ""}"`
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

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and track all system activities for compliance and security.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mt-6 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by resource or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[160px]">
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
      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-lg" />
      ) : (
        <div className="rounded-lg border bg-card overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resource</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
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
                            <p className="text-sm font-medium text-foreground">{userDisplay}</p>
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
                          <span className="text-muted-foreground">{log.entity_type || "System"}</span>
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
          {data && data.total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {offset + 1}-{Math.min(offset + LIMIT, data.total)} of {data.total} logs
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages}
                  onClick={() => setOffset(offset + LIMIT)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
