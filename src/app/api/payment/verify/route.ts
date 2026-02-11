import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

        // Initialize Supabase Admin Client inside handler to avoid build-time errors if key is missing
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );


        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error("RAZORPAY_KEY_SECRET is not set");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Signature Valid - Update Order in DB
        // Use Admin client to bypass RLS policies that might restrict updates
        const { error } = await supabaseAdmin
            .from('orders')
            .update({
                payment_id: razorpay_payment_id,
                payment_status: 'paid',
                status: 'processing', // Move to processing once paid
                updated_at: new Date().toISOString()
            })
            .eq('id', order_id);

        if (error) {
            console.error("Failed to update order:", error);
            return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Payment verified and order updated" });

    } catch (error: any) {
        console.error("Payment verification failed:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
