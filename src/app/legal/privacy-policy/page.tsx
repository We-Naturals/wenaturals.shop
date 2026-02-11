"use client";

import { useContent } from "@/hooks/useContent";

export default function PrivacyPolicy() {
    const content = useContent('content_pages');
    const privacyPolicy = content?.legal?.privacy_policy;

    return (
        <div className="prose dark:prose-invert max-w-none">
            {privacyPolicy ? (
                <div dangerouslySetInnerHTML={{ __html: privacyPolicy }} />
            ) : (
                <>
                    <h1>Privacy Policy</h1>
                    <p className="lead" suppressHydrationWarning>
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <p>
                        At <strong>We Naturals</strong>, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2>1. The Data We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul>
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                        <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                    </ul>

                    <h2>2. How We Use Your Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul>
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>

                    <h2>3. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>

                    <h2>4. Your Legal Rights</h2>
                    <p>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
                    </p>

                    <hr />
                    <p className="text-sm text-zinc-500">
                        If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:customercare@wenaturals.shop">customercare@wenaturals.shop</a>.
                    </p>
                </>
            )}
        </div>
    );
}
