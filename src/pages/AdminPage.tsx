
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminPanel from "@/components/AdminPanel";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const AdminPage = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  useEffect(() => {
    // If not loading and either no user or not admin, redirect
    if (!isLoading) {
      setAdminCheckComplete(true);
      
      if (!user) {
        console.log("No user found, redirecting to login");
        toast({
          title: "Authentication required",
          description: "Please login to access this page",
          variant: "destructive",
        });
        navigate("/login");
      } else if (!isAdmin) {
        console.log("User is not an admin, redirecting to dashboard:", user);
        toast({
          title: "Access denied",
          description: "You need admin privileges to access this page",
          variant: "destructive",
        });
        navigate("/dashboard");
      } else {
        console.log("Admin access granted for user:", user);
      }
    }
  }, [user, isAdmin, isLoading, navigate, toast]);

  // Add more detailed logging to debug authentication issues
  useEffect(() => {
    if (user) {
      console.log("AdminPage - Current user details:", {
        id: user.id,
        email: user.email,
        role: user.role,
        isAdmin
      });
    } else {
      console.log("AdminPage - No user available");
    }
  }, [user, isAdmin]);

  if (isLoading || !adminCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null; // Will redirect via the useEffect

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <AdminPanel />
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
