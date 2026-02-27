"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// The submit button extracts its pending state automatically
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    setError(null);
    const result = await loginAction(formData);
    
    // If the action returns something, it means there was an error 
    // (successful logins trigger a redirect inside the server action)
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your tenant.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={clientAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="hr@muster-ag.ch" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
            />
          </div>
          
          {error && (
            <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}