import { useState } from "react";
import { useBrandStore } from "@/state/brand.store";

export default function LinkedInConnect() {
  const [loading, setLoading] = useState(false);
  const { activeBrand } = useBrandStore();

  const handleConnect = () => {
    if (!activeBrand?._id) {
      alert("Please select a brand first.");
      return;
    }

    setLoading(true);

    window.location.href = `/api/oauth/linkedin?brandId=${activeBrand._id}`;
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 bg-[#0A66C2] text-white px-4 py-2 rounded-md hover:bg-[#004182] transition-colors disabled:opacity-50"
    >
      {loading ? "Redirecting..." : "Connect LinkedIn"}
    </button>
  );
}
