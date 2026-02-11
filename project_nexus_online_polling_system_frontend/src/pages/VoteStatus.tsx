import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { pollsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
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
    return <LoadingSpinner size="lg" label="Loading vote status..." overlay />;
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
        {/* Green glow header */}
        <div className="flex flex-col items-center pt-10 pb-6 px-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-100 opacity-80 mb-5" />
          <h1 className="text-2xl font-bold text-foreground">Vote Submitted</h1>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Your participation has been recorded. You cannot change your vote for this poll.
          </p>
        </div>

        <CardContent className="px-6 pb-8 space-y-6">
          {/* Poll Question */}
          {poll && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Poll Question</p>
              <p className="font-medium text-foreground">{poll.title}</p>
            </div>
          )}

          {/* Your Selection */}
          {votedOption && (
            <div className="relative">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Your Selection</p>
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 flex items-center gap-3 relative">
                <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
                <span className="font-medium text-foreground">{votedOption.option_text}</span>
                {/* Blue dot indicator */}
                <div className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-primary" />
              </div>
            </div>
          )}

          {/* Vote Receipt */}
          <div className="border-t pt-5 space-y-3">
            {voteStatus.vote_id && (
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Vote ID</span>
                <span className="text-sm font-mono font-medium">#{voteStatus.vote_id.slice(0, 8).toUpperCase()}</span>
              </div>
            )}
            {voteStatus.voted_at && (
              <>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-medium">{format(new Date(voteStatus.voted_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Time</span>
                  <span className="text-sm font-medium">{format(new Date(voteStatus.voted_at), "h:mm a")}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-semibold">VERIFIED</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button asChild className="w-full h-12 text-base font-semibold">
              <Link to={`/polls/${id}/results`}>View Live Results</Link>
            </Button>
            <Button variant="outline" asChild className="w-full h-12 text-base">
              <Link to="/polls">Back to Polls</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}