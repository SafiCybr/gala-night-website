
import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PaymentDetailsProps {
  className?: string;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ className }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast({
      title: "Copied!",
      description: `${field} has been copied to clipboard.`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const paymentDetails = [
    { field: "Bank Name", value: "Opay" },
    { field: "Account Name", value: "Raji Murtadho" },
    { field: "Account Number", value: "8083863086" },
  ];

  return (
    <div className={cn("p-6 rounded-xl bg-muted/50 animate-fade-in", className)}>
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Please use the details below to make your payment. After payment, upload your receipt for confirmation.
      </p>

      <div className="space-y-4">
        {paymentDetails.map(({ field, value }) => (
          <div key={field} className="flex items-center justify-between bg-background p-3 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">{field}</p>
              <p className="font-medium">{value}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => copyToClipboard(value, field)}
            >
              {copied === field ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-secondary/50 rounded-lg text-sm">
        <p className="font-medium">Important Notes:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
          <li>Include your full name as reference</li>
          <li>Payment confirmation may take up to 24 hours</li>
          <li>For any issues, contact support@eventregistry.com</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentDetails;
