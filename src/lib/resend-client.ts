import { Resend } from "resend";

/**
 * Valeur factice posée quand RESEND_API_KEY est absent.
 *
 * Le constructeur de Resend REFUSE une clé vide, et il s'exécute à l'import :
 * sans ce repli, le build échouerait à la collecte des routes sur une machine
 * qui n'a pas le secret. Le repli est donc nécessaire ici.
 *
 * ⚠️ Mais une clé factice ne fait pas échouer l'envoi — elle produit un 401
 * que le SDK renvoie au lieu de le lancer. C'est exactement le motif qui a
 * rendu le fichier payant indéchiffrable pendant dix-huit jours : une valeur
 * de remplacement qui traverse tous les contrôles. On l'exporte donc, pour
 * que le point d'envoi puisse la reconnaître et refuser d'envoyer.
 */
export const CLE_FACTICE = "re_placeholder";

export const cleResendManquante = !process.env.RESEND_API_KEY;

export const resend = new Resend(process.env.RESEND_API_KEY ?? CLE_FACTICE);
