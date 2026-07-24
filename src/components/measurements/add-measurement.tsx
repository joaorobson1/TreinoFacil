"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addMeasurementAction } from "@/actions/measurement.actions";

export function AddMeasurement({ lastWeight }: { lastWeight?: number | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [fat, setFat] = useState("");

  async function submit() {
    setSaving(true);
    const res = await addMeasurementAction({
      weight_kg: Number(weight.replace(",", ".")),
      waist_cm: waist.trim() === "" ? null : Number(waist.replace(",", ".")),
      body_fat_pct: fat.trim() === "" ? null : Number(fat.replace(",", ".")),
      notes: "",
    });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Medida registrada!");
    setWeight("");
    setWaist("");
    setFat("");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-11 w-full rounded-2xl font-semibold">
            <Plus className="size-5" />
            Registrar medida
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Nova medida</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="m-weight">Peso (kg)</Label>
            <Input
              id="m-weight"
              type="number"
              inputMode="decimal"
              autoFocus
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={lastWeight ? String(lastWeight) : "72"}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-waist">Cintura (cm)</Label>
              <Input id="m-waist" type="number" inputMode="decimal" value={waist}
                onChange={(e) => setWaist(e.target.value)} placeholder="opcional" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-fat">Gordura (%)</Label>
              <Input id="m-fat" type="number" inputMode="decimal" value={fat}
                onChange={(e) => setFat(e.target.value)} placeholder="opcional" className="h-11 rounded-xl" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={saving} />}>
            Cancelar
          </DialogClose>
          <Button onClick={submit} disabled={saving || weight.trim() === ""}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
