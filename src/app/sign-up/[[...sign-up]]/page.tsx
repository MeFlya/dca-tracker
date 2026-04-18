import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte — DCA Tracker",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-16 px-4">
      <SignUp />
    </div>
  );
}
