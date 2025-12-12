import { TravelPlan, TravelPlanResponse } from "@/types";
import TravelPlanDetailsClient from "./TravelPlanDetailsClient";

interface PageProps {
  params: { id: string };
}

async function getTravelPlan(id: string): Promise<TravelPlan> {
    console.log(id);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/travel/joined-users/${id}`,
    { cache: "no-store" }
  );
  console.log(res);
  if (!res.ok) throw new Error("Failed to fetch travel plan");

  const json: TravelPlanResponse = await res.json();
  return json.data;
}

export default async function TravelPlanDetailsPage({ params }: PageProps) {
    const { id } = await params;
  const plan = await getTravelPlan(id);
  return <TravelPlanDetailsClient initialPlan={plan} />;
}
