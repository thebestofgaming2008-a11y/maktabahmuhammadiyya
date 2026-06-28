import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type AuthMode = "signIn" | "signUp" | "forgot" | "reset";

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, requestPasswordReset, resetPassword } = useAuth();

  useEffect(() => {
    if (!open) return;
    setMode("signIn");
    setError(null);
    setPassword("");
    setResetCode("");
    setNewPassword("");
  }, [open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Email is required.");
    if ((mode === "signIn" || mode === "signUp") && !password)
      return setError("Password is required.");
    if (mode === "reset" && (!resetCode.trim() || !newPassword))
      return setError("Reset code and new password are required.");

    setSubmitting(true);
    try {
      if (mode === "forgot") {
        const { error: resetError } = await requestPasswordReset(email);
        if (resetError) return setError(resetError.message);
        toast.success("Reset code sent");
        setMode("reset");
        return;
      }
      if (mode === "reset") {
        const { error: resetError } = await resetPassword(email, resetCode, newPassword);
        if (resetError) return setError(resetError.message);
        toast.success("Password reset");
        onOpenChange(false);
        return;
      }
      const result =
        mode === "signIn" ? await signIn(email, password) : await signUp(email, password, fullName);
      if (result.error) return setError(result.error.message);
      toast.success(mode === "signIn" ? "Signed in" : "Account created");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    mode === "signUp" ? "Create account" : mode === "signIn" ? "Sign in" : "Reset password";
  const description =
    mode === "forgot" || mode === "reset"
      ? "Use your email to receive a reset code."
      : "Sign in to save addresses, view orders, and manage the store if you are an admin.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-[440px] overflow-y-auto rounded-2xl border bg-white p-0 shadow-pop data-[state=open]:slide-in-from-bottom-3">
        <div className="p-5 sm:p-6">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="font-display text-lg">M</span>
            </div>
            <DialogTitle className="font-display text-2xl text-primary">{title}</DialogTitle>
            <DialogDescription className="leading-6">{description}</DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid grid-cols-2 rounded-lg border bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className={cn(
                "h-9 rounded-md text-sm font-medium transition",
                mode === "signIn" ? "bg-white shadow-sm" : "text-muted-foreground",
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signUp")}
              className={cn(
                "h-9 rounded-md text-sm font-medium transition",
                mode === "signUp" ? "bg-white shadow-sm" : "text-muted-foreground",
              )}
            >
              Create
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "signUp" && (
              <Field
                label="Full name"
                value={fullName}
                onChange={setFullName}
                autoComplete="name"
              />
            )}
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
            />
            {(mode === "signIn" || mode === "signUp") && (
              <Field
                label="Password"
                value={password}
                onChange={setPassword}
                type="password"
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              />
            )}
            {mode === "reset" && (
              <>
                <Field
                  label="Reset code"
                  value={resetCode}
                  onChange={setResetCode}
                  autoComplete="one-time-code"
                />
                <Field
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  type="password"
                  autoComplete="new-password"
                />
              </>
            )}

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting
                ? "Please wait..."
                : mode === "forgot"
                  ? "Send reset code"
                  : mode === "reset"
                    ? "Reset password"
                    : title}
            </button>
          </form>

          {(mode === "signIn" || mode === "forgot" || mode === "reset") && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(mode === "signIn" ? "forgot" : "signIn");
              }}
              className="mx-auto mt-4 block text-sm text-primary underline-offset-4 hover:underline"
            >
              {mode === "signIn" ? "Forgot your password?" : "Back to sign in"}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}
