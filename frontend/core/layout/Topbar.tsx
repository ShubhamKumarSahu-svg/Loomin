"use client";

import { getBrands } from "@/services/api/brand.api";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Cpu, Globe } from "lucide-react";
import ThemedSelect from "@/components/ui/themed-select";
import { useBrandStore } from "@/state/brand.store";

const TITLES: Record<string, string> = {
  "/dashboard": "Control Center",
  "/studio": "Creative Studio",
  "/intelligence": "Intelligence Hub",
  "/notifications": "Activity Logs",
  "/settings": "System Config",
};

export default function Topbar() {
  const pathname = usePathname();
  const activeBrand = useBrandStore((state) => state.activeBrand);
  const setActiveBrand = useBrandStore((state) => state.setActiveBrand);

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0A0A]/80 px-6 py-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="hidden h-10 w-[1px] bg-white/10 lg:block" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
              Terminal / {pathname.split("/")[1] || "Home"}
            </p>
            <h2 className="text-xl font-serif font-light tracking-tight text-white">
              {TITLES[pathname] ?? "Loomin AI"}
            </h2>
          </div>
        </div>

        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/5 bg-white/[0.02] px-4 py-2 transition-all hover:border-sky-500/30 hover:bg-sky-500/5">
              <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                <Globe size={14} className={activeBrand ? "text-sky-400" : "text-gray-600"} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Active Context
                </span>
              </div>
              
              <div className="relative flex items-center gap-2">
                <ThemedSelect
                  value={activeBrand?._id ?? ""}
                  onChange={(nextBrandId) => {
                    const selected = brandsQuery.data?.find(
                      (brand) => brand._id === nextBrandId
                    );
                    if (selected) {
                      setActiveBrand(selected._id);
                    }
                  }}
                  options={(brandsQuery.data ?? []).map((brand) => ({
                    value: brand._id,
                    label: brand.name,
                  }))}
                  placeholder={brandsQuery.isLoading ? "Initializing..." : "Select Identity"}
                  className="min-w-[180px]"
                  buttonClassName="border-transparent bg-transparent py-1 pl-2 pr-2 text-xs font-medium hover:border-white/10"
                />
              </div>

              
              {activeBrand && (
                <div className="ml-2 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)] animate-pulse" />
                </div>
              )}
            </div>
          </div>

          
          <button className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-gray-500 transition-colors hover:text-sky-400 hover:border-sky-500/20">
            <Cpu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

