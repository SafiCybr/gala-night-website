
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center bg-primary/5 border-b">
        <CardTitle className="text-xl">Event Ticket</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Attendee</h4>
          <p className="font-medium text-lg">{user.name}</p>
        </div>
        
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Matric Number</h4>
          <p className="font-medium">{user.matric_number || "Not provided"}</p>
        </div>
        
        <Separator />
        
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Experience Type</h4>
          <p className="font-medium text-primary">{user.ticket.table_type}</p>
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
            <p className="font-medium">{user.ticket.table_number}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground">Seat Number</h4>
            <p className="font-medium">{user.ticket.seat_number}</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-center pt-2">
          <QRCodeCanvas 
            id="ticket-qr-code"
            value={qrCodeValue} 
            size={200} 
            level="H"
            includeMargin={true}
            className="shadow-sm border-2 rounded-md p-2"
          />
        </div>
        
        <Button 
          className="w-full flex items-center justify-center gap-2"
          onClick={downloadTicket}
        >
          <Download size={16} />
          Download Ticket
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Please present this QR code at the entrance for verification.
        </p>
      </CardContent>
    </Card>
  );
};

export default Ticket;
