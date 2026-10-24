import { createServerFn } from "@tanstack/react-start";

/** Turn a finished Google/X sign-in into a Desk hold. Does not end the Noctis session. */
export const adoptDeskSso = createServerFn({ method: "POST" })
  .validator((input: { bearerToken?: string }) => ({
    bearerToken: typeof input?.bearerToken === "string" && input.bearerToken ? input.bearerToken : undefined,
  }))
  .handler(async ({ data }) => {
    const { getSessionUser } = await import("./verify.server");
    const { mintDeskHold } = await import("./desk-session.server");
    const user = await getSessionUser(data.bearerToken);
    if (!user) throw new Error("SSO did not return an account");
    const token = await mintDeskHold(user.id);
    return { token };
  });
