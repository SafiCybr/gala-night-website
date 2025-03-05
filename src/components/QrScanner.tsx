import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TicketData = {
  userId: string;
  name: string;
  matricNumber?: string;
  tableType: string;
  tableNumber: string;
  seatNumber: string;
};

const QrScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<TicketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanner = async () => {
    setResult(null);
    setError(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCamera(true);
        scanQRCode();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setScanning(false);
      setHasCamera(false);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const jsQR = (await import('jsqr')).default;
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      
      if (code) {
        try {
          const decodedData = JSON.parse(code.data) as TicketData;
          
          if (decodedData.userId && decodedData.name && decodedData.tableType) {
            setResult(decodedData);
            stopScanner();
            toast({
              title: 'Ticket Verified',
              description: `Valid ticket for ${decodedData.name}`,
            });
            return;
          }
        } catch (e) {
          console.log('Invalid QR code format, continuing scan');
        }
      }
      
      requestAnimationFrame(scanQRCode);
    } catch (err) {
      console.error('QR scanning error:', err);
      setError('Error processing QR code');
      stopScanner();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>
          Scan attendee ticket QR codes for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {!hasCamera && (
          <div className="w-full p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Camera not available. Please check permissions.</span>
          </div>
        )}
        
        {scanning ? (
          <div className="relative w-full aspect-square bg-black rounded-md overflow-hidden">
            <video 
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
            />
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full opacity-0"
            />
            <div className="absolute inset-0 border-2 border-white/30 m-12 rounded-lg pointer-events-none"></div>
          </div>
        ) : result ? (
          <div className="w-full space-y-4">
            <div className="w-full p-4 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Ticket verified successfully!</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full text-sm">
              <div className="space-y-1">
                <p className="font-medium text-gray-500">Name</p>
                <p>{result.name}</p>
              </div>
              {result.matricNumber && (
                <div className="space-y-1">
                  <p className="font-medium text-gray-500">Matric Number</p>
                  <p>{result.matricNumber}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="font-medium text-gray-500">Table Type</p>
                <p>{result.tableType}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-500">Table Number</p>
                <p>{result.tableNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-500">Seat Number</p>
                <p>{result.seatNumber}</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="w-full p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="w-full aspect-square bg-muted rounded-md flex flex-col items-center justify-center p-8 text-center">
            <Camera className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Start scanner to verify tickets
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {scanning ? (
          <Button 
            variant="outline" 
            onClick={stopScanner}
            className="w-full flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel Scanning
          </Button>
        ) : result ? (
          <Button 
            onClick={() => {
              setResult(null);
              setError(null);
            }}
            className="w-full"
          >
            Scan Another Ticket
          </Button>
        ) : (
          <Button 
            onClick={startScanner}
            className="w-full flex items-center gap-2"
            disabled={!hasCamera}
          >
            <Camera className="h-4 w-4" />
            Start Scanner
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QrScanner;
