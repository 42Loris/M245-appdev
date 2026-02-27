// components/dashboard/TriggerOnboardingButton.tsx
"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { triggerOnboardingAction } from "@/actions/onboarding";
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={pending}>
      {pending ? "Triggering Workflow..." : "Start Onboarding"}
    </Button>
  );
}

export default function TriggerOnboardingButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(triggerOnboardingAction, null);

  // Close the modal automatically if the server action succeeds
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">Trigger Onboarding</Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Onboarding Workflow</DialogTitle>
          <DialogDescription>
            Enter the new hire's details. This will automatically provision their IT tasks and notify the team.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="Peter Meier" required />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Private Email</Label>
            <Input id="email" name="email" type="email" placeholder="peter.m@gmail.com" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="roleTitle">Role</Label>
              <Input id="roleTitle" name="roleTitle" placeholder="Production Manager" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" placeholder="Production" required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" name="startDate" type="date" required />
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