"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewContractorPage() {
  const create = useMutation(api.contractors.create);
  const router = useRouter();

  const [form, setForm] = useState({
    businessName: "",
    contactEmail: "",
    phone: "",
    serviceAreaZips: "",
    hazardSpecialties: "",
    bio: "",
  });

  async function handleSubmit() {
    if (!form.businessName || !form.contactEmail || !form.phone) return;

    await create({
      businessName: form.businessName,
      contactEmail: form.contactEmail,
      phone: form.phone,
      serviceAreaZips: form.serviceAreaZips.split(",").map((z) => z.trim()).filter(Boolean),
      hazardSpecialties: form.hazardSpecialties.split(",").map((s) => s.trim()).filter(Boolean),
      bio: form.bio || undefined,
    });

    router.push("/admin/contractors");
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8 text-white">
      <Card>
        <CardHeader>
          <CardTitle>Add Contractor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Service Area ZIPs (comma-separated)</Label>
            <Input placeholder="90210, 90211, 90212" value={form.serviceAreaZips} onChange={(e) => setForm({ ...form, serviceAreaZips: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Hazard Specialties (comma-separated hazard IDs)</Label>
            <Input placeholder="no_grab_bars, loose_rugs, dim_lighting" value={form.hazardSpecialties} onChange={(e) => setForm({ ...form, hazardSpecialties: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Bio (optional)</Label>
            <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <Button onClick={handleSubmit} className="w-full">Create Contractor</Button>
        </CardContent>
      </Card>
    </div>
  );
}
