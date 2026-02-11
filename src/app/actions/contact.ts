"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: FormData) {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!firstName || !email || !message) {
        return { error: "Missing required fields" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "We Naturals Contact <onboarding@resend.dev>", // Default Resend sender, update if they have a domain
            to: "hello@wenaturals.com", // Keeping this as the destination as per the UI text
            replyTo: email,
            subject: `New Contact Inquiry from ${firstName} ${lastName}`,
            text: `
Name: ${firstName} ${lastName}
Email: ${email}

Message:
${message}
            `,
            // HTML version for better readability
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>New Contact Inquiry</h2>
                    <p><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
                    <hr />
                    <h3>Message:</h3>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `
        });

        if (error) {
            console.error("Resend Error:", error);
            return { error: "Failed to send message. Please try again." };
        }

        return { success: true };
    } catch (e) {
        console.error("Unexpected Error:", e);
        return { error: "An unexpected error occurred." };
    }
}
