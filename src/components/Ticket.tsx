import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { QRCodeCanvas } from 'qrcode.react'; // Changed from QRCode to QRCodeCanvas

const Ticket = () => {
  const { user } = useAuth();

  // Dummy ticket data
  const ticketData = {
    tableType: 'VIP',
    tableNumber: '1',
    seatNumber: 'A1',
  };

  const qrCodeValue = `User ID: ${user?.id}, Table: ${ticketData.tableType} ${ticketData.tableNumber}, Seat: ${ticketData.seatNumber}`;

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Your Ticket</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col space-y-1.5">
          <h4 className="text-sm font-semibold">User ID</h4>
          <p className="text-muted-foreground">{user?.id}</p>
        </div>
        <div className="flex flex-col space-y-1.5">
          <h4 className="text-sm font-semibold">Table Type</h4>
          <p className="text-muted-foreground">{ticketData.tableType}</p>
        </div>
        <div className="flex flex-col space-y-1.5">
          <h4 className="text-sm font-semibold">Table Number</h4>
          <p className="text-muted-foreground">{ticketData.tableNumber}</p>
        </div>
        <div className="flex flex-col space-y-1.5">
          <h4 className="text-sm font-semibold">Seat Number</h4>
          <p className="text-muted-foreground">{ticketData.seatNumber}</p>
        </div>
        <Separator />
        <div className="flex justify-center">
          <QRCodeCanvas value={qrCodeValue} size={256} level="H" />
        </div>
        <Button>Download Ticket</Button>
      </CardContent>
    </Card>
  );
};

export default Ticket;
