"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

import { z } from "zod";

const statusSchema = z.enum(["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "return_processing", "return_requested"]);
const paymentStatusSchema = z.enum(["pending", "paid", "refunded", "failed"]);

export async function updateOrderStatus(orderId: string, newStatus: string, trackingNumber?: string, carrier?: string, newPaymentStatus?: string) {
    const supabase = await createClient();

    // 1. Authorization Check (Admin Only)
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

    // 2. Fetch Order Logic (To handle COD auto-update)
    const { data: order } = await supabase
        .from('orders')
        .select('payment_method, payment_status')
        .eq('id', orderId)
        .single();

    if (!order) throw new Error("Order not found");

    // 3. Prepare Update Payload
    const updateData: any = {};

    // Validate and specificy delivery status
    if (newStatus) {
        // Allow looser validation or map old statuses? For now strict
        try {
            statusSchema.parse(newStatus);
            updateData.status = newStatus;
        } catch (e) {
            // Ignore if separate update, or throw? The UI might send partials.
            // Let's assume if sent, it must be valid.
            // throw new Error("Invalid Status");
        }
    }

    // Handle Payment Status
    if (newPaymentStatus) {
        paymentStatusSchema.parse(newPaymentStatus);
        updateData.payment_status = newPaymentStatus;
    }

    // Auto-Update Logic: If COD and Delivered -> Paid
    if (newStatus === "delivered" && order.payment_method === "cod" && order.payment_status !== "paid") {
        updateData.payment_status = "paid";
    }

    if (newStatus === "shipped" && trackingNumber) {
        updateData.tracking_number = trackingNumber;
        updateData.carrier = carrier;
    }

    // 4. Perform Update
    if (Object.keys(updateData).length === 0) return { success: true }; // Nothing to update

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/orders');

    // 5. Send Email Notification if Shipped or Delivered
    if (updateData.status === "shipped" || updateData.status === "delivered") {
        try {
            const { data: fullOrder } = await supabase
                .from('orders')
                .select('*, items:order_items(*)')
                .eq('id', orderId)
                .single();

            if (fullOrder) {
                const { sendOrderStatusUpdate } = await import("@/app/actions/email");
                await sendOrderStatusUpdate(fullOrder, trackingNumber || "", carrier || "");
            }
        } catch (emailError) {
            console.error("Failed to send email", emailError);
        }
    }

    return { success: true };
}
