import { useEffect, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, clearSignedOut, signIn, signedOutOnPurpose } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { NoctisLockup } from "@/components/brand/NoctisMark";
import { LanguageMenu } from "@/components/layout/LanguageMenu";
import { vt } from "@/lib/locale";
import { requestPasswordReset, resetPassword } from "@/lib/auth/password-reset";
import { registerClinicMember, rememberSignedInAccount, touchPresence } from "@/lib/command-api";
import { noteFailedSignIn } from "@/lib/login-place-api";
import { askedShare, hereAfterSignIn } from "@/lib/share";
import { armClinicPlay } from "@/lib/playback";
import { stopJazzBed } from "@/lib/jazz-bed";

/** The clinic stays closed until a real session exists. Sign-out never drops into the feed. */
export function ClinicGate({ children, sessionId }: { children: ReactNode; sessionId?: string | null }) {
  const { user, isPending } = useCurrentUserState();
  const held = useSyncExternalStore(subscribeOut, signedOutOnPurpose, () => false);
  if (!authEnabled) return <>{children}</>;
  if (held) return <SignedOutScreen />;
  if (isPending) return sessionId ? <>{children}</> : <SignedOutScreen />;
  if (!user) return <SignedOutScreen />;
  return (
    <>
      <PresenceBeat />
      {children}
    </>
  );
}

function PresenceBeat() {
  useEffect(() => {
    const ping = () => void touchPresence().catch(() => undefined);
    ping();
    const timer = window.setInterval(ping, 30000);
    return () => window.clearInterval(timer);
  }, []);
  return null;
}

