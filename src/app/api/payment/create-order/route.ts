import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, currency = "INR", receipt } = body;

        if (!amount) {
            return NextResponse.json({ error: "Amount is required" }, { status: 400 });
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
            amount: Math.round(amount * 100), // convert to paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Razorpay Order Creation Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
