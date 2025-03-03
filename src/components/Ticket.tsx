
import React, { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Printer } from "lucide-react";
import QRCode from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Ticket = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!user?.ticket || user.payment?.status !== "confirmed") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted/40 p-6 rounded-xl mb-4">
          <QrCode className="h-12 w-12 text-muted-foreground mx-auto" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Ticket Available</h3>
        <p className="text-muted-foreground">
          {!user.payment?.status
            ? "Please complete your payment first."
            : user.payment.status === "pending"
            ? "Your payment is pending confirmation."
            : user.payment.status === "rejected"
            ? "Your payment was rejected. Please contact support."
            : "Waiting for seat assignment."}
        </p>
      </div>
    );
  }

  const handlePrint = () => {
    const printContents = ticketRef.current?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = `
        <html>
          <head>
            <title>Event Ticket</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; }
              .ticket-container { max-width: 800px; margin: 0 auto; }
              .ticket { border: 2px dashed #ccc; padding: 24px; border-radius: 12px; }
              .header { text-align: center; margin-bottom: 24px; }
              .details { display: flex; justify-content: space-between; }
              .qr-code { text-align: center; margin-top: 24px; }
            </style>
          </head>
          <body>
            <div class="ticket-container">
              ${printContents}
            </div>
          </body>
        </html>
      `;
      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  const handleDownload = () => {
    const canvas = document.getElementById("ticket-qrcode") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `event-ticket-${user.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "QR Code Downloaded",
        description: "Your ticket QR code has been downloaded successfully.",
      });
    }
  };

  // Ticket data to encode in QR code
  const ticketData = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    table: user.ticket.table_number,
    seat: user.ticket.seat_number,
    type: user.ticket.table_type,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Your Ticket</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download QR
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Ticket
          </Button>
        </div>
      </div>

      <div ref={ticketRef} className={cn(
        "border-2 border-dashed border-border rounded-xl p-6",
        "animate-fade-in"
      )}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1">EventRegistry</h2>
          <p className="text-muted-foreground">Annual Tech Conference 2023</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Attendee</h4>
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-sm">{user.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Table Type</h4>
                <p className="font-semibold">{user.ticket.table_type}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Table</h4>
                <p className="font-semibold">{user.ticket.table_number}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Seat Number</h4>
              <p className="font-semibold">{user.ticket.seat_number}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Event Date</h4>
              <p className="font-semibold">June 15, 2023 - 9:00 AM</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Venue</h4>
              <p className="font-semibold">Tech Conference Center</p>
              <p className="text-sm">123 Innovation Blvd, San Francisco, CA</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <QRCode
                id="ticket-qrcode"
                value={ticketData}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan this code at the event entrance
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-6 pt-6 text-center text-sm text-muted-foreground">
          <p>This ticket is non-transferable and must be presented upon entry.</p>
          <p className="mt-1">Ticket ID: {user.id}</p>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
