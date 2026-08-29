"use client";

import React from "react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactFormValidator, TContactFormValidator } from "@/lib/validators";
import { send } from "@/lib/email";
import { toast } from "sonner";

const ContactForm = () => {
	const form = useForm<TContactFormValidator>({
		resolver: zodResolver(ContactFormValidator),
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			subject: "",
			message: "",
		},
	});

	const onSubmit: SubmitHandler<TContactFormValidator> = async (data) => {
		try {
			await send(data);
			form.reset();
			toast.success("Message sent successfully", {
				description: "A member of our team will get back to you soon.",
				duration: 4000,
			});
		} catch (error) {
			toast.error("Error submitting form");
		}
	};
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="w-full lg:w-[700px] flex flex-col gap-7 mx-auto lg:mx-0"
			>
				<div className="flex flex-col lg:flex-row gap-7">
					<FormField
						control={form.control}
						name="first_name"
						render={({ field }) => (
							<FormItem className="flex-1">
								<FormLabel className="text-white">First Name</FormLabel>
								<FormControl>
									<Input
										placeholder="eg. John"
										{...field}
										className={cn(
											"w-full h-[50px] placeholder:text-gray-400 placeholder:text-xs bg-primary/10 backdrop-blur-2xl text-white rounded-none border-primary focus-visible:ring-primary",
											{
												"focus-visible:ring-red-500":
													form.formState.errors.first_name,
											}
										)}
									/>
								</FormControl>
								<FormMessage className="text-[0.7rem]" />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="last_name"
						render={({ field }) => (
							<FormItem className="flex-1">
								<FormLabel className="text-white">Last Name</FormLabel>
								<FormControl>
									<Input
										placeholder="eg. Doe"
										{...field}
										className={cn(
											"w-full h-[50px] placeholder:text-gray-400 placeholder:text-xs bg-primary/10 backdrop-blur-2xl text-white rounded-none border-primary focus-visible:ring-primary",
											{
												"focus-visible:ring-red-500":
													form.formState.errors.last_name,
											}
										)}
									/>
								</FormControl>
								<FormMessage className="text-[0.7rem]" />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="flex-1">
							<FormLabel className="text-white">Email</FormLabel>
							<FormControl>
								<Input
									placeholder="eg. company@example.com"
									{...field}
									className="w-full h-[50px] placeholder:text-gray-400 placeholder:text-xs bg-primary/10 backdrop-blur-2xl text-white rounded-none border-primary focus-visible:ring-primary"
								/>
							</FormControl>
							<FormMessage className="text-[0.7rem]" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="subject"
					render={({ field }) => (
						<FormItem className="flex-1">
							<FormLabel className="text-white">
								Title of your message
							</FormLabel>
							<FormControl>
								<Input
									placeholder="Subject"
									{...field}
									className={cn(
										"w-full h-[50px] placeholder:text-gray-400 placeholder:text-xs bg-primary/10 backdrop-blur-2xl text-white rounded-none border-primary focus-visible:ring-primary",
										{
											"focus-visible:ring-red-500":
												form.formState.errors.subject,
										}
									)}
								/>
							</FormControl>
							<FormMessage className="text-[0.7rem]" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="message"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-white">How can we help you?</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Your Message"
									{...field}
									className={cn(
										"min-h-[120px] placeholder:text-gray-400 placeholder:text-xs bg-primary/10 backdrop-blur-2xl text-white rounded-none border-primary focus-visible:ring-primary",
										{
											"focus-visible:ring-red-500":
												form.formState.errors.message,
										}
									)}
								/>
							</FormControl>
							<FormMessage className="text-[0.7rem]" />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					disabled={form.formState.isSubmitting}
					className="py-7 mt-5 rounded-none cursor-pointer disabled:cursor-default disabled:opacity-50"
				>
					{form.formState.isSubmitting ? (
						<div className="loader"></div>
					) : (
						"Send Message"
					)}
				</Button>
			</form>
		</Form>
	);
};

export default ContactForm;