function subscribeOut(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

type LoginScene = { src: string; alt: string; film?: boolean };

const LOGIN_SCENES: LoginScene[] = [
  { src: "/brand/login-1.jpg", alt: "Friends leaning in together over a lesson." },
  { src: "/media/hall/physician.mp4", alt: "A clinic lesson playing.", film: true },
  { src: "/brand/login-2.jpg", alt: "A lecture shared on the courtyard steps." },
  { src: "/media/hall/developer.mp4", alt: "A coding lesson playing.", film: true },
  { src: "/brand/login-3.jpg", alt: "A father and daughter finding a galaxy together." },
  { src: "/brand/login-4.jpg", alt: "A choir learning a hymn in warm light." },
  { src: "/media/hall/realtor.mp4", alt: "A practical lesson playing.", film: true },
  { src: "/brand/login-5.jpg", alt: "A trade taught at the workbench." },
  { src: "/brand/login-6.jpg", alt: "Students in a library when an idea clicks." },
  { src: "/brand/login-7.jpg", alt: "Two friends watching the sky from a rooftop." },
];

function LoginStage() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const wait = LOGIN_SCENES[i]?.film ? 9000 : 5600;
    const t = window.setTimeout(() => setI((n) => (n + 1) % LOGIN_SCENES.length), wait);
    return () => window.clearTimeout(t);
  }, [i]);
  useEffect(() => {
    document.querySelectorAll<HTMLVideoElement>("[data-login-film]").forEach((el) => {
      const on = el.dataset.loginFilm === String(i);
      if (on) void el.play().catch(() => undefined);
      else {
        el.pause();
        el.currentTime = 0;
      }
    });
  }, [i]);
  return (
    <div className="w-full">
      <div className="relative mx-auto aspect-square w-full max-w-[22rem] overflow-hidden rounded-2xl bg-[#e7e0d4]">
        {LOGIN_SCENES.map((scene, n) =>
          scene.film ? (
            <video
              key={scene.src}
              data-login-film={n}
              src={scene.src}
              muted
              playsInline
              loop
              preload={n === i ? "auto" : "metadata"}
              aria-label={n === i ? scene.alt : undefined}
              className="absolute inset-0 size-full object-cover object-[center_18%] transition-opacity duration-700"
              style={{ opacity: n === i ? 1 : 0 }}
            />
          ) : (
            <img
              key={scene.src}
              src={scene.src}
              alt={n === i ? scene.alt : ""}
              className="absolute inset-0 size-full object-cover object-[center_18%] transition-opacity duration-700"
              style={{ opacity: n === i ? 1 : 0 }}
            />
          ),
        )}
      </div>
      <div className="mt-3 flex shrink-0 items-center justify-center gap-1.5">
        {LOGIN_SCENES.map((scene, n) => (
          <button
            key={scene.src}
            type="button"
            aria-label={`Show scene ${n + 1}`}
            onClick={() => setI(n)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: n === i ? 22 : 8,
              background: n === i ? "#8a6428" : "#d9d0c3",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function withTimeout<T>(work: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    work.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function SignedOutScreen({ quiet = false }: { quiet?: boolean }) {
  const [mode, setMode] = useState<"in" | "up" | "forgot" | "reset">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [social, setSocial] = useState(false);
  useEffect(() => {
    askedShare();
    const host = window.location.hostname;
    setSocial(host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com"));
  }, []);

  async function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const typedName = String(data.get("name") || name).trim();
    const typedEmail = String(data.get("email") || email).trim().toLowerCase();
    const typedPassword = String(data.get("password") || password);
    const typedAgain = String(data.get("again") || again);
    setName(typedName);
    setEmail(typedEmail);
    setPassword(typedPassword);
    setAgain(typedAgain);
    setBusy(true);
    setErr(null);
    try {
      if (!typedEmail.includes("@")) throw new Error("Enter the email address, then press Sign in.");
      const minLen = mode === "in" ? 4 : 6;
      if (mode !== "forgot" && typedPassword.length < minLen) {
        throw new Error(`The password needs at least ${minLen} characters.`);
      }
      if (mode === "forgot") {
        const { token } = await requestPasswordReset({ data: { email: typedEmail } });
        setResetToken(token);
        setPassword("");
        setAgain("");
        setMode("reset");
        setBusy(false);
        return;
      }
      if (mode === "reset") {
        if (typedPassword !== typedAgain) throw new Error("Those passwords do not match");
        if (!resetToken) throw new Error("Reset expired. Start again.");
        const { email: saved } = await resetPassword({ data: { token: resetToken, password: typedPassword } });
        const res = await authClient.signIn.email({ email: saved, password: typedPassword });
        if (res.error) throw new Error(res.error.message);
        armClinicPlay();
        stopJazzBed();
        clearSignedOut();
        window.location.assign(hereAfterSignIn());
        return;
      }
      if (mode === "up" && typedName.trim().length < 2) {
        throw new Error("Enter your name.");
      }
      const wanted = typedEmail;
      let saved: { email: string; name?: string; created?: boolean } = { email: wanted, name: typedName, created: false };
      try {
        saved = await withTimeout(
          registerClinicMember({
            data: { email: wanted, password: typedPassword, name: typedName, allowExisting: mode !== "up" },
          }),
          12000,
          "Sign-in is taking too long. Press Sign in again.",
        );
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "";
        if (!(mode === "up" && /already registered/i.test(message))) throw caught;
      }
      const res = await withTimeout(
        authClient.signIn.email({ email: wanted, password: typedPassword }),
        12000,
        "Sign-in did not answer. Press Sign in again.",
      );
      if (res.error) {
        throw new Error(
          saved.created
            ? `${saved.email} is in the member list. Sign-in said: ${res.error.message}`
            : res.error.message || "Could not sign in",
        );
      }
      const who = await rememberSignedInAccount({ data: { name: mode === "up" ? typedName : "" } }).catch(() => null);
      const signedInEmail = (who?.email || res.data?.user?.email || wanted).trim().toLowerCase();
      if (!signedInEmail || signedInEmail !== wanted) {
        throw new Error("That sign-in did not stick to this email. Press Sign in again.");
      }
      armClinicPlay();
      stopJazzBed();
      clearSignedOut();
      window.location.assign(hereAfterSignIn());
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not continue";
      const missing = mode === "in" && /invalid email or password/i.test(message);
      const friendly = missing
        ? "That password does not match this email. Try again, or create an account."
        : /invalid origin/i.test(message)
          ? "This address is not allowed to sign in yet. Refresh the page and try again."
          : message;
      if ((mode === "in" || mode === "reset" || mode === "up") && typedEmail) {
        void noteFailedSignIn({ data: { email: typedEmail, door: "clinic", reason: friendly } }).catch(() => undefined);
      }
      setErr(friendly);
      setBusy(false);
    }
  }

  function onProvider(providerId: string) {
    if (!social) return;
    setErr(null);
    setBusy(true);
    clearSignedOut();
    armClinicPlay();
    stopJazzBed();
    void signIn(providerId, { callbackURL: hereAfterSignIn() })
      .catch((caught: unknown) => {
        const reason = caught instanceof Error ? caught.message : "Sign-in did not open";
        void noteFailedSignIn({ data: { email: email || "(sso)", door: "clinic", reason } }).catch(() => undefined);
        setErr("Google and X did not open. Type your email and password, then press Sign in.");
        setBusy(false);
      });
  }

  const title = mode === "up" ? "Create an account" : mode === "forgot" || mode === "reset" ? "New password" : "Signed out";
  const note =
    mode === "forgot"
      ? "Enter the email on your Noctis account. You can choose a new password next."
      : mode === "reset"
        ? "Choose a new password. This only changes your Noctis account."
        : "The academy stays closed until you sign in.";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f6f3ec] text-[#12151c] md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(20rem,26rem)]">
      <section className="hidden min-h-0 flex-col justify-center gap-4 overflow-hidden px-12 md:flex">
        <div className="shrink-0">
          <NoctisLockup kicker="Learn · Connect · Grow" markClass="size-12" />
        </div>
        <LoginStage />
        <div className="max-w-md">
          <h2 className="font-display text-3xl font-semibold leading-[0.95] tracking-tight sm:text-4xl">
            {vt("Learn the things")}
            <br />
            <span className="text-[#8a6428]">{vt("that grow you.")}</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#5c564c]">
            Study, research, music, and the people who teach them. The academy opens after you sign in.
          </p>
        </div>
      </section>
      <section className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-4 py-4 md:px-6">
        <div className="mb-4 md:hidden">
          <NoctisLockup kicker="Learn · Connect · Grow" markClass="size-10" />
        </div>
        <div className="mx-auto w-full max-w-sm">
        <div className="w-full rounded-3xl bg-white px-5 py-5 shadow-[0_12px_40px_rgba(18,21,28,0.08)]">
          <LanguageMenu tone="cream" />
          <h1 className="mt-4 font-sans text-2xl font-semibold tracking-tight">{mode === "in" ? vt("Log into Noctis") : vt(title)}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#5c564c]">{vt(note)}</p>
          {quiet ? <p className="mt-2 text-xs text-[#7a7368]">Checking the last session… you can still sign in.</p> : null}
          {err ? (
            <p role="alert" className="mt-4 rounded-xl bg-[#fde8e6] px-3 py-3 text-sm font-medium leading-snug text-[#8f1d14]">
              {vt(err)}
            </p>
          ) : null}
          <div className="mt-6 space-y-3">
              <form onSubmit={onEmail} noValidate className="space-y-2">
                {mode === "up" ? (
                  <input
                    name="name"
                    className="min-h-11 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 text-sm"
                    placeholder="First and last name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                ) : null}
                {mode !== "reset" ? (
                  <input
                    name="email"
                    className="min-h-11 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 text-sm"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                ) : null}
                {mode !== "forgot" ? (
                  <input
                    name="password"
                    className="min-h-11 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 text-sm"
                    placeholder={mode === "reset" ? "New password" : "Password"}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "in" ? "current-password" : "new-password"}
                  />
                ) : null}
                {mode === "reset" ? (
                  <input
                    name="again"
                    className="min-h-11 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 text-sm"
                    placeholder="Repeat new password"
                    type="password"
                    value={again}
                    onChange={(e) => setAgain(e.target.value)}
                    autoComplete="new-password"
                  />
                ) : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#0b1220] text-sm font-semibold text-[#f6e7c8] disabled:opacity-60"
                >
                  {busy
                    ? "Working…"
                    : mode === "up"
                      ? "Register and sign in"
                      : mode === "forgot"
                        ? "Continue"
                        : mode === "reset"
                          ? "Save password and sign in"
                          : "Sign in"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setMode((m) => (m === "up" ? "in" : m === "in" ? "up" : "in"));
                  setErr(null);
                  setResetToken(null);
                }}
                className="w-full text-center text-xs font-semibold text-[#8a6428] underline-offset-4 hover:underline"
              >
                {mode === "up" ? "Already registered? Sign in" : mode === "in" ? "New here? Create an account" : "Back to sign in"}
              </button>
              {social && (mode === "in" || mode === "up") ? (
                <div className="space-y-2 border-t border-[#e4ddd2] pt-3">
                  {GROK_PROVIDERS.map((p) => (
                    <button
                      key={p.providerId}
                      type="button"
                      disabled={busy}
                      onClick={() => onProvider(p.providerId)}
                      className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#e4ddd2] bg-[#faf8f4] text-sm font-semibold disabled:opacity-60"
                    >
                      {vt("Continue with")} {p.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
        </div>
        {mode === "in" ? (
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setErr(null);
            }}
            className="mt-3 w-full text-center text-sm font-semibold text-[#8a6428] underline-offset-4 hover:underline"
          >
            {vt("Forgot password?")}
          </button>
        ) : null}
        </div>
      </section>
    </div>
  );
}
