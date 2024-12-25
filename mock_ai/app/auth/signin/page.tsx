import { signInWithGoogle } from "../actions";

import { LoginCard } from "@/components/login-form";

export default function SignInForm() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginCard onGoogleSignIn={signInWithGoogle} />
    </div>
  );
}
