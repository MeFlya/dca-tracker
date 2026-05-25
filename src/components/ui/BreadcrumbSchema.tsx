// JSON-LD BreadcrumbList — composant utilitaire.
//
// La plupart des pages du site ont un fil d'Ariane visible (<nav> en haut),
// mais aucune n'émet le schema BreadcrumbList associé. Sans ça, Google ne
// peut pas afficher le path en SERP (rich snippet breadcrumbs).
//
// Drop-in : à ajouter sur n'importe quelle page sous-navigationnelle, après
// le <nav> visible. Aucun rendu UI (juste un <script> JSON-LD via JsonLd).

import { JsonLd } from "@/components/ui/JsonLd";

interface BreadcrumbItem {
  /** Texte affiché dans le breadcrumb (ex: "Accueil", "Guides", "PEA ou CTO"). */
  name: string;
  /** Chemin relatif ou URL absolue. La dernière item peut omettre item
   *  (signal "page courante"). */
  url?: string;
}

const CANONICAL_ORIGIN = "https://dcatracker.fr";

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => {
      const entry: Record<string, unknown> = {
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
      };
      if (item.url) {
        entry.item = item.url.startsWith("http")
          ? item.url
          : `${CANONICAL_ORIGIN}${item.url}`;
      }
      return entry;
    }),
  };

  return <JsonLd data={data} />;
}
