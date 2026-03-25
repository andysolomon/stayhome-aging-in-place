"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function AdminPartnersPage() {
  const partners = useQuery(api.partners.listAll);
  const createPartner = useMutation(api.partners.create);
  const toggleStatus = useMutation(api.partners.toggleStatus);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  async function handleCreate() {
    if (!name || !email) return;
    const key = await createPartner({ name, contactEmail: email });
    setGeneratedKey(key);
    setName("");
    setEmail("");
  }

  return (
    <div className="text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Partners</h1>
          <Button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Cancel" : "Add Partner"}
          </Button>
        </div>

        {showCreate && (
          <Card className="mt-4">
            <CardContent className="space-y-3 pt-4">
              <div className="space-y-2">
                <Label>Partner Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button onClick={handleCreate}>Create Partner</Button>
            </CardContent>
          </Card>
        )}

        {generatedKey && (
          <div className="mt-4 rounded-lg border border-yellow-800 bg-yellow-950/30 p-4">
            <p className="text-sm font-semibold text-yellow-200">API Key (shown once — copy it now!):</p>
            <p className="mt-1 font-mono text-sm text-yellow-300 break-all">{generatedKey}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => {
              navigator.clipboard.writeText(generatedKey);
              setGeneratedKey(null);
            }}>
              Copy & Dismiss
            </Button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {partners?.map((p) => (
            <Card key={p._id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.contactEmail}</p>
                  <p className="text-xs text-zinc-500">Rate limit: {p.rateLimit}/hr</p>
                </div>
                <Badge
                  className={p.status === "active" ? "bg-green-900 text-green-200 cursor-pointer" : "bg-zinc-800 text-zinc-400 cursor-pointer"}
                  onClick={() => toggleStatus({ partnerId: p._id })}
                >
                  {p.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
