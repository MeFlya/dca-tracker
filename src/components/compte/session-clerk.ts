// Les deux signaux qui décident de charger Clerk, partagés entre le
// navigateur (etat-compte.ts) et le script de préchargement du <head>
// (lib/clerk-prechargement.ts, lu côté serveur). Sans React ni Clerk.

/**
 * Une session Clerk existe : `__client_uat` (ou sa variante suffixée
 * `__client_uat_xxxxxxxx`, propre à la clé publiable) non nul. Clerk le pose
 * sur le domaine du site, il vaut l'horodatage de la connexion, « 0 » après
 * une déconnexion, et le middleware de Clerk le lit lui-même pour conclure
 * qu'une requête est déconnectée sans rien vérifier d'autre.
 */
export const COOKIE_SESSION_CLERK = /(?:^|;\s*)__client_uat(?:_[\w-]+)?=[1-9]/;

/** Pages qui affichent un formulaire Clerk à un visiteur non connecté. */
export const ROUTES_CLERK = /^\/(?:sign-in|sign-up)(?:\/|$)/;
