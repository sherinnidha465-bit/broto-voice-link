import { Button } from "@/components/ui/button";
import { MessageSquare, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-student-bg via-background to-admin-bg">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Brototype Voice
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground italic mb-4">
            "Every voice matters — when you speak, we listen."
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connecting Voices. Building Solutions.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Student Card */}
          <div className="bg-student-bg rounded-xl p-8 shadow-lg border border-student-accent/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-student-accent" />
              <h2 className="text-2xl font-bold text-foreground">Student Portal</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Raise complaints, track status, and get quick resolutions from staff.
            </p>
            <div className="space-y-3">
              <Link to="/student/auth">
                <Button className="w-full bg-student-accent hover:bg-student-accent/90 text-student-accent-foreground">
                  Student Login / Sign Up
                </Button>
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="bg-admin-bg rounded-xl p-8 shadow-lg border border-admin-accent/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-admin-accent" />
              <h2 className="text-2xl font-bold text-foreground">Admin Portal</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              View all complaints, update status, and provide timely responses.
            </p>
            <div className="space-y-3">
              <Link to="/admin/auth">
                <Button className="w-full bg-admin-accent hover:bg-admin-accent/90 text-admin-accent-foreground">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="max-w-3xl mx-auto bg-card rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-8 h-8 text-complaint-accent" />
            <h3 className="text-2xl font-bold">How It Works</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-2 text-student-accent">For Students</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Create an account securely</li>
                <li>✓ Submit complaints with details</li>
                <li>✓ Upload images as evidence</li>
                <li>✓ Track complaint status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 text-admin-accent">For Staff</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ View all complaints in one place</li>
                <li>✓ Review uploaded images</li>
                <li>✓ Update status efficiently</li>
                <li>✓ Provide responses to students</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
