export function StatusBadge({ status }: { status: string }) {
  const base =
    "px-2 py-1 rounded-full text-xs font-medium";

  if (status === "published") {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        Published
      </span>
    );
  }

  if (status === "awaiting_review") {
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>
        Awaiting Review
      </span>
    );
  }

  return (
    <span className={`${base} bg-gray-100 text-gray-700`}>
      Draft
    </span>
  );
}