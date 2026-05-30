import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  to: string;
  label: string;
}

export function BackLink({ to, label }: Props) {
  return (
    <Link
      to={to}
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
