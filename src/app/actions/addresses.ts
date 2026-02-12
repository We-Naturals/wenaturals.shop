"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function deleteAddressAction(addressId: string) {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Delete address (RLS will ensure it belongs to the user, but we can be explicit)
    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/account');
    return { success: true };
}
