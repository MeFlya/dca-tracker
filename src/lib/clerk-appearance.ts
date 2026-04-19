// Shared Clerk appearance config.
// Applied globally via <ClerkProvider> so every Clerk primitive
// (SignIn, SignUp, UserButton) matches the product design system.

// Appearance type is inferred from ClerkProvider's prop — no need to import explicitly.
// Using a structural type keeps the file runtime-only (no @clerk/types dep needed).

export const clerkAppearance = {
  variables: {
    colorPrimary: "#2563eb", // primary-600
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    colorNeutral: "#1e293b",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    spacingUnit: "1rem",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-none border border-gray-100 rounded-2xl bg-white",
    headerTitle: "text-xl font-bold text-gray-900 tracking-tight",
    headerSubtitle: "text-sm text-gray-500",
    formButtonPrimary:
      "bg-primary-600 hover:bg-primary-700 text-sm font-semibold normal-case rounded-xl shadow-none transition-colors",
    formFieldInput:
      "border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm",
    formFieldLabel: "text-sm font-medium text-gray-700",
    socialButtonsBlockButton:
      "border border-gray-200 rounded-xl normal-case hover:bg-gray-50 transition-colors",
    socialButtonsBlockButtonText: "text-sm font-medium",
    dividerLine: "bg-gray-100",
    dividerText: "text-xs text-gray-400 font-medium",
    footerAction: "text-sm",
    footerActionLink:
      "text-primary-600 hover:text-primary-700 font-semibold underline-offset-2",
    identityPreviewText: "text-sm",
    identityPreviewEditButton: "text-primary-600",
    // Hide Clerk's "Secured by" branding (requires Clerk Pro plan for full removal;
    // this at minimum removes it from our custom DOM on Hobby).
    footer: "hidden",
    // UserButton dropdown
    userButtonPopoverCard:
      "shadow-xl border border-gray-100 rounded-2xl overflow-hidden",
    userButtonPopoverActionButton:
      "text-sm font-medium text-gray-700 hover:bg-gray-50",
    userButtonPopoverFooter: "hidden",
    userButtonAvatarBox: "w-8 h-8",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
    showOptionalFields: false,
    termsPageUrl: "https://dcatracker.fr/tarifs",
    privacyPageUrl: "https://dcatracker.fr/methodologie",
  },
} as const;
