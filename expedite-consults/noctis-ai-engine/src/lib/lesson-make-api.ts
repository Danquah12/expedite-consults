import { createServerFn } from "@tanstack/react-start";

export const makeLesson = createServerFn({ method: "POST" })
  .validator((input: { request?: unknown } | undefined) => ({
    request: typeof input?.request === "string" ? input.request.replace(/\s+/g, " ").trim().slice(0, 500) : "",
  }))
  .handler(async ({ data }) => {
    const { makeLesson: build } = await import("@/lib/lesson-make.server");
    return build(data.request);
  });
