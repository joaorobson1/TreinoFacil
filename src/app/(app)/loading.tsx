import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto genérico exibido enquanto uma tela da área autenticada carrega. */
export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-md px-6 pt-8">
      <Skeleton className="mb-6 h-8 w-40 rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
