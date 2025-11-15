import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Loader2, User, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintCard from "@/components/ComplaintCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const { toast } = useToast();

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

  // Set up realtime subscription for complaint updates
  useEffect(() => {
    if (!user || isAdmin) return;

    const channel = supabase
      .channel('complaint-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints',
          filter: `student_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedComplaint = payload.new as Complaint;
          const oldComplaint = payload.old as Complaint;

          // Check if admin_response was added or status changed
          if (updatedComplaint.admin_response && !oldComplaint.admin_response) {
            toast({
              title: "Admin Response Received",
              description: `Your complaint "${updatedComplaint.title}" has received a response from an admin.`,
            });
          } else if (updatedComplaint.status !== oldComplaint.status) {
            toast({
              title: "Complaint Status Updated",
              description: `Your complaint "${updatedComplaint.title}" status changed to ${updatedComplaint.status}.`,
            });
          }

          // Update local state
          setComplaints((prev) =>
            prev.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, toast]);

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

  const statistics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;

    const chartData = [
      { status: 'Pending', count: pending, fill: 'hsl(var(--chart-1))' },
      { status: 'In Progress', count: inProgress, fill: 'hsl(var(--chart-2))' },
      { status: 'Resolved', count: resolved, fill: 'hsl(var(--chart-3))' },
    ];

    const pieData = [
      { name: 'Pending', value: pending, fill: 'hsl(var(--chart-1))' },
      { name: 'In Progress', value: inProgress, fill: 'hsl(var(--chart-2))' },
      { name: 'Resolved', value: resolved, fill: 'hsl(var(--chart-3))' },
    ];

    return { total, pending, inProgress, resolved, chartData, pieData };
  }, [complaints]);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/student/profile')}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {complaints.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Complaint Statistics</h2>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Complaints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{statistics.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-1">{statistics.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-2">{statistics.inProgress}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-3">{statistics.resolved}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Complaints by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statistics.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statistics.pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {statistics.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

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

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search complaints by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('in_progress')}
              size="sm"
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('resolved')}
              size="sm"
            >
              Resolved
            </Button>
          </div>
        </div>

        {/* Complaints List */}
        {loadingComplaints ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-student-accent" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No complaints yet. Create your first one!</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No complaints match your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
