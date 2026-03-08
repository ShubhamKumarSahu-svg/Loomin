interface Props {
  title: string;
  value: number;
}

export default function SummaryCard({ title, value }: Props) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-semibold">{value}</h2>
    </div>
  );
}