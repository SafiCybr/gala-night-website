
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, User, Payment, Ticket } from "@/lib/supabase";

// Updated to match our Supabase schema
type UserWithDetails = User & {
  payment?: Payment;
  ticket?: Ticket;
};

type AuthContextType = {
  user: UserWithDetails | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserWithDetails | null>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  uploadReceipt: (receiptUrl: string) => Promise<void>;
  getUsers: () => Promise<UserWithDetails[]>;
  updatePaymentStatus: (userId: string, status: "confirmed" | "rejected") => Promise<void>;
  assignSeat: (userId: string, tableType: "Standard" | "Premium" | "VIP", tableNumber: string, seatNumber: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUser(null);
        return;
      }
      
      // Get auth user
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        throw authError || new Error("User not found");
      }
      
      console.log("Auth user:", authUser.user);
      
      // Get user details using service role if possible, or direct query
      // This approach minimizes the risk of RLS recursion issues
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.user.id)
        .single();
        
      if (userError) {
        console.error("Error fetching user details:", userError);
        setUser(null);
        return;
      }
      
      console.log("User data from DB:", userData);
      
      // Get payment data
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle();
        
      // Get ticket data  
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle();
        
      console.log("Payment data:", paymentData);
      console.log("Ticket data:", ticketData);
      
      // Set user with details
      setUser({
        ...userData,
        payment: paymentData || undefined,
        ticket: ticketData || undefined
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already authenticated
  useEffect(() => {
    fetchUserData();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN') {
        fetchUserData();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string): Promise<UserWithDetails | null> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Get user details to return for redirection logic
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Failed to get session after login");
      }
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (userError) throw userError;
      
      console.log("User data after login:", userData);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Return user data including role for redirection
      return userData;
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
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create user record in 'users' table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name,
            email,
            role: 'user'
          });
          
        if (userError) throw userError;
        
        // Create initial payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: authData.user.id,
            status: 'pending'
          });
          
        if (paymentError) throw paymentError;
      }
      
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

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const uploadReceipt = async (receiptUrl: string) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("Not authenticated");
      
      // Update payment record in Supabase
      const { error } = await supabase
        .from('payments')
        .update({
          receipt_url: receiptUrl,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Refresh user data
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (paymentError) throw paymentError;
      
      // Update local state
      setUser({
        ...user,
        payment: paymentData
      });
      
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

  const getUsers = async () => {
    try {
      if (!user || user.role !== 'admin') {
        console.error("Unauthorized access attempt to getUsers by non-admin user:", user);
        throw new Error("Unauthorized access");
      }
      
      console.log("Admin fetching all users");
      
      // Get all users with their payment and ticket info
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
        
      if (usersError) throw usersError;
      
      console.log("All users:", users);
      
      const usersWithDetails: UserWithDetails[] = [];
      
      // Fetch payment and ticket details for each user
      for (const userData of users) {
        const { data: paymentData } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();
          
        const { data: ticketData } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();
          
        usersWithDetails.push({
          ...userData,
          payment: paymentData || undefined,
          ticket: ticketData || undefined
        });
      }
      
      console.log("Users with details:", usersWithDetails);
      return usersWithDetails;
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch users",
        variant: "destructive",
      });
      return [];
    }
  };

  const updatePaymentStatus = async (userId: string, status: "confirmed" | "rejected") => {
    setIsLoading(true);
    try {
      if (!user || user.role !== 'admin') {
        throw new Error("Unauthorized access");
      }
      
      // Update payment status in Supabase
      const { error } = await supabase
        .from('payments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // If current user is the one being updated, update current user state too
      if (user.id === userId) {
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (paymentError) throw paymentError;
        
        setUser({
          ...user,
          payment: paymentData
        });
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
      if (!user || user.role !== 'admin') {
        throw new Error("Unauthorized access");
      }
      
      // Check if this user already has a ticket
      const { data: existingTicket, error: checkError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      let error;
      
      if (existingTicket) {
        // Update existing ticket
        const { error: updateError } = await supabase
          .from('tickets')
          .update({
            table_type: tableType,
            table_number: tableNumber,
            seat_number: seatNumber
          })
          .eq('user_id', userId);
          
        error = updateError;
      } else {
        // Create new ticket
        const { error: insertError } = await supabase
          .from('tickets')
          .insert({
            user_id: userId,
            table_type: tableType,
            table_number: tableNumber,
            seat_number: seatNumber
          });
          
        error = insertError;
      }
      
      if (error) throw error;
      
      // If current user is the one being updated, update current user state too
      if (user.id === userId) {
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (ticketError) throw ticketError;
        
        setUser({
          ...user,
          ticket: ticketData
        });
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
        isAdmin: user?.role === 'admin',
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
