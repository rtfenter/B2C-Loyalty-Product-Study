import { products, earning } from "./fixtures";
export const targetedOffer = {
  title: "2× points on sports bras",
  multiplier: 2,
  start: "2026-09-01",
  end: "2026-09-30",
  scenarioDate: "2026-09-16",
  periodLabel: "September 1–30, 2026",
  expiryLabel: "September 30, 2026",
} as const;
export const offerAudience = {
  rewardsMember: true,
  marketingEligible: true,
  purchasedLeggings: true,
  purchasedSportsBra: false,
} as const;
export type OfferAudience = { [K in keyof typeof offerAudience]: boolean };
export function offerEligibility(audience: OfferAudience, date: string) {
  return [
    { label: "FORM Rewards member", passes: audience.rewardsMember },
    { label: "Marketing eligible", passes: audience.marketingEligible },
    {
      label: "Previously purchased leggings",
      passes: audience.purchasedLeggings,
    },
    {
      label: "Has not purchased a sports bra",
      passes: !audience.purchasedSportsBra,
    },
    {
      label: "Offer is active",
      passes: date >= targetedOffer.start && date <= targetedOffer.end,
    },
  ];
}
export const offerProduct = products[1];
export function previewOffer(price: number, qualifies: boolean) {
  const basePoints = Math.floor(price * earning.pointsPerDollar);
  const multiplier = qualifies ? targetedOffer.multiplier : 1;
  return {
    qualifyingMerchandise: qualifies ? price : 0,
    baseRate: earning.pointsPerDollar,
    basePoints,
    multiplier,
    promotionalPoints: basePoints * (multiplier - 1),
    totalPoints: basePoints * multiplier,
  };
}
export const mayaEligibility = offerEligibility(
  offerAudience,
  targetedOffer.scenarioDate,
);
export const mayaOfferPreview = previewOffer(
  offerProduct.price,
  mayaEligibility.every((rule) => rule.passes),
);
