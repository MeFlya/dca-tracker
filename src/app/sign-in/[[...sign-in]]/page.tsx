import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";
import { LogoMark } from "@/components/ui/LogoMark";

export const metadata: Metadata = {
  title: "Connexion — DCA Tracker",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="flex justify-center items-start py-16 px-4 bg-gradient-to-b from-slate-50 to-white min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-sm">
        {/* Branded header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-5" aria-label="DCA Tracker">
            <LogoMark size={28} />
            <span className="text-base font-bold tracking-tight text-gray-900">
              DCA<span className="font-normal text-gray-500 ml-1">Tracker</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Content de vous revoir</h1>
          <p className="text-sm text-gray-500">
            Connectez-vous pour retrouver votre stratégie et votre suivi.
          </p>
        </div>

        {/* Clerk form (themed via global appearance) */}
        <SignIn
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/account"
        />

        {/* Footer trust line */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Vos données ne sont jamais vendues · Hébergement en Europe
        </p>
      </div>
    </div>
  );
}
