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
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: Poll;
}

export default function PublishPollModal({ open, onOpenChange, poll }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => pollsApi.publish(String(poll.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", String(poll.id)] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({ title: "Poll published!", description: "The poll is now live and open for voting.", variant: "success" });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to publish", description: err.message, variant: "destructive" });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Publish Poll</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Once published, <strong>"{poll.title}"</strong> will be live and available for voting. You won't be able to edit the poll after publishing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Publishing..." : "Confirm & Publish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
