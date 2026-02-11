import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pollsApi, CreatePollData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, X, Loader2 } from "lucide-react";

export default function CreatePoll() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loaded, setLoaded] = useState(false);

  useQuery({
    queryKey: ["poll", id],
    queryFn: () => pollsApi.get(id!),
    enabled: isEdit && !loaded,
    meta: { onSuccess: true },
  });

  // Load existing poll data for editing
  const { data: existingPoll } = useQuery({
    queryKey: ["poll", id],
    queryFn: async () => {
      const poll = await pollsApi.get(id!);
      if (!loaded) {
        setTitle(poll.title);
        setDescription(poll.description || "");
        setOptions(poll.options.map((o) => o.option_text));
        setLoaded(true);
      }
      return poll;
    },
    enabled: isEdit,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePollData) =>
      isEdit ? pollsApi.update(id!, data) : pollsApi.create(data),
    onSuccess: (poll) => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({
        title: isEdit ? "Poll updated" : "Poll created",
        description: isEdit
          ? "Your changes have been saved successfully."
          : "Your poll has been created as a draft. Publish it when you're ready!",
        variant: "success",
      });
      navigate(`/polls/${poll.id}`);
    },
    onError: (err: Error) => {
      toast({ title: isEdit ? "Failed to update poll" : "Failed to create poll", description: err.message, variant: "destructive" });
    },
  });

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };
  const updateOption = (i: number, val: string) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!trimmedTitle) {
      toast({ title: "Title is required", variant: "warning" });
      return;
    }
    if (trimmedOptions.length < 2) {
      toast({ title: "At least 2 options are required", variant: "warning" });
      return;
    }
    createMutation.mutate({ title: trimmedTitle, description: description.trim() || undefined, options: trimmedOptions });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/polls">Polls</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{isEdit ? "Edit Poll" : "Create Poll"}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Poll" : "Create New Poll"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title</Label>
              <Input id="title" placeholder="Enter poll title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description (optional)</Label>
              <Textarea id="desc" placeholder="Add a description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} />
            </div>

            <div className="space-y-3">
              <Label>Poll Options</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    maxLength={200}
                  />
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" />Add Option
              </Button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {createMutation.isPending ? "Saving..." : isEdit ? "Update Poll" : "Create Poll"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}