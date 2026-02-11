"use client";

import { useContent } from "@/hooks/useContent";

export default function TermsOfService() {
    const content = useContent('content_pages');
    const termsOfService = content?.legal?.terms_of_service;

    return (
        <div className="prose dark:prose-invert max-w-none">
            {termsOfService ? (
                <div dangerouslySetInnerHTML={{ __html: termsOfService }} />
            ) : (
                <>
                    <h1>Terms of Service</h1>
                    <p className="lead" suppressHydrationWarning>
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <h2>1. Introduction</h2>
                    <p>
                        These Website Standard Terms and Conditions written on this webpage shall manage your use of our website, We Naturals accessible at wenaturals.com.
                    </p>

                    <h2>2. Intellectual Property Rights</h2>
                    <p>
                        Other than the content you own, under these Terms, We Naturals and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
                    </p>

                    <h2>3. Restrictions</h2>
                    <p>
                        You are specifically restricted from all of the following:
                    </p>
                    <ul>
                        <li>publishing any Website material in any other media;</li>
                        <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
                        <li>publicly performing and/or showing any Website material;</li>
                        <li>using this Website in any way that is or may be damaging to this Website;</li>
                        <li>using this Website in any way that impacts user access to this Website;</li>
                    </ul>

                    <h2>4. Limitation of liability</h2>
                    <p>
                        In no event shall We Naturals, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. We Naturals, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
                    </p>

                    <h2>5. Governing Law & Jurisdiction</h2>
                    <p>
                        These Terms will be governed by and interpreted in accordance with the laws of the State of Country, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Country for the resolution of any disputes.
                    </p>
                </>
            )}
        </div>
    );
}
