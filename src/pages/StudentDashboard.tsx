import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintCard from "@/components/ComplaintCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Complaint {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: 'pending' | 'in_progress' | 'resolved';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || isAdmin)) {
      navigate('/student/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && !isAdmin) {
      loadComplaints();
    }
  }, [user, isAdmin]);

  const loadComplaints = async () => {
    setLoadingComplaints(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComplaints(data);
    }
    setLoadingComplaints(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-student-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-student-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-student-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your complaints</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* New Complaint Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6 bg-student-accent hover:bg-student-accent/90 text-student-accent-foreground gap-2">
              <Plus className="w-4 h-4" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <ComplaintForm
              onSuccess={() => {
                setDialogOpen(false);
                loadComplaints();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Complaints List */}
        {loadingComplaints ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-student-accent" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No complaints yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
