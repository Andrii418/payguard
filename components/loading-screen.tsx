export function LoadingScreen({ message = "Sprawdzanie sesji..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}