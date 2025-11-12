import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

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

interface ComplaintCardProps {
  complaint: Complaint;
}

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-complaint-accent text-complaint-accent-foreground' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500 text-white' },
  resolved: { label: 'Resolved', className: 'bg-green-500 text-white' },
};

const ComplaintCard = ({ complaint }: ComplaintCardProps) => {
  const config = statusConfig[complaint.status];

  return (
    <Card className="bg-complaint-bg border-complaint-accent/20 hover:shadow-lg transition-shadow">
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
          <div className="bg-background/50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-admin-accent mb-1">Admin Response:</p>
            <p className="text-sm">{complaint.admin_response}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplaintCard;
