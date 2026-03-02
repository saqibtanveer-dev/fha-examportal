import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply - Admission Test',
  description: 'Apply for admission and scholarship tests',
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-white px-4 py-3 dark:bg-gray-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-bold">ExamCore Admissions</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/apply" className="text-muted-foreground hover:text-foreground">Apply</a>
            <a href="/results" className="text-muted-foreground hover:text-foreground">Results</a>
            <a href="/track" className="text-muted-foreground hover:text-foreground">Track</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        Powered by ExamCore
      </footer>
    </div>
  );
}
