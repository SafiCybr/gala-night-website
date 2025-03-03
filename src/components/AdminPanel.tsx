
import React, { useState } from "react";
import { Check, X, TicketIcon, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  className?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ className }) => {
  const { getUsers, updatePaymentStatus, assignSeat, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [scanResult, setScanResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [tableType, setTableType] = useState<"Standard" | "Premium" | "VIP">("Standard");
  const [tableNumber, setTableNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const users = getUsers().filter(user => 
    user.role === "user" && 
    (searchTerm === "" || 
     user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingPayments = users.filter(user => 
    user.payment?.status === "pending" && user.payment?.receiptUrl
  );

  const handleConfirmPayment = async (userId: string) => {
    try {
      await updatePaymentStatus(userId, "confirmed");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectPayment = async (userId: string) => {
    try {
      await updatePaymentStatus(userId, "rejected");
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignSeat = async () => {
    if (!selectedUserId || !tableNumber || !seatNumber) {
      toast({
        title: "Missing information",
        description: "Please fill in all seat assignment fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await assignSeat(selectedUserId, tableType, tableNumber, seatNumber);
      setTableNumber("");
      setSeatNumber("");
      setSelectedUserId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleScanTicket = () => {
    // In a real app, this would use a QR code scanner
    // For this demo, we'll just check if the ticketId exists
    const ticketParts = ticketId.split("-");
    if (ticketParts.length >= 2) {
      const userId = ticketParts[0];
      const user = getUsers().find(u => u.id === userId);
      
      if (user && user.ticket) {
        setScanResult({
          valid: true,
          message: `Valid ticket for ${user.name}. ${user.ticket.tableType} - Table ${user.ticket.tableNumber}, Seat ${user.ticket.seatNumber}`
        });
      } else {
        setScanResult({
          valid: false,
          message: "Invalid ticket. No matching record found."
        });
      }
    } else {
      setScanResult({
        valid: false,
        message: "Invalid ticket format. Please try again."
      });
    }
    
    setTimeout(() => {
      setScanResult(null);
      setTicketId("");
    }, 5000);
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight">Admin Panel</h2>
        <p className="text-muted-foreground">
          Manage event registrations, payments, and seating
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="payments">
            Payments
            {pendingPayments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                {pendingPayments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="seating">Seating</TabsTrigger>
          <TabsTrigger value="scanner">Ticket Scanner</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-6">
          {pendingPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No pending payment receipts to review.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingPayments.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border border-border rounded-lg bg-card animate-fade-in"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => {
                          window.open(user.payment?.receiptUrl, "_blank");
                        }}
                      >
                        View Receipt
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectPayment(user.id)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleConfirmPayment(user.id)}
                        disabled={isLoading}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="seating" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Assign Seats</h3>
              
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select User</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedUserId || ""}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user</option>
                    {users
                      .filter(user => user.payment?.status === "confirmed")
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Table Type</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={tableType}
                    onChange={(e) => setTableType(e.target.value as any)}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Table Number</label>
                    <Input
                      placeholder="e.g. A1"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seat Number</label>
                    <Input
                      placeholder="e.g. 05"
                      value={seatNumber}
                      onChange={(e) => setSeatNumber(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleAssignSeat}
                  disabled={!selectedUserId || !tableNumber || !seatNumber || isLoading}
                >
                  {isLoading ? "Assigning..." : "Assign Seat"}
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Assigned Seats</h3>
              {users.filter(user => user.ticket).length === 0 ? (
                <div className="text-center py-8 border border-border rounded-lg">
                  <TicketIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No seats assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {users
                    .filter(user => user.ticket)
                    .map(user => (
                      <div
                        key={user.id}
                        className="p-3 border border-border rounded-lg bg-card"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{user.ticket?.tableType}</div>
                            <div className="text-xs text-muted-foreground">
                              Table {user.ticket?.tableNumber}, Seat {user.ticket?.seatNumber}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="scanner">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <TicketIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Ticket Scanner</h3>
              <p className="text-muted-foreground mb-6">
                Scan attendee QR codes or enter the ticket ID manually
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ticket ID (e.g. 1-A5)"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                />
                <Button onClick={handleScanTicket} disabled={!ticketId}>
                  Verify
                </Button>
              </div>
              
              {scanResult && (
                <div className={cn(
                  "mt-6 p-4 rounded-lg animate-fade-in",
                  scanResult.valid 
                    ? "bg-green-500/10 text-green-700" 
                    : "bg-red-500/10 text-red-700"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {scanResult.valid ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                      {scanResult.valid ? "Valid Ticket" : "Invalid Ticket"}
                    </span>
                  </div>
                  <p>{scanResult.message}</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                In a real app, this would use your device's camera to scan the QR code.
                For this demo, please enter the ticket ID manually in the format: [USER_ID]-[TABLE_NO]
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
