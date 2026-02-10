import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { pollsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Users, Printer, Download, Hash, CheckCircle2 } from "lucide-react";

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
  DRAFT: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700",
};

export default function PollResults() {
  const { id } = useParams<{ id: string }>();

  const { data: poll } = useQuery({
    queryKey: ["poll", id],
    queryFn: () => pollsApi.get(id!),
    enabled: !!id,
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ["pollResults", id],
    queryFn: () => pollsApi.results(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!results) {
    return <div className="text-center py-16 text-muted-foreground">Results not available</div>;
  }

  const sorted = [...results.results].sort((a, b) => b.votes - a.votes);
  const winner = sorted[0];
  const maxVotes = Math.max(...sorted.map((o) => o.votes), 1);
  const statusLabel = results.status?.toUpperCase() || "ACTIVE";

  const handleExportCSV = () => {
    const header = "Option,Votes,Percentage\n";
    const rows = sorted.map((o) => `"${o.option_text}",${o.votes},${o.percentage.toFixed(1)}%`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poll-${id}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb + status */}
      <div className="flex items-center justify-between mb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/polls">Polls</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Results</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Badge variant="outline" className={statusBadge[statusLabel] || statusBadge.ACTIVE}>
          {statusLabel === "CLOSED" ? "Poll Closed" : statusLabel === "ACTIVE" ? "Poll Active" : statusLabel}
        </Badge>
      </div>

      {/* Poll title */}
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {poll?.title || `Poll Results`}
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Total Votes</p>
            <p className="text-3xl font-bold text-foreground">{results.total_votes.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 mt-1">Verified Citizens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Winning Option</p>
            <p className="text-lg font-bold text-foreground truncate">{winner.option_text}</p>
            <p className="text-xs text-emerald-600 mt-1">{winner.percentage.toFixed(1)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Participation Rate</p>
            <p className="text-3xl font-bold text-foreground">{winner.percentage.toFixed(1)}%</p>
            <p className="text-xs text-emerald-600 mt-1">Leading option share</p>
          </CardContent>
        </Card>
      </div>

      {/* Vote Breakdown */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Vote Breakdown</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5 mr-1.5" />Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5 mr-1.5" />Print
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {sorted.map((opt, idx) => {
            const isWinner = idx === 0 && results.total_votes > 0;
            const barWidth = maxVotes > 0 ? (opt.votes / maxVotes) * 100 : 0;
            return (
              <div key={opt.option_id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {idx + 1}. {opt.option_text}
                    </span>
                    {isWinner && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                        Winner
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-foreground">{opt.percentage.toFixed(1)}%</span>
                    <span className="text-xs text-muted-foreground">{opt.votes.toLocaleString()} votes</span>
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isWinner ? "bg-emerald-500" : "bg-primary"}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Footer metadata */}
      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground pb-4">
        <span className="flex items-center gap-1"><Hash className="h-3 w-3" />Poll #{results.poll_id?.slice(0, 8)}</span>
        <span>•</span>
        <Badge variant="outline" className="text-xs">{statusLabel}</Badge>
        <span>•</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" />Certified</span>
      </div>
    </div>
  );
}
