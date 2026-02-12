import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.log("AdminLayout: No user found. Redirecting to login.");
        redirect("/admin-login");
    }

    // Check if user has admin role
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    console.log(`AdminLayout Debug: UserID=${user.id}, Role=${profile?.role}, Error=${error?.message}`);

    if (!profile || profile.role !== 'admin') {
        console.log("AdminLayout: Not an admin. Redirecting.");
        redirect("/");
    }

    return (
        <AdminLayoutClient>
            {children}
        </AdminLayoutClient>
    );
}
