
import React, { useRef } from "react";
import { Printer, Calendar, Clock, MapPin, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface TicketProps {
  className?: string;
}

const Ticket: React.FC<TicketProps> = ({ className }) => {
  const { user } = useAuth();
  const ticketRef = useRef<HTMLDivElement>(null);

  const generateQRCode = () => {
    // This would normally generate a real QR code with the ticket details
    // For this demo, we'll just use a placeholder image
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user?.id}-${user?.ticket?.tableType}-${user?.ticket?.tableNumber}-${user?.ticket?.seatNumber}`;
  };

  const printTicket = () => {
    if (ticketRef.current) {
      const printContent = ticketRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = `
        <div style="padding: 20px;">
          ${printContent}
        </div>
      `;
      
      window.print();
      document.body.innerHTML = originalContent;
      
      // Re-initialize any event listeners that were removed when the DOM was replaced
      // For most React apps, this means re-rendering the app
      window.location.reload();
    }
  };

  if (!user?.ticket) {
    return (
      <div className={cn("p-6 rounded-xl bg-muted/50 text-center", className)}>
        <h3 className="text-lg font-semibold mb-2">No Ticket Available</h3>
        <p className="text-sm text-muted-foreground">
          Your payment needs to be confirmed and a seat assigned before you can access your ticket.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("animate-fade-in", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Ticket</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={printTicket}
          className="gap-1"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <div
        ref={ticketRef}
        className="relative overflow-hidden border border-border rounded-xl"
      >
        {/* Ticket Header */}
        <div className="bg-primary text-primary-foreground p-4">
          <div className="text-xs uppercase tracking-wide mb-1">Gala Dinner Event</div>
          <h4 className="text-xl font-bold">Annual Evening Gala 2023</h4>
        </div>

        {/* Ticket Body */}
        <div className="grid md:grid-cols-3 gap-4 p-4 bg-card">
          {/* Attendee Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground">Attendee</div>
              <div className="font-semibold">{user.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Table Type</div>
                <div className="font-semibold">{user.ticket.tableType}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Table Number</div>
                <div className="font-semibold">{user.ticket.tableNumber}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Seat Number</div>
                <div className="font-semibold">{user.ticket.seatNumber}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Ticket ID</div>
                <div className="font-semibold">{user.id}-{user.ticket.tableNumber}</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>December 15, 2023</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>7:00 PM - 11:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Grand Hotel, 123 Event St, New York</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-2 rounded-md">
              <img
                src={generateQRCode()}
                alt="Ticket QR Code"
                className="w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            </div>
            <div className="text-xs text-center mt-2 flex items-center gap-1 text-muted-foreground">
              <QrCode className="h-3 w-3" />
              <span>Scan at entry</span>
            </div>
          </div>
        </div>

        {/* Ticket Footer */}
        <div className="bg-muted p-3 text-xs text-center text-muted-foreground">
          Please bring this ticket and a valid ID to the event for entry. This ticket is non-transferable.
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full"></div>
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-primary/10 rounded-full"></div>
      </div>
    </div>
  );
};

export default Ticket;
