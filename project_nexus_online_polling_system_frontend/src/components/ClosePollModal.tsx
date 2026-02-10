import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pollsApi, Poll } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { XCircle, Info } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: Poll;
}

export default function ClosePollModal({ open, onOpenChange, poll }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => pollsApi.close(String(poll.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", String(poll.id)] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({ title: "Poll closed", description: "Voting has ended and results are now final.", variant: "info" });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to close poll", description: err.message, variant: "destructive" });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Close Poll</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to close <strong>"{poll.title}"</strong>? This action is irreversible.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Once closed, no more votes will be accepted and results will be finalized.</span>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Closing..." : "Confirm Close"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
