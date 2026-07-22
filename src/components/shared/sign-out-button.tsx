"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth.actions";
import { ROUTES } from "@/lib/routes";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      onClick={async () => {
        setLoading(true);
        await signOutAction();
        router.push(ROUTES.home);
        router.refresh();
      }}
      disabled={loading}
      className="h-11 rounded-xl"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Sair
    </Button>
  );
}
