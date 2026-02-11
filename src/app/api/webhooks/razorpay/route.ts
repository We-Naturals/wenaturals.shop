import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client
export async function POST(req: NextRequest) {
    // Initialize Supabase Admin Client inside handler
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await req.text(); // Get raw body for signature verification
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not set");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // 1. Verify Webhook Signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Parse Event
        const event = JSON.parse(body);

        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            const order_id = payment.notes?.order_id; // Assuming we pass order_id in notes when creating order

            if (order_id) {
                // Idempotent update
                await supabaseAdmin
                    .from('orders')
                    .update({
                        payment_id: payment.id,
                        payment_status: 'paid',
                        status: 'processing',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', order_id);

                console.log(`Webhook: Order ${order_id} marked as paid via webhook.`);
            } else {
                console.warn("Webhook: Payment captured but no order_id in notes.");
            }
        }

        return NextResponse.json({ status: "ok" });

    } catch (error: any) {
        console.error("Webhook processing failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
