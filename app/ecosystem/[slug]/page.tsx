import { ecosystemApps } from "@/data/apps";
import { notFound } from "next/navigation";
import SharedHubDetails from "@/components/SharedHubDetails";

export function generateStaticParams() {
  return ecosystemApps.map((app) => ({ slug: app.slug }));
}

export default async function AppDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!ecosystemApps.some((item) => item.slug === slug)) notFound();
  return <SharedHubDetails slug={slug} />;
}
