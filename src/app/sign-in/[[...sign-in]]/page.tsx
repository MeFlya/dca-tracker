import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — DCA Tracker",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-16 px-4">
      <SignIn />
    </div>
  );
}
