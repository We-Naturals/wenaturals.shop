import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { order_id } = body;

        if (!order_id) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Fetch Order Items to calculate trusted total
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('product_id, quantity, products(price)')
            .eq('order_id', order_id);

        if (itemsError || !orderItems || orderItems.length === 0) {
            return NextResponse.json({ error: "Order items not found" }, { status: 404 });
        }

        // 2. Calculate Total on Server (Trust Source)
        let serverTotal = 0;
        for (const item of orderItems) {
            // @ts-ignore
            const price = Number(item.products?.price) || 0;
            serverTotal += price * item.quantity;
        }

        if (serverTotal <= 0) {
            return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
        }

        // 3. Update Order with Server Calculated Total (Anti-Tamper)
        const { error: updateError } = await supabase
            .from('orders')
            .update({ total_amount: serverTotal })
            .eq('id', order_id);

        if (updateError) {
             console.error("Failed to update order total:", updateError);
             return NextResponse.json({ error: "Failed to secure order" }, { status: 500 });
        }

        const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
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

        const order = await instance.orders.create(options);

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Razorpay Order Creation Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
