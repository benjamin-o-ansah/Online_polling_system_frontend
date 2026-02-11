import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import { format } from "date-fns";

const roleLabelMap: Record<string, string> = {
  SYSTEM_ADMIN: "System Admin",
  POLL_ADMIN: "Poll Admin",
  VOTER: "Voter",
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  const initials = user.username?.slice(0, 2).toUpperCase() || user.email.slice(0, 2).toUpperCase();
  const roleLabel = roleLabelMap[user.role] || user.role;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Avatar & name — horizontal layout matching mockup */}
          <div className="flex items-center gap-5 mb-2">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.username || user.email.split("@")[0]}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-primary text-primary-foreground">{roleLabel}</Badge>
                <Badge
                  variant="outline"
                  className={user.is_active ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-300" : "border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-300"}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Details */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
              <p className="text-sm font-medium text-foreground pl-2">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">User ID</p>
              <p className="text-sm font-medium text-foreground font-mono pl-2">{user.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Member Since</p>
              <p className="text-sm font-medium text-foreground pl-2">
                {user.created_at ? format(new Date(user.created_at), "MMMM d, yyyy") : "—"}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleLogout} className="text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}