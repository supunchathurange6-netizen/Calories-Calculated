'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Camera, Loader2, QrCode } from 'lucide-react';
import jsQR from 'jsqr';
import { AppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';


export default function ScanPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { profile, isInitialized } = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !profile) {
      router.push('/profile');
    }
  }, [isInitialized, profile, router]);

  const startScan = async () => {
    setIsScanning(true);
    setQrData(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };
  
  useEffect(() => {
    let animationFrameId: number;

    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;

        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            setQrData(code.data);
            stopScan();
            toast({
                title: "QR Code Scanned!",
                description: `Data: ${code.data}`
            })
          }
        }
      }
      if(isScanning){
        animationFrameId = requestAnimationFrame(scan);
      }
    };

    if (isScanning && hasCameraPermission) {
      scan();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      stopScan();
    };
  }, [isScanning, hasCameraPermission, toast]);

  if (!isInitialized) {
    return <div className="p-4">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h2 className="text-2xl font-headline mb-4">Create a Profile to Use This Feature</h2>
        <p className="mb-6 text-muted-foreground">You need to set up your profile before you can scan QR codes.</p>
        <Button asChild>
          <Link href="/profile">Create Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><QrCode /> QR Code Scanner</CardTitle>
        <CardDescription>Scan a food product's QR code to add it to your daily log.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden flex items-center justify-center">
          <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': !isScanning })} autoPlay playsInline muted />
          {!isScanning && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Camera className="h-16 w-16" />
                <p>Camera is off</p>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to use this feature.
              </AlertDescription>
            </Alert>
        )}

        {!isScanning ? (
          <Button onClick={startScan} className="w-full" size="lg">
            <Camera className="mr-2" /> Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScan} className="w-full" size="lg" variant="destructive">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Stop Scanning
          </Button>
        )}

        {qrData && (
            <Alert>
                <AlertTitle>Scan Successful!</AlertTitle>
                <AlertDescription className="break-words">
                    <p className="font-semibold">Scanned Data:</p>
                    <p className="text-xs font-mono p-2 bg-muted rounded-md mt-1">{qrData}</p>
                    <p className="mt-2 text-xs">This feature is under development. Soon, you'll be able to automatically add food details.</p>
                </AlertDescription>
            </Alert>
        )}

      </CardContent>
    </Card>
  );
}
