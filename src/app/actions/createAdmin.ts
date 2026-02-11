"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase-server"; // Standard client for auth check

const adminSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name is required"),
});

// Service Role Client (For execution only)
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function createAdminUser(prevState: any, formData: FormData) {
    // Initialize Admin Client lazily
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
    // 1. Validate Input
    const rawData = {
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
    };

    try {
        const { email, password, name } = adminSchema.parse(rawData);
        // 2. Authorization Check (Must be an existing Admin)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { message: "Unauthorized: Please sign in.", error: true };
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return { message: "Unauthorized: Insufficient permissions.", error: true };
        }

        // 3. Execution (Create User via Admin API)
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name }
        });

        if (userError) throw userError;

        if (!userData.user) throw new Error("Failed to create user");

        // 4. Create/Update Profile with 'admin' role
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userData.user.id,
                email: email,
                role: 'admin',
                full_name: name,
                created_at: new Date().toISOString()
            });

        if (profileError) throw profileError;

        return { message: `Administrator ${email} created successfully.`, error: false };

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { message: error.issues[0].message, error: true };
        }
        console.error("Admin Creation Error:", error);
        return { message: error.message || "Failed to create admin", error: true };
    }
}
