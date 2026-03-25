export const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
    case "COMPLETED":
      return "bg-green-500/20 text-green-300 border-green-500/50";
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
    case "CANCELLED":
      return "bg-red-500/20 text-red-300 border-red-500/50";
    case "CONFIRMED":
      return "bg-blue-500/20 text-blue-300 border-blue-500/50";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/50";
  }
};

export function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}
