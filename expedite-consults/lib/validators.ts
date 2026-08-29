import { z } from "zod";

export const ContactFormValidator = z.object({
	first_name: z
		.string()
		.nonempty({
			message: "This field is required",
		})
		.min(2, { message: "Name must be 2 or more characters long" })
		.max(255),
	last_name: z
		.string()
		.nonempty({
			message: "This field is required",
		})
		.min(2, { message: "Name must be 2 or more characters long" })
		.max(255),
	email: z
		.string()
		.nonempty({
			message: "This field is required",
		})
		.email({ message: "Invalid email address" }),
	subject: z
		.string({
			required_error: "This field is required",
		})
		.min(2, { message: "Must be 5 or more characters long" })
		.optional()
		.or(z.literal("")),

	message: z
		.string()

		.nonempty({
			message: "This field is required",
		})
		.min(2, { message: "Must be 5 or more characters long" }),
});

export type TContactFormValidator = z.infer<typeof ContactFormValidator>;
