"use client";

import { toast } from "sonner";
import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { resetDemo } = useStore();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    toast.success("Settings saved");
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, company details and billing.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">GM</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Gian Matthew de Castro</div>
                <div className="text-sm text-muted-foreground">
                  Operations Manager
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => toast.info("Avatar upload coming soon")}
                >
                  Change photo
                </Button>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldRow label="Full Name" defaultValue="Gian Matthew de Castro" />
              <FieldRow label="Role" defaultValue="Operations Manager" />
              <FieldRow
                label="Email"
                defaultValue="gian.matthewdc@gmail.com"
                type="email"
              />
              <FieldRow label="Mobile" defaultValue="+63 917 000 0000" />
            </div>
          </Card>
        </TabsContent>

        {/* Company */}
        <TabsContent value="company">
          <Card className="p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldRow label="Company Name" defaultValue="Vero Catering" />
              <FieldRow label="Business Type" defaultValue="Full-Service Catering" />
              <FieldRow label="Contact Number" defaultValue="+63 2 8555 0100" />
              <FieldRow label="Email" defaultValue="hello@vero.ph" type="email" />
              <div className="sm:col-span-2">
                <FieldRow
                  label="Business Address"
                  defaultValue="123 Banquet Ave, Makati City, Metro Manila"
                />
              </div>
              <FieldRow label="Service Charge (%)" defaultValue="10" />
              <FieldRow label="VAT (%)" defaultValue="12" />
            </div>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card className="p-6">
            <div className="flex items-center justify-between rounded-lg border bg-accent/40 p-4">
              <div>
                <div className="text-sm font-semibold">Growth Plan</div>
                <div className="text-sm text-muted-foreground">
                  Unlimited events · 3 team members · Custom templates
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">₱2,499/mo</div>
                <div className="text-xs text-muted-foreground">
                  Renews Jul 1, 2026
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldRow label="Billing Email" defaultValue="billing@vero.ph" />
              <FieldRow label="TIN" defaultValue="009-123-456-000" />
            </div>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => toast.info("Manage subscription coming soon")}
            >
              Manage subscription
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            resetDemo();
            toast.success("Demo data reset", {
              description: "Sample events have been restored.",
            });
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset demo data
        </Button>
        <Button onClick={save}>{saved ? "Saved!" : "Save changes"}</Button>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} defaultValue={defaultValue} />
    </div>
  );
}
