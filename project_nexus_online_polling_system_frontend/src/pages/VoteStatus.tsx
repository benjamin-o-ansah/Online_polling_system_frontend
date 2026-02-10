import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { pollsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Calendar, Clock, Hash } from "lucide-react";
import { format } from "date-fns";

export default function VoteStatus() {
  const { id } = useParams<{ id: string }>();

  const { data: voteStatus, isLoading } = useQuery({
    queryKey: ["voteStatus", id],
    queryFn: () => pollsApi.voteStatus(id!),
    enabled: !!id,
  });

  const { data: poll } = useQuery({
    queryKey: ["poll", id],
    queryFn: () => pollsApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="max-w-lg mx-auto"><Skeleton className="h-96 w-full" /></div>;
  }

  if (!voteStatus?.has_voted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-muted-foreground mb-4">No vote found for this poll</p>
        <Button asChild><Link to={`/polls/${id}`}>Go to Poll</Link></Button>
      </div>
    );
  }

  const votedOption = poll?.options.find((o) => o.id === voteStatus.option_id);

  return (
    <div className="max-w-lg mx-auto">
      <Card className="overflow-hidden">
        <div className="bg-emerald-50 p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Vote Submitted</h1>
          <p className="text-muted-foreground mt-1">Your vote has been recorded successfully</p>
        </div>

        <CardContent className="p-6 space-y-6">
          {poll && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Poll Question</p>
              <p className="font-medium">{poll.title}</p>
            </div>
          )}

          {votedOption && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Selection</p>
              <div className="rounded-lg border border-primary bg-primary/5 p-3">
                <span className="font-medium text-primary">{votedOption.option_text}</span>
              </div>
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Vote Receipt</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {voteStatus.vote_id && (
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Vote ID</p>
                    <p className="font-mono text-xs">{voteStatus.vote_id}</p>
                  </div>
                </div>
              )}
              {voteStatus.voted_at && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Date</p>
                      <p className="font-medium">{format(new Date(voteStatus.voted_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Time</p>
                      <p className="font-medium">{format(new Date(voteStatus.voted_at), "h:mm a")}</p>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-xs">Verified</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button asChild className="flex-1"><Link to={`/polls/${id}/results`}>View Live Results</Link></Button>
            <Button variant="outline" asChild className="flex-1"><Link to="/polls">Back to Polls</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
