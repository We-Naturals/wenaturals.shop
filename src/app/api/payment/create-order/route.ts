import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { order_id } = body;

        console.log(`[PaymentAPI] Initiating order: ${order_id}`);

        if (!order_id) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Fetch Order Items (using Admin client to skip RLS)
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('product_id, quantity, price_at_purchase')
            .eq('order_id', order_id);

        if (itemsError) {
            console.error("[PaymentAPI] Items Fetch Error:", itemsError);
            return NextResponse.json({ error: "Failed to verify order items" }, { status: 500 });
        }

        if (!orderItems || orderItems.length === 0) {
            console.warn(`[PaymentAPI] No items found for order: ${order_id}`);
            return NextResponse.json({ error: "Order items not found" }, { status: 404 });
        }

        // 2. Calculate Total (Trusting price_at_purchase captured by the atomic RPC)
        let serverTotal = 0;
        for (const item of orderItems) {
            serverTotal += Number(item.price_at_purchase) * item.quantity;
        }

        if (serverTotal <= 0) {
            console.error(`[PaymentAPI] Invalid total calculated: ${serverTotal}`);
            return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
        }

        const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            console.error("[PaymentAPI] Razorpay credentials missing from server environment");
            return NextResponse.json({ error: "Razorpay credentials missing" }, { status: 500 });
        }

        const instance = new Razorpay({
            key_id: key_id,
            key_secret: key_secret,
        });

        const options = {
            amount: Math.round(serverTotal * 100), // convert to paise
            currency: "INR",
            receipt: order_id,
        };

        const rzpOrder = await instance.orders.create(options);
        console.log(`[PaymentAPI] Razorpay Order Created: ${rzpOrder.id}`);

        return NextResponse.json(rzpOrder);
    } catch (error: any) {
        console.error("[PaymentAPI] Critical Failure:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
