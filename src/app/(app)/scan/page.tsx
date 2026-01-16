'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Camera, Loader2, QrCode, Info, SwitchCamera } from 'lucide-react';
import jsQR from 'jsqr';
import { AppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';


export default function ScanPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>();

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

  // Effect to handle camera stream activation and cleanup based on the selected device
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const enableCamera = async () => {
      if (!isScanning || !currentDeviceId) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: currentDeviceId } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error starting camera stream:', error);
        toast({
          variant: 'destructive',
          title: 'Camera Error',
          description: 'Could not start the selected camera. Please try another one or check permissions.',
        });
        setIsScanning(false);
      }
    };

    if (isScanning) {
      enableCamera();
    }

    return () => {
      // Cleanup function to stop the stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isScanning, currentDeviceId, toast]);


  // Effect for the QR scanning loop
  useEffect(() => {
    let animationFrameId: number;

    const scan = () => {
      if (isScanning && hasCameraPermission && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
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
            setIsScanning(false);
            toast({
                title: "QR Code Scanned!",
                description: `Data: ${code.data}`
            });
          }
        }
      }
      if (isScanning) {
        animationFrameId = requestAnimationFrame(scan);
      }
    };

    if (isScanning && hasCameraPermission) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning, hasCameraPermission, toast]);

  
  const startScan = async () => {
    setQrData(null);
    setHasCameraPermission(null);
    try {
      // Request permission first to get access to device labels.
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      tempStream.getTracks().forEach(track => track.stop()); // Stop temp stream.

      // Now get the list of devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(videoDevs);

      if (videoDevs.length > 0) {
        // Prefer the back camera ('environment') if available.
        const backCamera = videoDevs.find(d => d.label.toLowerCase().includes('back'));
        setCurrentDeviceId(backCamera ? backCamera.deviceId : videoDevs[0].deviceId);
        setIsScanning(true);
      } else {
        throw new Error('No video devices found.');
      }
    } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    setVideoDevices([]);
    setCurrentDeviceId(undefined);
  };

  const handleSwitchCamera = () => {
    if (videoDevices.length < 2) return;
    const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    setCurrentDeviceId(videoDevices[nextIndex].deviceId);
  };


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

        <div className="flex w-full items-center gap-2">
            {!isScanning ? (
            <Button onClick={startScan} className="w-full" size="lg">
                <Camera className="mr-2" /> Start Scanning
            </Button>
            ) : (
            <Button onClick={stopScan} className="w-full" size="lg" variant="destructive">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Stop Scanning
            </Button>
            )}

            {isScanning && videoDevices.length > 1 && (
                <Button onClick={handleSwitchCamera} size="lg" variant="outline" className="px-4">
                    <SwitchCamera />
                    <span className="sr-only">Switch Camera</span>
                </Button>
            )}
        </div>

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

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>What can you scan?</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside text-xs mt-2 space-y-1">
              <li><b>Packaged Foods:</b> Scan the QR code on packaged food items to automatically get nutrition info.</li>
              <li><b>Custom Meals:</b> Create QR codes for your homemade meals for quick logging later.</li>
              <li><b>Restaurant Menus:</b> Scan QR codes at supported restaurants and canteens.</li>
            </ul>
             <p className="text-xs mt-2 text-muted-foreground">(This feature is currently in development)</p>
          </AlertDescription>
        </Alert>

      </CardContent>
    </Card>
  );
}
