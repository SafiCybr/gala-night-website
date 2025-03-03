
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-muted/10">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <AuthForm type="register" />
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
