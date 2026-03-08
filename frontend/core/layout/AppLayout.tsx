import Sidebar from "@/core/layout/Sidebar";
import Topbar from "@/core/layout/Topbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-grid min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px]">
        <Sidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
