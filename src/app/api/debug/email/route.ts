import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET() {
    const key = process.env.RESEND_API_KEY;

    const status = {
        hasKey: !!key,
        keyPrefix: key ? key.substring(0, 4) + '...' : 'MISSING',
        env: process.env.NODE_ENV
    };

    if (!key) {
        return NextResponse.json({
            success: false,
            message: "CRITICAL: RESEND_API_KEY is missing from environment variables.",
            debug: status
        }, { status: 500 });
    }

    try {
        const resend = new Resend(key);
        const { data, error } = await resend.emails.send({
            from: 'We Naturals <orders@wenaturals.shop>',
            to: ['delivered@resend.dev'], // Safe test address
            subject: 'Diagnostic Test Email',
            html: '<p>If you received this, the email configuration is working.</p>'
        });

        if (error) {
            return NextResponse.json({
                success: false,
                message: "API Key exists but sending failed. Check domain verification.",
                error,
                debug: status
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Configuration valid. Test email sent to delivered@resend.dev",
            data,
            debug: status
        });

    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: "Unexpected error during send attempt.",
            error: e.message,
            debug: status
        }, { status: 500 });
    }
}
