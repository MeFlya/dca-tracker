import type { Metadata } from "next";
import { CommunityPage } from "@/components/communaute/CommunityPage";

const TITLE = "Communauté DCA Tracker — chiffres agrégés et anonymes";
const DESCRIPTION =
  "Découvrez comment la communauté DCA Tracker investit : montants mensuels typiques, durées d'investissement, séries de suivi. Données agrégées, jamais personnelles.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/communaute" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/communaute",
    type: "website",
  },
};

export default function CommunautePage() {
  return <CommunityPage />;
}
