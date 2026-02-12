"use server";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(orderData: any) {
    try {
        const { id, customer_email, customer_name, total_amount, items } = orderData;

        // Use a testing email if in development to avoid spamming real people while testing
        // or just send to the customer. 
        // Note: Free Resend accounts can only send TO the email registered with Resend.
        // For this demo, we will try to send to the customer_email, but it might fail if verified domain is missing.
        // We will default to a 'delivered@resend.dev' if testing, or just try.

        const { data, error } = await resend.emails.send({
            from: 'We Naturals <onboarding@resend.dev>', // Use verified domain here in prod
            to: [customer_email],
            subject: `Order Confirmed #${id.slice(0, 8)}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 20px;">
                    <h1 style="text-align: center; color: #60a5fa; letter-spacing: 0.2em; text-transform: uppercase; font-size: 14px; margin-bottom: 40px;">We Naturals</h1>
                    
                    <h2 style="font-size: 32px; margin-bottom: 20px; text-align: center;">Ritual Confirmed</h2>
                    <p style="color: #a1a1aa; text-align: center; line-height: 1.6; margin-bottom: 40px;">
                        Thank you, ${customer_name}. Your essence is being prepared with intention and care.
                    </p>

                    <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
                        <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin-bottom: 20px;">Order Summary</h3>
                        
                        ${items.map((item: any) => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                                <span>${item.product_name} <span style="color: #71717a;">x${item.quantity}</span></span>
                                <span>$${item.price_at_purchase}</span>
                            </div>
                        `).join('')}
                        
                        <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 20px; padding-top: 20px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
                            <span>Total</span>
                            <span style="background: -webkit-linear-gradient(45deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">$${total_amount}</span>
                        </div>
                    </div>

                    <p style="text-align: center; font-size: 12px; color: #52525b;">
                        This email confirms your order #${id}. If you have any questions, reply to this email.
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('Resend API Error:', error);
            // Don't throw, just log. We don't want to break the checkout success page if email fails.
            return { success: false, error };
        }

        console.log("Email sent successfully:", data?.id);
        return { success: true, data };
    } catch (error) {
        console.error('Email Exception (Check API Key):', error);
        return { success: false, error };
    }
}

export async function sendOrderStatusUpdate(orderData: any, trackingNumber?: string, carrier?: string) {
    try {
        const { id, customer_email, customer_name, status } = orderData;
        // Only sending for 'shipped' for now as per request
        if (status !== 'shipped' && orderData.status !== 'shipped') return { success: false, reason: "Status not shipped" };

        const trackingHtml = trackingNumber ? `
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
                <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; color: #71717a; margin-bottom: 10px;">Tracking Nuumber</p>
                <p style="font-family: monospace; font-size: 18px; color: #fff; letter-spacing: 0.05em;">${trackingNumber}</p>
                ${carrier ? `<p style="font-size: 12px; color: #a1a1aa; margin-top: 5px;">via ${carrier}</p>` : ''}
            </div>
        ` : '';

        const { data, error } = await resend.emails.send({
            from: 'We Naturals <onboarding@resend.dev>',
            to: [customer_email],
            subject: `Your Ritual is on its way! Order #${id.slice(0, 8)}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 20px;">
                    <h1 style="text-align: center; color: #60a5fa; letter-spacing: 0.2em; text-transform: uppercase; font-size: 14px; margin-bottom: 40px;">We Naturals</h1>
                    
                    <h2 style="font-size: 32px; margin-bottom: 20px; text-align: center;">Order Shipped</h2>
                    <p style="color: #a1a1aa; text-align: center; line-height: 1.6; margin-bottom: 40px;">
                        Good news, ${customer_name}. Your essence has left our sanctuary and is journeying to you.
                    </p>

                    ${trackingHtml}

                    <div style="text-align: center; margin-bottom: 40px;">
                        <a href="#" style="background: #fff; color: #000; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
                            Track Package
                        </a>
                        <p style="font-size: 10px; color: #52525b; margin-top: 10px;">(Tracking link is a placeholder for MVP)</p>
                    </div>

                    <p style="text-align: center; font-size: 12px; color: #52525b;">
                        Order #${id}
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('Email Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email Exception:', error);
        return { success: false, error };
    }
}
