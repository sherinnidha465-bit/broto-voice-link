import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const AdminAuth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = signInSchema.parse({
        email: formData.get('email'),
        password: formData.get('password'),
      });

      setIsSubmitting(true);
      const { error } = await signIn(data.email, data.password);

      if (error) {
        toast.error('Invalid credentials');
      } else {
        // Check if user has admin role after successful sign in
        setTimeout(() => {
          if (!isAdmin) {
            toast.error('Access denied: Admin privileges required');
          }
        }, 1000);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-admin-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-admin-accent" />
          </div>
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>
            Sign in with your admin credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button
              type="submit"
              className="w-full bg-admin-accent hover:bg-admin-accent/90 text-admin-accent-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In as Admin
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full text-admin-accent"
              onClick={() => navigate('/forgot-password?type=admin')}
            >
              Forgot Password?
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
