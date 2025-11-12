import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface AdminComplaintCardProps {
  complaint: Complaint;
  onUpdate: () => void;
}

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-complaint-accent text-complaint-accent-foreground' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500 text-white' },
  resolved: { label: 'Resolved', className: 'bg-green-500 text-white' },
};

const AdminComplaintCard = ({ complaint, onUpdate }: AdminComplaintCardProps) => {
  const config = statusConfig[complaint.status];
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(complaint.status);
  const [response, setResponse] = useState(complaint.admin_response || '');

  const handleUpdate = async () => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('complaints')
      .update({
        status,
        admin_response: response,
      })
      .eq('id', complaint.id);

    if (error) {
      toast.error('Failed to update complaint');
    } else {
      toast.success('Complaint updated successfully');
      setIsOpen(false);
      onUpdate();
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Card className="bg-card hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg">{complaint.title}</CardTitle>
            <Badge className={config.className}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {complaint.description}
          </p>

          {complaint.image_url && (
            <img
              src={complaint.image_url}
              alt="Complaint"
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          {complaint.admin_response && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs font-semibold mb-1">Your Response:</p>
              <p className="text-sm">{complaint.admin_response}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-admin-accent hover:bg-admin-accent/90 text-admin-accent-foreground"
                >
                  Manage
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Manage Complaint</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">{complaint.title}</h3>
                    <p className="text-sm text-muted-foreground">{complaint.description}</p>
                  </div>

                  {complaint.image_url && (
                    <div>
                      <Label>Attached Image</Label>
                      <img
                        src={complaint.image_url}
                        alt="Complaint"
                        className="w-full max-h-96 object-contain rounded-lg mt-2"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Response</Label>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Add your response to the student..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleUpdate}
                    className="w-full bg-admin-accent hover:bg-admin-accent/90 text-admin-accent-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Complaint
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminComplaintCard;
