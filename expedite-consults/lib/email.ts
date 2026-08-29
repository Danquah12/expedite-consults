"use server";

import { EmailTemplate } from "@/components/email-template";
import { TContactFormValidator } from "./validators";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const send = async (formData: TContactFormValidator) => {
	// console.log(formData);
	try {
		const { error } = await resend.emails.send({
			from: `Expedite Consults Website <${process.env.RESEND_FORM_EMAIL}>`,
			to: ["sanity.expediteconsults@gmail.com"],
			subject: `${formData.subject} - ${formData.first_name} ${formData.last_name}`,
			replyTo: formData.email,
			react: await EmailTemplate({
				firstName: formData.first_name,
				lastName: formData.last_name,
				email: formData.email,
				message: formData.message,
			}),
		});

		if (error) {
			throw error;
		}
	} catch (e) {
		throw e;
	}
};
