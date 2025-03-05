
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface AuthFormProps {
  type: "login" | "register";
  className?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, className }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const { login, register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const isLogin = type === "login";

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6 && !isLogin) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!isLogin && !name) {
      errors.name = "Full name is required";
    }

    if (!isLogin && !matricNumber) {
      errors.matricNumber = "Matric number is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        try {
          const userData = await login(email, password);
          console.log("Login successful, user data:", userData);
          // Direct admins to admin panel, regular users to dashboard
          if (userData && userData.role === 'admin') {
            console.log("Redirecting admin to admin panel");
            navigate("/admin");
          } else {
            console.log("Redirecting user to dashboard");
            navigate("/dashboard");
          }
        } catch (err) {
          console.error("Login failed:", err);
          throw err;
        }
      } else {
        await registerUser(name, email, password, matricNumber);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      
      let errorMessage = "An unexpected error occurred";
      
      if (err instanceof Error) {
        const errorText = err.message.toLowerCase();
        
        if (errorText.includes("invalid login credentials")) {
          errorMessage = "Invalid email or password";
        } else if (errorText.includes("email already")) {
          errorMessage = "This email is already registered";
        } else if (errorText.includes("weak password")) {
          errorMessage = "Password is too weak. Use at least 6 characters";
        } else if (errorText.includes("invalid email")) {
          errorMessage = "Please enter a valid email address";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div 
      className={cn(
        "w-full max-w-md mx-auto p-8 rounded-xl bg-white shadow-sm animate-scale-in",
        className
      )}
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Fill in your details to register for the event"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className={validationErrors.name ? "text-destructive" : ""}>Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className={cn("transition-all", validationErrors.name && "border-destructive")}
              />
              {validationErrors.name && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle size={12} />
                  {validationErrors.name}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matricNumber" className={validationErrors.matricNumber ? "text-destructive" : ""}>Matric Number</Label>
              <Input
                id="matricNumber"
                type="text"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                placeholder="ABC/123/456"
                className={cn("transition-all", validationErrors.matricNumber && "border-destructive")}
              />
              {validationErrors.matricNumber && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle size={12} />
                  {validationErrors.matricNumber}
                </p>
              )}
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className={validationErrors.email ? "text-destructive" : ""}>Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            autoComplete="email"
            className={cn("transition-all", validationErrors.email && "border-destructive")}
          />
          {validationErrors.email && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle size={12} />
              {validationErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className={validationErrors.password ? "text-destructive" : ""}>Password</Label>
            {isLogin && (
              <Link
                to="#"
                className="text-xs text-muted-foreground hover:text-primary link-hover"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className={cn("transition-all", validationErrors.password && "border-destructive")}
          />
          {validationErrors.password && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle size={12} />
              {validationErrors.password}
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-2">
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </span>
          ) : isLogin ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {isLogin ? (
          <>
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary link-hover">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary link-hover">
              Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
