import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  payment?: {
    status: "pending" | "confirmed" | "rejected";
    receiptUrl?: string;
  };
  ticket?: {
    tableType: "Standard" | "Premium" | "VIP";
    tableNumber: string;
    seatNumber: string;
  };
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  uploadReceipt: (receiptUrl: string) => Promise<void>;
  getUsers: () => User[];
  updatePaymentStatus: (userId: string, status: "confirmed" | "rejected") => Promise<void>;
  assignSeat: (userId: string, tableType: "Standard" | "Premium" | "VIP", tableNumber: string, seatNumber: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    payment: {
      status: "pending"
    }
  },
  {
    id: "3",
    name: "Premium User",
    email: "premium@example.com",
    role: "user",
    payment: {
      status: "confirmed",
      receiptUrl: "https://example.com/receipt.jpg"
    },
    ticket: {
      tableType: "Premium",
      tableNumber: "P12",
      seatNumber: "03"
    }
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundUser = users.find(u => u.email === email);
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // In a real app, you would verify the password here
      
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
      toast({
        title: "Login successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (users.some(u => u.email === email)) {
        throw new Error("Email already in use");
      }
      
      const newUser: User = {
        id: (users.length + 1).toString(),
        name,
        email,
        role: "user",
        payment: {
          status: "pending"
        }
      };
      
      setUsers([...users, newUser]);
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const uploadReceipt = async (receiptUrl: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!user) throw new Error("Not authenticated");
      
      // Ensure we're using the exact type for payment.status
      const updatedUser: User = {
        ...user,
        payment: {
          ...user.payment,
          status: "pending" as const,
          receiptUrl
        }
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update in users array
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      setUsers(updatedUsers);
      
      toast({
        title: "Receipt uploaded",
        description: "Your payment receipt has been submitted for review.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUsers = () => {
    return users;
  };

  const updatePaymentStatus = async (userId: string, status: "confirmed" | "rejected") => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            payment: {
              ...u.payment,
              status
            }
          };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      
      // If current user is the one being updated, update current user state too
      if (user && user.id === userId) {
        const updatedUser = updatedUsers.find(u => u.id === userId);
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
      
      toast({
        title: `Payment ${status}`,
        description: `Payment has been ${status}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const assignSeat = async (userId: string, tableType: "Standard" | "Premium" | "VIP", tableNumber: string, seatNumber: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            ticket: {
              tableType,
              tableNumber,
              seatNumber
            }
          };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      
      // If current user is the one being updated, update current user state too
      if (user && user.id === userId) {
        const updatedUser = updatedUsers.find(u => u.id === userId);
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
      
      toast({
        title: "Seat assigned",
        description: `Seat ${tableNumber}-${seatNumber} (${tableType}) has been assigned.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Assignment failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAdmin: user?.role === "admin",
        uploadReceipt,
        getUsers,
        updatePaymentStatus,
        assignSeat
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
