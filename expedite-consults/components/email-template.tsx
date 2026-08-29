import * as React from "react";

interface EmailTemplateProps {
	firstName: string;
	lastName: string;
	email: string;
	message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
	firstName,
	lastName,
	email,
	message,
}) => (
	<div>
		<p>
			<b>Name:</b> {firstName} {lastName}
		</p>
		<p>
			<b>Email:</b> {email}
		</p>
		<br />
		<p>
			<b>Message:</b>
		</p>
		<p>{message}</p>
	</div>
);
