"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

import { z } from "zod";

const updateStatusSchema = z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]);

export async function updateOrderStatus(orderId: string, newStatus: string, trackingNumber?: string, carrier?: string) {
    const supabase = await createClient();

    // 1. Validate Input
    const validation = updateStatusSchema.safeParse(newStatus);
    if (!validation.success) {
        throw new Error("Invalid status: " + validation.error.issues[0].message);
    }

    // 2. Check Authorization (Admin Only)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        throw new Error("Unauthorized: Admin access required.");
    }

    // 3. Update Order
    const updateData: any = { status: newStatus };
    if (newStatus === "shipped" && trackingNumber) {
        updateData.tracking_number = trackingNumber;
        updateData.carrier = carrier;
    }

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/orders');

    // [NEW] Send Email Notification if Shipped
    if (newStatus === "shipped") {
        try {
            // First fetch the order details to get customer email
            const { data: order } = await supabase
                .from('orders')
                .select('*, items:order_items(*)')
                .eq('id', orderId)
                .single();

            if (order) {
                await import("@/app/actions/email").then(mod =>
                    mod.sendOrderStatusUpdate(order, trackingNumber, carrier)
                );
            }
        } catch (emailError) {
            console.error("Failed to send shipping email:", emailError);
            // Don't fail the status update just because email failed
        }
    }

    return { success: true };
}
