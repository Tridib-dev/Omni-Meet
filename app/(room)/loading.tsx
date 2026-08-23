export default function RoomLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0A0C10] px-6 text-center text-[#F3F5F8]">
      <div className="space-y-2">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#4f46e5] border-t-transparent" />
        <h3 className="text-sm font-medium">Loading room…</h3>
      </div>
    </div>
  );
}
