export default function LoadingSpinner({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div
        className="animate-spin rounded-full border-4 border-coral border-t-transparent"
        style={{ width: size, height: size, borderTopColor: "#fff" }}
      />
    </div>
  );
} 