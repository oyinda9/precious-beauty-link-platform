"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  salon: any | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (next: any) => void;
  onSave: () => void;
}

export function EditSalonDialog({
  open,
  salon,
  saving,
  onOpenChange,
  onChange,
  onSave,
}: Props) {
  if (!salon) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Salon</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input value={salon.name ?? ""} onChange={(e) => onChange({ ...salon, name: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input value={salon.email ?? ""} onChange={(e) => onChange({ ...salon, email: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <Label>Phone</Label>
            <Input value={salon.phone ?? ""} onChange={(e) => onChange({ ...salon, phone: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <Label>City</Label>
            <Input value={salon.city ?? ""} onChange={(e) => onChange({ ...salon, city: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <Label>Address</Label>
            <Input value={salon.address ?? ""} onChange={(e) => onChange({ ...salon, address: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}