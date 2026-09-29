import { frFR } from "@clerk/localizations";

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
    dividerText: "text-xs text-gray-500 font-medium",
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
    // Pointaient vers /tarifs et /methodologie jusqu'au 29/09/2026 : les liens
    // « Conditions » et « Confidentialité » des formulaires menaient ailleurs
    // que vers les textes juridiques.
    termsPageUrl: "https://dcatracker.fr/cgv",
    privacyPageUrl: "https://dcatracker.fr/confidentialite",
  },
} as const;

// Textes des formulaires Clerk en français.
//
// Jusqu'au 29/09/2026, aucune localisation n'était passée à <ClerkProvider> :
// l'inscription, la connexion et le menu du compte s'affichaient en anglais
// (« Create your account », « Email address », « Continue ») sous un titre de
// page en français. frFR est la traduction officielle de Clerk ; seuls les
// titres des premiers écrans sont remplacés, parce que frFR y répète mot pour
// mot le titre de nos pages (« Créez votre compte ») et y ajoute « pour
// continuer vers DCA Tracker ».
export const clerkLocalization = {
  ...frFR,
  // Clés absentes de frFR 4.13.8 sur les écrans que nos visiteurs voient
  // (inscription, connexion, erreurs) : Clerk les affichait en anglais,
  // « Create a password » dans le champ mot de passe par exemple.
  formFieldInputPlaceholder__signUpPassword: "Mot de passe",
  formFieldInput__emailAddress_format: "Format attendu : nom@exemple.fr",
  badge__banned: "Suspendu",
  signUp: {
    ...frFR.signUp,
    start: {
      ...frFR.signUp?.start,
      title: "Inscription",
      titleCombined: "Inscription",
      // Vide : « Inscription gratuite » figure déjà sous le formulaire.
      subtitle: "",
      subtitleCombined: "",
    },
    protectCheck: {
      title: "Vérification en cours",
      subtitle: "Merci de patienter pendant que nous vérifions votre demande.",
      loading: "Chargement…",
      retryButton: "Réessayer",
    },
  },
  signIn: {
    ...frFR.signIn,
    start: {
      ...frFR.signIn?.start,
      title: "Connexion",
      titleCombined: "Connexion",
      // Vide : la page dit déjà « Connectez-vous pour retrouver votre
      // stratégie et votre suivi » juste au-dessus.
      subtitle: "",
      subtitleCombined: "",
    },
    passwordCompromised: {
      ...frFR.signIn?.passwordCompromised,
      title: "Mot de passe compromis",
    },
    passwordUntrusted: {
      ...frFR.signIn?.passwordUntrusted,
      title: "Mot de passe non fiable",
    },
    protectCheck: {
      title: "Vérification en cours",
      subtitle: "Merci de patienter pendant que nous vérifions votre demande.",
      loading: "Chargement…",
      retryButton: "Réessayer",
    },
  },
  unstable__errors: {
    ...frFR.unstable__errors,
    action_blocked:
      "Cette action n'a pas pu aboutir. Réessayez plus tard, ou écrivez à hello@dcatracker.fr si le problème persiste.",
    form_new_password_matches_current:
      "Le nouveau mot de passe doit être différent de l'actuel.",
    form_password_untrusted__sign_in:
      "Votre mot de passe a peut-être été compromis. Pour protéger votre compte, connectez-vous par une autre méthode : il vous sera demandé de le réinitialiser ensuite.",
    oauth_access_denied: "Vous n'avez pas autorisé l'accès à votre compte.",
    protect_check_execution_failed: "La vérification n'a pas abouti. Réessayez.",
    protect_check_invalid_script:
      "La vérification n'a pas pu se charger. Écrivez à hello@dcatracker.fr si le problème persiste.",
    protect_check_invalid_sdk_url:
      "La vérification n'a pas pu démarrer. Écrivez à hello@dcatracker.fr.",
    protect_check_script_load_failed:
      "La vérification n'a pas pu se charger, peut-être à cause du réseau ou d'un bloqueur. Réessayez, ou écrivez à hello@dcatracker.fr.",
    protect_check_timed_out: "La vérification a pris trop de temps. Réessayez.",
    protect_check_unsupported_environment:
      "La vérification ne fonctionne pas dans ce navigateur. Utilisez un navigateur standard, ou écrivez à hello@dcatracker.fr.",
  },
};
