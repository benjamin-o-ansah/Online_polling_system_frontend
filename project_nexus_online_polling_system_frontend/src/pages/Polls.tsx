import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { pollsApi, Poll } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Calendar, ChevronRight, BarChart3 } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
  draft: "bg-amber-100 text-amber-700 border-amber-200",
};

function PollCard({ poll }: { poll: Poll }) {
  return (
    <Link to={`/polls/${poll.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={statusColors[poll.status]}>
                  {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground truncate">{poll.title}</h3>
              {poll.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{poll.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(poll.created_at), "MMM d, yyyy")}
                </span>
                {poll.total_votes !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {poll.total_votes} votes
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ResultsPollCard({ poll }: { poll: Poll }) {
  return (
    <Link to={`/polls/${poll.id}/results`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={statusColors[poll.status]}>
                  {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground truncate">{poll.title}</h3>
              {poll.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{poll.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(poll.created_at), "MMM d, yyyy")}
                </span>
                {poll.total_votes !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {poll.total_votes} votes
                  </span>
                )}
              </div>
            </div>
            <BarChart3 className="h-5 w-5 text-primary shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Polls() {
  const [tab, setTab] = useState("active");
  const { isAdmin, user } = useAuth();
  const isSystemAdmin = user?.role === "SYSTEM_ADMIN";

  const { data: allPolls, isLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: () => pollsApi.list(),
  });

  const getFilteredPolls = () => {
    if (!allPolls) return [];
    if (tab === "results") {
      // Show active + closed polls that can have results
      return allPolls.filter((p) => p.status === "active" || p.status === "closed");
    }
    return allPolls.filter((p) => p.status === tab);
  };

  const polls = getFilteredPolls();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Polls</h1>
          <p className="text-muted-foreground">Browse and participate in active polls</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link to="/polls/create"><Plus className="h-4 w-4 mr-2" />New Poll</Link>
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          {isAdmin && <TabsTrigger value="draft">Drafts</TabsTrigger>}
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
            </div>
          ) : polls.length > 0 ? (
            <div className="space-y-3">
              {polls.map((poll) =>
                tab === "results" ? (
                  <ResultsPollCard key={poll.id} poll={poll} />
                ) : (
                  <PollCard key={poll.id} poll={poll} />
                )
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">
                {tab === "results" ? "No poll results available" : `No ${tab} polls found`}
              </p>
              <p className="text-sm mt-1">Check back later for new polls</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
