import { createServerFn } from "@tanstack/react-start";

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((input: { email: string }) => ({
    email: String(input?.email ?? "").trim().toLowerCase(),
  }))
  .handler(async ({ data }) => {
    if (!data.email.includes("@")) throw new Error("Enter the email on the account");
    const { startPasswordReset } = await import("./password-reset.server");
    const token = await startPasswordReset(data.email);
    return { token };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .validator((input: { token: string; password: string }) => ({
    token: String(input?.token ?? ""),
    password: String(input?.password ?? ""),
  }))
  .handler(async ({ data }) => {
    if (data.password.length < 8) throw new Error("Use at least 8 characters");
    if (!data.token) throw new Error("Reset expired. Start again.");
    const { finishPasswordReset } = await import("./password-reset.server");
    const email = await finishPasswordReset(data.token, data.password);
    return { email };
  });

export const requestDeskPasswordReset = createServerFn({ method: "POST" })
  .validator((input: { email: string }) => ({
    email: String(input?.email ?? "").trim().toLowerCase(),
  }))
  .handler(async ({ data }) => {
    if (!data.email.includes("@")) throw new Error("Enter the operator email");
    const { startDeskPasswordReset } = await import("./password-reset.server");
    const token = await startDeskPasswordReset(data.email);
    return { token };
  });

export const resetDeskPassword = createServerFn({ method: "POST" })
  .validator((input: { token: string; password: string }) => ({
    token: String(input?.token ?? ""),
    password: String(input?.password ?? ""),
  }))
  .handler(async ({ data }) => {
    if (data.password.length < 8) throw new Error("Use at least 8 characters");
    if (!data.token) throw new Error("Reset expired. Start again.");
    const { finishDeskPasswordReset } = await import("./password-reset.server");
    return finishDeskPasswordReset(data.token, data.password);
  });
