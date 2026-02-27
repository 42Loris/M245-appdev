// components/profiles/CreateProfileButton.tsx
"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProfileAction } from "@/actions/profiles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={pending}>
      {pending ? "Saving..." : "Create Profile"}
    </Button>
  );
}

export default function CreateProfileButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createProfileAction, null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Role Profile
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Role Profile</DialogTitle>
          <DialogDescription>
            Define a standard role to automate future onboardings.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="roleTitle">Role Title</Label>
            <Input id="roleTitle" name="roleTitle" placeholder="e.g. Senior Frontend Engineer" required />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" name="department" placeholder="e.g. Engineering" required />
          </div>

          {state?.error && (
            <p className="text-sm font-medium text-red-500 bg-red-50 p-2 rounded">{state.error}</p>
          )}

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}