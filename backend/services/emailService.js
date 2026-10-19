import { BrevoClient } from "@getbrevo/brevo";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const getBrevoClient = () => process.env.BREVO_API_KEY ? new BrevoClient({ apiKey: process.env.BREVO_API_KEY }) : null;

export const sendEmail = async ({ to, subject, html }) => {
    const client = getBrevoClient();
    const senderEmail = process.env.EMAIL_FROM_ADDRESS;
    if (!client) {
        if (process.env.NODE_ENV === "production") throw new Error("Brevo email delivery is not configured.");
        // Deliberately never log HTML: invitation and reset links contain bearer secrets.
        console.info(`[DEV EMAIL NOT SENT] subject=${String(subject).slice(0, 120)} recipientCount=${Array.isArray(to) ? to.length : 1}`);
        return { sent: false };
    }
    if (!senderEmail) throw new Error("EMAIL_FROM_ADDRESS must be configured when Brevo is enabled.");
    try {
        const recipients = (Array.isArray(to) ? to : [to]).map(email => ({ email }));
        await client.transactionalEmails.sendTransacEmail({
            sender: { name: "Placement Portal", email: senderEmail }, to: recipients,
            subject, htmlContent: html
        });
        return { sent: true };
    } catch (error) {
        const message = error.response?.body?.message || error.message || "Email delivery failed";
        console.error("Email delivery failed:", message);
        throw new Error(`Failed to send email: ${message}`);
    }
};

export const isEmailConfigured = () => Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM_ADDRESS);
