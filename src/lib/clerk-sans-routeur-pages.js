// Remplace, dans le JavaScript du navigateur seulement, le <ClerkProvider>
// « Pages Router » de @clerk/nextjs (branché dans next.config.ts).
//
// compte/ClerkActif.tsx importe ClerkProvider depuis un composant client :
// @clerk/nextjs y choisit à l'exécution entre son provider App Router et son
// provider Pages Router, et le second importe next/router, soit tout le
// routeur Pages de Next dans le morceau Clerk. Ce site n'a que l'App Router :
// ce provider n'est jamais choisi. En plain JS, sans syntaxe TypeScript : le
// fichier est compilé avec les réglages du module qu'il remplace.
export function ClerkProvider() {
  throw new Error(
    "@clerk/nextjs : provider Pages Router retiré du bundle (next.config.ts), ce site n'utilise que l'App Router.",
  );
}
