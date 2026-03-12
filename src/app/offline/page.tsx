import { WifiOff } from 'lucide-react';

export const metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
        <p className="text-muted-foreground">
          It looks like you&apos;ve lost your internet connection. Please check
          your network and try again.
        </p>
        <p className="text-xs text-muted-foreground">
          ExamCore requires an active connection to load data.
        </p>
      </div>
    </div>
  );
}
