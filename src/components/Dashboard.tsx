
import React from "react";
import { useAuth } from "@/context/AuthContext";
import PaymentDetails from "./PaymentDetails";
import UploadReceipt from "./UploadReceipt";
import Ticket from "./Ticket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome, {user.name}
        </h2>
        <p className="text-muted-foreground">
          Manage your event registration and ticket details
        </p>
      </div>

      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="ticket" disabled={user.payment?.status !== "confirmed"}>
            Ticket
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="payment" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <PaymentDetails />
            <UploadReceipt />
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Payment Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium",
                    user.payment?.status === "pending" || user.payment?.status === "confirmed"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    1
                  </div>
                  <div>
                    <div className="font-medium">Payment Submitted</div>
                    <div className="text-sm text-muted-foreground">
                      {user.payment?.receipt_url ? "Receipt uploaded" : "Upload your payment receipt"}
                    </div>
                  </div>
                </div>
                <div>
                  {user.payment?.receipt_url ? (
                    <div className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      Completed
                    </div>
                  ) : (
                    <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Pending
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium",
                    user.payment?.status === "confirmed"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    2
                  </div>
                  <div>
                    <div className="font-medium">Payment Confirmation</div>
                    <div className="text-sm text-muted-foreground">
                      {user.payment?.status === "confirmed" 
                        ? "Your payment has been confirmed" 
                        : "Awaiting admin confirmation"}
                    </div>
                  </div>
                </div>
                <div>
                  {user.payment?.status === "confirmed" ? (
                    <div className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      Confirmed
                    </div>
                  ) : user.payment?.status === "rejected" ? (
                    <div className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500">
                      Rejected
                    </div>
                  ) : (
                    <div className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                      Pending
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium",
                    user.ticket
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    3
                  </div>
                  <div>
                    <div className="font-medium">Seat Assignment</div>
                    <div className="text-sm text-muted-foreground">
                      {user.ticket
                        ? `${user.ticket.table_type} - Table ${user.ticket.table_number}, Seat ${user.ticket.seat_number}`
                        : "Waiting for seat assignment"}
                    </div>
                  </div>
                </div>
                <div>
                  {user.ticket ? (
                    <div className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      Assigned
                    </div>
                  ) : (
                    <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Pending
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ticket">
          <Ticket />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
