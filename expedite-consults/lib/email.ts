"use server";

import { EmailTemplate } from "@/components/email-template";
import { TContactFormValidator } from "./validators";
import { Resend } from "resend";

const resend = new Resend((process.env.RESEND_API_KEY || "").trim());

export const send = async (formData: TContactFormValidator) => {
	try {
		const envWebFrom = (process.env.RESEND_FORM_EMAIL || "").trim();
		const fromAddress = (envWebFrom && !envWebFrom.includes("resend.dev"))
			? (envWebFrom.includes("<") ? envWebFrom : `Expedite Consults Website <${envWebFrom}>`)
			: "Expedite Consults Website <auth@expediteconsults.com>";

		const { error } = await resend.emails.send({
			from: fromAddress,
			to: ["kasiedu@expedite-consults.com"],
			subject: `${formData.subject} - ${formData.first_name} ${formData.last_name}`,
			replyTo: formData.email,
			html: `
				<div style="font-family: sans-serif; line-height: 1.6; color: #111827;">
					<h2 style="color: #0e7490;">New Contact Us Submission</h2>
					<p><strong>Name:</strong> ${formData.first_name} ${formData.last_name}</p>
					<p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
					<p><strong>Subject:</strong> ${formData.subject}</p>
					<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
					<p><strong>Message:</strong></p>
					<p style="white-space: pre-wrap;">${formData.message}</p>
				</div>
			`,
		});

		if (error) {
			console.error("Resend error:", error);
			throw new Error(error.message);
		}
	} catch (e) {
		console.error("Failed to send contact email:", e);
		throw e;
	}
};
