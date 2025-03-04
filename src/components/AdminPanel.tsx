import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle,
  CheckCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/lib/supabase";
import QrScanner from "./QrScanner";

type UserWithDetails = User & {
  payment?: {
    id: string;
    user_id: string;
    status: 'pending' | 'confirmed' | 'rejected';
    receipt_url?: string;
  };
  ticket?: {
    id: string;
    user_id: string;
    table_type: 'Standard' | 'Premium' | 'VIP';
    table_number: string;
    seat_number: string;
  };
};

const AdminPanel = () => {
  const { getUsers, updatePaymentStatus, assignSeat } = useAuth();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [tableType, setTableType] = useState<"Standard" | "Premium" | "VIP">("Standard");
  const [tableNumber, setTableNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [getUsers]);

  const handlePaymentStatus = async (userId: string, status: "confirmed" | "rejected") => {
    try {
      await updatePaymentStatus(userId, status);
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            payment: {
              ...user.payment!,
              status
            }
          };
        }
        return user;
      }));
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleAssignSeat = async (userId: string) => {
    if (!tableNumber || !seatNumber) return;
    
    try {
      await assignSeat(userId, tableType, tableNumber, seatNumber);
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            ticket: {
              id: user.ticket?.id || "",
              user_id: userId,
              table_type: tableType,
              table_number: tableNumber,
              seat_number: seatNumber
            }
          };
        }
        return user;
      }));
      
      setSelectedUser(null);
      setTableType("Standard");
      setTableNumber("");
      setSeatNumber("");
    } catch (error) {
      console.error("Error assigning seat:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === "all" || 
      (user.payment?.status === filter);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Admin Panel</h2>
        <p className="text-muted-foreground">
          Manage user registrations, payments, and seat assignments
        </p>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="seating">Seating</TabsTrigger>
          <TabsTrigger value="scanner">Ticket Scanner</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 items-center w-full md:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 flex justify-center items-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.payment ? (
                            <Badge 
                              variant={
                                user.payment.status === "confirmed" 
                                  ? "default" 
                                  : user.payment.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {user.payment.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No payment</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.payment?.receipt_url ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => window.open(user.payment.receipt_url, "_blank")}
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not uploaded</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.payment?.status === "pending" && user.payment.receipt_url && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handlePaymentStatus(user.id, "confirmed")}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handlePaymentStatus(user.id, "rejected")}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {user.payment?.status === "confirmed" && (
                            <span className="text-green-600 flex items-center justify-end">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmed
                            </span>
                          )}
                          {user.payment?.status === "rejected" && (
                            <span className="text-red-600 flex items-center justify-end">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Rejected
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="seating" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Users with Confirmed Payments</h3>
              
              {isLoading ? (
                <div className="py-8 flex justify-center items-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Seat Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers
                        .filter(user => user.payment?.status === "confirmed")
                        .length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            No users with confirmed payments
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers
                          .filter(user => user.payment?.status === "confirmed")
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.ticket ? (
                                  <div>
                                    <Badge className="mb-1">
                                      {user.ticket.table_type}
                                    </Badge>
                                    <p className="text-sm">
                                      Table {user.ticket.table_number}, 
                                      Seat {user.ticket.seat_number}
                                    </p>
                                  </div>
                                ) : (
                                  <Badge variant="outline">Not assigned</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant={user.ticket ? "outline" : "default"}
                                  onClick={() => setSelectedUser(user)}
                                >
                                  {user.ticket ? "Reassign" : "Assign Seat"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Assign Seat</h3>
              
              {!selectedUser ? (
                <div className="rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">
                    Select a user from the list to assign a seat
                  </p>
                </div>
              ) : (
                <div className="rounded-md border p-6 space-y-4">
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Table Type</label>
                      <Select 
                        value={tableType} 
                        onValueChange={(value) => setTableType(value as "Standard" | "Premium" | "VIP")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select table type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Table Number</label>
                        <Input
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="e.g. A1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Seat Number</label>
                        <Input
                          value={seatNumber}
                          onChange={(e) => setSeatNumber(e.target.value)}
                          placeholder="e.g. 01"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedUser(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleAssignSeat(selectedUser.id)}
                        disabled={!tableNumber || !seatNumber}
                      >
                        {selectedUser.ticket ? "Update Seat" : "Assign Seat"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scanner" className="space-y-4">
          <QrScanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
