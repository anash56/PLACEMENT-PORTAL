import { BrevoClient } from "@getbrevo/brevo";
import dns from "dns";

// Force Node.js to prefer IPv4 over IPv6 globally for DNS resolution to fix ENETUNREACH on cloud hosts
dns.setDefaultResultOrder("ipv4first");

const getBrevoClient = () => {
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
        return new BrevoClient({ apiKey });
    }
    return null;
};

export const sendEmail = async ({ to, subject, html }) => {
    const brevoClientInstance = getBrevoClient();
    const senderEmail = process.env.EMAIL_FROM_ADDRESS || "placementportal.official@gmail.com";

    if (!brevoClientInstance) {
        console.log("---------------------------------------------------------");
        console.log("📩 --- DEV MODE EMAIL (Not Sent to Brevo) ---");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log("Content:");
        console.log(html);
        console.log("---------------------------------------------------------");
        return;
    }

    const recipients = (Array.isArray(to) ? to : [to]).map(email => ({ email }));

    try {
        await brevoClientInstance.transactionalEmails.sendTransacEmail({
            sender: { name: "Placement Portal", email: senderEmail },
            to: recipients,
            subject: subject,
            htmlContent: html
        });
        console.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
        const errorMessage = error.response?.body?.message || error.message || "An unknown error occurred";
        console.error("❌ Brevo email sending failed:", errorMessage);
        throw new Error(`Failed to send email via Brevo: ${errorMessage}`);
    }
};

export const isEmailConfigured = () => !!process.env.BREVO_API_KEY;
