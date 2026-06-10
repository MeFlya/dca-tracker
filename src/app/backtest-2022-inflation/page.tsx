import type { Metadata } from "next";
import { getBacktestStory } from "@/lib/backtest-stories";
import { BacktestStoryPage } from "@/components/backtest/BacktestStoryPage";

// Calculé au build sur le dataset statique — les chiffres (et la metadata)
// se rafraîchissent à chaque deploy, le dataset étant mis à jour chaque mois.
const story = getBacktestStory("backtest-2022-inflation");

export const metadata: Metadata = {
  title: story.def.metaTitle(story.result),
  description: story.def.metaDescription(story.result),
  alternates: { canonical: "/backtest-2022-inflation" },
  openGraph: {
    title: story.def.metaTitle(story.result),
    description: story.def.metaDescription(story.result),
    url: "/backtest-2022-inflation",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: story.def.metaTitle(story.result),
    description: story.def.metaDescription(story.result),
  },
};

export default function Page() {
  return <BacktestStoryPage story={story} />;
}
