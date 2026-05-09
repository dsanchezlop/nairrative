import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { campaign } = await searchParams;
  if (!campaign) redirect("/campaigns");

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-200 tracking-tight">
            Tu grimorio
          </h1>
          <p className="text-gray-400 mt-1">
            Genera y gestiona el contenido de tus partidas de rol
          </p>
        </div>
        <Suspense>
          <DashboardClient initialCampaigns={campaigns ?? []} />
        </Suspense>
      </main>
    </div>
  );
}
