import Link from "next/link";
import { buttonSecondary } from "@/components/ui/styles";

export default function AdminNotFound() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl">Este elemento ya no existe</h1>
      <p className="mt-3 max-w-[60ch] text-muted">Puede que se haya eliminado o que el enlace esté incompleto.</p>
      <Link href="/admin" className={`${buttonSecondary} mt-6`}>
        Ir al inicio del panel
      </Link>
    </div>
  );
}
