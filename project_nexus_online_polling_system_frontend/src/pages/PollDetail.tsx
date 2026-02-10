import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pollsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Edit, XCircle, Trash2 } from "lucide-react";
import PublishPollModal from "../components/PublishPollModal";
import ClosePollModal from "../components/ClosePollModal";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700",
  closed: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
  draft: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700",
};

export default function PollDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [showPublish, setShowPublish] = useState(false);
  const [showClose, setShowClose] = useState(false);

  const { data: poll, isLoading } = useQuery({
    queryKey: ["poll", id],
    queryFn: () => pollsApi.get(id!),
    enabled: !!id,
  });

  const { data: voteStatus } = useQuery({
    queryKey: ["voteStatus", id],
    queryFn: () => pollsApi.voteStatus(id!),
    enabled: !!id && poll?.status === "active",
  });

  const voteMutation = useMutation({
    mutationFn: (optionId: string) => pollsApi.vote(id!, { option_id: optionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", id] });
      queryClient.invalidateQueries({ queryKey: ["voteStatus", id] });
      toast({ title: "Vote submitted!", description: "Your vote has been recorded successfully.", variant: "success" });
      navigate(`/polls/${id}/voted`);
    },
    onError: (err: Error) => {
      toast({ title: "Vote failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => pollsApi.delete(id!),
    onSuccess: () => {
      toast({ title: "Poll deleted", description: "The poll has been permanently removed.", variant: "success" });
      navigate("/polls");
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete poll", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="max-w-3xl mx-auto space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!poll) {
    return <div className="text-center py-16 text-muted-foreground">Poll not found</div>;
  }

  const hasVoted = voteStatus?.has_voted;
  const canVote = poll.status === "active" && !hasVoted;

  const handleVote = () => {
    if (!selectedOption) {
      toast({ title: "Please select an option", variant: "warning" });
      return;
    }
    voteMutation.mutate(selectedOption);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate("/polls")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <Card>
        <CardContent className="p-8">
          {/* Status row */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className={statusColors[poll.status]}>
              {poll.status.toUpperCase()}
            </Badge>
            {poll.status === "active" && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Voting open
              </span>
            )}
          </div>

          {/* Title & description */}
          <h1 className="text-2xl font-bold text-foreground mb-2">{poll.title}</h1>
          {poll.description && (
            <p className="text-muted-foreground mb-8">{poll.description}</p>
          )}

          {/* Voting options */}
          {canVote ? (
            <>
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3 mb-6">
                {poll.options.map((opt) => (
                  <Label
                    key={opt.id}
                    htmlFor={`opt-${opt.id}`}
                    className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      selectedOption === String(opt.id) ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem value={String(opt.id)} id={`opt-${opt.id}`} />
                    <span className="text-sm font-medium">{opt.option_text}</span>
                  </Label>
                ))}
              </RadioGroup>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate("/polls")}>Cancel</Button>
                <Button onClick={handleVote} disabled={voteMutation.isPending}>
                  {voteMutation.isPending ? "Submitting..." : "Submit Vote"}
                </Button>
              </div>
            </>
          ) : hasVoted ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">You've already voted in this poll</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild><Link to={`/polls/${id}/results`}>View Results</Link></Button>
                <Button variant="outline" asChild><Link to={`/polls/${id}/voted`}>Vote Receipt</Link></Button>
              </div>
            </div>
          ) : poll.status === "closed" ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">This poll has been closed</p>
              <Button variant="outline" asChild><Link to={`/polls/${id}/results`}>View Results</Link></Button>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {poll.options.map((opt) => (
                <div key={opt.id} className="rounded-lg border p-4">
                  <span className="text-sm font-medium">{opt.option_text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <>
              <Separator className="my-6" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Admin Controls</p>
                <div className="flex flex-wrap gap-3">
                  {poll.status === "draft" && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/polls/${poll.id}/edit`}><Edit className="h-3.5 w-3.5 mr-1.5" />Edit Poll</Link>
                      </Button>
                      <Button size="sm" onClick={() => setShowPublish(true)}>Publish</Button>
                    </>
                  )}
                  {poll.status === "active" && (
                    <Button variant="outline" size="sm" onClick={() => setShowClose(true)}>
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />Close Poll Early
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {poll && <PublishPollModal open={showPublish} onOpenChange={setShowPublish} poll={poll} />}
      {poll && <ClosePollModal open={showClose} onOpenChange={setShowClose} poll={poll} />}
    </div>
  );
}
