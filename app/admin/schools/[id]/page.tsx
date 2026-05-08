import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SchoolForm from "../SchoolForm";
import type { School } from "@/lib/types";

interface Props {
  params: { id: string };
}

export default async function EditSchoolPage({ params }: Props) {
  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!school) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[#1a3a5c]">Мэдээлэл засах</h1>
      <SchoolForm school={school as School} />
    </div>
  );
}
