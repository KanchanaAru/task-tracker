import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Nav email={user.email ?? ""} />
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
