"use server";

import { Resend } from 'resend';

// Use verified domain or default Resend testing domain
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'We Naturals <onboarding@resend.dev>';
const CUSTOMER_CARE_EMAIL = 'customercare.wenaturals.co@gmail.com';

const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        console.warn("RESEND_API_KEY is missing. Email notifications will be disabled.");
        return null;
    }
    return new Resend(key);
};

export async function sendOrderConfirmation(orderData: any) {
    try {
        const { id, customer_email, customer_name, total_amount, items } = orderData;

        const resend = getResend();
        if (!resend) return { success: true, message: "Email disabled (missing key)" };

        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            replyTo: CUSTOMER_CARE_EMAIL,
            to: [customer_email],
            subject: `Ritual Confirmed | Order #${id.slice(0, 8).toUpperCase()}`,
            react: null, // explicit null if using html
            html: `
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #222; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
                        
                        <!-- Header -->
                        <div style="background-color: #000; padding: 30px; text-align: center; border-bottom: 1px solid #222;">
                            <img src="https://res.cloudinary.com/dbfltasjo/image/upload/v1770733974/We_natural_250_x_100_px_nreaal.png" alt="We Naturals" style="height: 40px; width: auto;" />
                        </div>

                        <!-- Content -->
                        <div style="padding: 40px;">
                            <h2 style="color: #fff; font-size: 24px; text-align: center; font-weight: 300; margin-bottom: 10px;">Ritual Confirmed</h2>
                            <p style="color: #888; text-align: center; font-size: 14px; margin-bottom: 30px;">Order #${id.slice(0, 8).toUpperCase()}</p>
                            
                            <p style="color: #ccc; text-align: center; line-height: 1.6; margin-bottom: 40px;">
                                Thank you, ${customer_name}.<br/>
                                Your selection of natural essentials has been received and is being prepared with care.
                            </p>

                            <!-- Order Items -->
                            <div style="background-color: #111; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                ${items.map((item: any) => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #222;">
                                        <div style="flex: 1;">
                                            <span style="display: block; color: #fff; font-size: 14px;">${item.product_name || item.name || 'Artifact'}</span>
                                            <span style="display: block; color: #666; font-size: 12px; margin-top: 4px;">Qty: ${item.quantity}</span>
                                        </div>
                                        <span style="color: #fff; font-size: 14px;">₹${item.price_at_purchase}</span>
                                    </div>
                                `).join('')}
                                
                                <div style="display: flex; justify-content: space-between; padding-top: 20px; margin-top: 10px; border-top: 1px solid #333;">
                                    <span style="color: #888; font-size: 14px;">Total Essence</span>
                                    <span style="color: #d4af37; font-size: 18px; font-weight: bold;">₹${total_amount}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #050505; padding: 30px; text-align: center; border-top: 1px solid #222;">
                            <p style="color: #444; font-size: 12px; margin: 0;">
                                Nature's Finest Essentials<br/>
                                © ${new Date().getFullYear()} We Naturals
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('Resend API Error (Order Confirmation):', JSON.stringify(error, null, 2));
            return { success: false, error };
        }

        console.log('Order Confirmation Email Sent:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Email Exception (Order Confirmation):', error);
        return { success: false, error };
    }
}

export async function sendOrderStatusUpdate(orderData: any, trackingNumber?: string, carrier?: string) {
    try {
        const { id, customer_email, customer_name, status } = orderData;

        // Allow both shipped and delivered
        if (!['shipped', 'delivered'].includes(status)) return { success: false };

        const isDelivered = status === 'delivered';
        const subject = isDelivered
            ? `Ritual Completed | Order #${id.slice(0, 8).toUpperCase()}`
            : `On Its Way | Order #${id.slice(0, 8).toUpperCase()}`;

        const resend = getResend();
        if (!resend) return { success: true, message: "Email disabled (missing key)" };

        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            replyTo: CUSTOMER_CARE_EMAIL,
            to: [customer_email],
            subject: subject,
            react: null,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #222; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
                        
                        <!-- Header -->
                        <div style="background-color: #000; padding: 30px; text-align: center; border-bottom: 1px solid #222;">
                            <img src="https://res.cloudinary.com/dbfltasjo/image/upload/v1770733974/We_natural_250_x_100_px_nreaal.png" alt="We Naturals" style="height: 40px; width: auto;" />
                        </div>

                        <!-- Content -->
                        <div style="padding: 40px; text-align: center;">
                            <div style="width: 60px; height: 60px; background-color: #111; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid #333;">
                                <span style="font-size: 24px;">${isDelivered ? '✨' : '🚚'}</span>
                            </div>

                            <h2 style="color: #fff; font-size: 24px; font-weight: 300; margin-bottom: 10px;">${isDelivered ? 'Ritual Completed' : 'Order Shipped'}</h2>
                            <p style="color: #888; font-size: 14px; margin-bottom: 30px;">Order #${id.slice(0, 8).toUpperCase()}</p>
                            
                            <p style="color: #ccc; line-height: 1.6; margin-bottom: 40px;">
                                ${isDelivered ?
                    `Greetings, ${customer_name}.<br/>Your natural essentials have arrived. Only valid reflections remain.` :
                    `Good news, ${customer_name}.<br/>Your package has left our sanctuary and is on its way to you.`
                }
                            </p>

                            ${!isDelivered && trackingNumber ? `
                                <div style="background-color: #111; border: 1px solid #222; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: left;">
                                    <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Tracking Details</p>
                                    <p style="color: #fff; font-family: monospace; font-size: 16px; margin: 0;">${trackingNumber}</p>
                                    ${carrier ? `<p style="color: #888; font-size: 12px; margin: 5px 0 0 0;">via ${carrier}</p>` : ''}
                                </div>
                            ` : ''}

                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account" style="display: inline-block; background-color: #fff; color: #000; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                ${isDelivered ? 'View Receipt' : 'Track Ritual'}
                            </a>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #050505; padding: 30px; text-align: center; border-top: 1px solid #222;">
                            <p style="color: #444; font-size: 12px; margin: 0;">
                                Nature's Finest Essentials<br/>
                                © ${new Date().getFullYear()} We Naturals
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('Resend API Error (Status Update):', JSON.stringify(error, null, 2));
            return { success: false, error };
        }

        console.log('Status Update Email Sent:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Email Exception (Status Update):', error);
        return { success: false, error };
    }
}
