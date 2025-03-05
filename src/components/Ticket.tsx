
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Ticket as TicketIcon } from 'lucide-react';

const Ticket = () => {
  const { user } = useAuth();

  if (!user || !user.ticket) {
    return (
      <div className="p-8 border rounded-md text-center">
        <p className="text-muted-foreground">No ticket information available</p>
      </div>
    );
  }

  const qrCodeValue = JSON.stringify({
    userId: user.id,
    name: user.name,
    matricNumber: user.matric_number || "", // Safe access with fallback
    tableType: user.ticket.table_type,
    tableNumber: user.ticket.table_number,
    seatNumber: user.ticket.seat_number
  });

  const downloadTicket = () => {
    const canvas = document.getElementById('ticket-qr-code') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `ticket-${user.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden shadow-md">
      <CardHeader className="text-center bg-primary text-white py-5 border-b">
        <div className="flex justify-center items-center gap-2">
          <TicketIcon size={24} />
          <CardTitle className="text-2xl font-bold">Event Ticket</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-5">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Attendee</h4>
          <p className="font-semibold text-lg">{user.name}</p>
        </div>
        
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Matric Number</h4>
          <p className="font-medium">{user.matric_number || "Not provided"}</p>
        </div>
        
        <Separator />
        
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Experience Type</h4>
          <p className="font-semibold text-primary">{user.ticket.table_type}</p>
          <p className="text-xs text-muted-foreground">
            {user.ticket.table_type === 'Standard' && 'Basic event access (₦3,000)'}
            {user.ticket.table_type === 'Premium' && 'Enhanced experience with premium benefits (₦5,000)'}
            {user.ticket.table_type === 'VIP' && 'The ultimate exclusive experience (₦10,000)'}
          </p>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground">Table Number</h4>
            <p className="font-semibold text-lg">{user.ticket.table_number}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground">Seat Number</h4>
            <p className="font-semibold text-lg">{user.ticket.seat_number}</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-center pt-2">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <QRCodeCanvas 
              id="ticket-qr-code"
              value={qrCodeValue} 
              size={200} 
              level="H"
              includeMargin={true}
              className="rounded"
            />
          </div>
        </div>
        
        <Button 
          variant="default"
          className="w-full flex items-center justify-center gap-2 py-6"
          onClick={downloadTicket}
        >
          <Download size={16} />
          Download Ticket
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Please present this QR code at the entrance for verification.
          <br />Valid ID may be required for verification.
        </p>
      </CardContent>
    </Card>
  );
};

export default Ticket;
