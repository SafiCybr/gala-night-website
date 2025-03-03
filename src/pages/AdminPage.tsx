
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminPanel from "@/components/AdminPanel";
import { useAuth } from "@/context/AuthContext";

const AdminPage = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and either no user or not admin, redirect
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
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
