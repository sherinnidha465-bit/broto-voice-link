import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminComplaintCard from "@/components/AdminComplaintCard";

interface Complaint {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: 'pending' | 'in_progress' | 'resolved';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  student_id: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
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

  const filterComplaints = (status: string) => {
    if (status === 'all') return complaints;
    return complaints.filter(c => c.status === status);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-admin-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Review and manage all complaints</p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{complaints.length}</p>
          </div>
          <div className="bg-complaint-bg p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-complaint-accent">
              {complaints.filter(c => c.status === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {complaints.filter(c => c.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {complaints.filter(c => c.status === 'resolved').length}
            </p>
          </div>
        </div>

        {/* Complaints List with Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({complaints.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({complaints.filter(c => c.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({complaints.filter(c => c.status === 'in_progress').length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({complaints.filter(c => c.status === 'resolved').length})
            </TabsTrigger>
          </TabsList>

          {loadingComplaints ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-admin-accent" />
            </div>
          ) : (
            <>
              <TabsContent value="all">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filterComplaints('all').map((complaint) => (
                    <AdminComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onUpdate={loadComplaints}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="pending">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filterComplaints('pending').map((complaint) => (
                    <AdminComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onUpdate={loadComplaints}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="in_progress">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filterComplaints('in_progress').map((complaint) => (
                    <AdminComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onUpdate={loadComplaints}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="resolved">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filterComplaints('resolved').map((complaint) => (
                    <AdminComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onUpdate={loadComplaints}
                    />
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
