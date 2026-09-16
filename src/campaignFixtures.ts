export const goals = [
  "Acquire",
  "Activate",
  "Increase frequency",
  "Introduce category",
  "Reactivate",
] as const;
export const goalNotes: Record<string, string> = {
  Acquire:
    "Acquisition may require a prospect population. This study starts with existing Rewards members, so it cannot evaluate new-member acquisition.",
  Activate:
    "FORM defines activation as a first qualifying purchase after enrollment. This is a program-specific definition, not a universal rule.",
  "Increase frequency":
    "Decide what repeat behavior matters and over what window. Look beyond purchases brought forward by an incentive.",
  "Introduce category":
    "Featured scenario: introduce sports bras to recent legging shoppers who have never purchased the category.",
  Reactivate:
    "Define a lapsed-member window and a meaningful return action. The featured audience is not a lapsed-member cohort.",
};
export const criteria = [
  {
    id: "leggings",
    label: "Purchased leggings in last 90 days",
    explanation:
      "Recent category behavior suggests a relevant cross-category introduction.",
  },
  {
    id: "noBra",
    label: "Has never purchased a sports bra",
    explanation:
      "Exclude members already shopping the category this offer introduces.",
  },
  {
    id: "member",
    label: "Rewards member",
    explanation:
      "Already true for everyone in this starting population; this filter does not reduce it.",
  },
  {
    id: "marketing",
    label: "Marketing eligible",
    explanation:
      "Only include members eligible to receive promotional communications.",
  },
  {
    id: "repeat",
    label: "Purchased more than once",
    explanation:
      "Optional exploration: narrow to members with repeat purchase behavior.",
  },
] as const;
export type Criterion = (typeof criteria)[number]["id"];
export const featuredCriteria: Criterion[] = [
  "leggings",
  "noBra",
  "member",
  "marketing",
];
// Synthetic membership flags only. Nested ranges anchor the supplied funnel exactly;
// modular flags define consistent intersections when filters are removed or combined.
export const population = Array.from({ length: 24830 }, (_, i) => ({
  leggings: i < 8412,
  noBra: i < 8412 ? i < 6731 : i % 5 < 2,
  member: true,
  marketing: i < 6731 ? i < 6204 : i % 10 < 9,
  repeat: i % 3 === 0,
}));
export function buildFunnel(selected: Criterion[]) {
  let members = population;
  return [
    { label: "All Rewards members", count: members.length },
    ...criteria
      .filter((c) => selected.includes(c.id))
      .map((c) => {
        members = members.filter((member) => member[c.id]);
        return { label: c.label, count: members.length };
      }),
  ];
}
export type Offer = {
  type: "multiplier" | "bonus";
  value: number;
  category: string;
  eligibility: string;
  start: string;
  end: string;
  limit: string;
};
export const defaultOffers: Record<"A" | "B", Offer> = {
  A: {
    type: "multiplier",
    value: 2,
    category: "Sports bras",
    eligibility: "Selected eligible audience",
    start: "2026-10-01",
    end: "2026-10-28",
    limit: "One qualifying purchase per member",
  },
  B: {
    type: "bonus",
    value: 250,
    category: "Sports bras",
    eligibility: "Selected eligible audience",
    start: "2026-10-01",
    end: "2026-10-28",
    limit: "One qualifying purchase per member",
  },
};
export function offerLabel(offer: Offer) {
  if (!Number.isInteger(offer.value) || offer.value < (offer.type === "multiplier" ? 2 : 1) || offer.value > (offer.type === "multiplier" ? 10 : 1000))
    return "Choose a valid incentive to preview this offer.";
  return offer.type === "multiplier"
    ? `${offer.value}× points on all ${offer.category.toLowerCase()}.`
    : `${offer.value} bonus points after a qualifying ${offer.category === "Sports bras" ? "sports-bra" : "legging"} purchase.`;
}
// Independent from editable builder defaults and state.
export const exampleTreatments = [
  { name: "Example Control", offer: "No promotional incentive" },
  { name: "Example Treatment A", offer: "2× points on sports bras" },
  {
    name: "Example Treatment B",
    offer: "250 bonus points after a qualifying sports-bra purchase",
  },
] as const;

export const metrics = [
  {
    name: "Purchase rate",
    dimension: "Immediate participation",
    values: [12.4, 18.7, 17.1],
    unit: "%",
  },
  {
    name: "Category conversion",
    dimension: "New category behavior",
    values: [3.1, 8.9, 7.6],
    unit: "%",
  },
  {
    name: "Avg. order value",
    dimension: "Basket value",
    values: [68, 72, 71],
    unit: "$",
  },
  {
    name: "Reward cost/member",
    dimension: "Incentive investment",
    values: [0, 1.84, 2.5],
    unit: "$",
  },
  {
    name: "28-day repeat rate",
    dimension: "Return behavior",
    values: [9.2, 14.6, 13.1],
    unit: "%",
  },
] as const;
export const decisions = [
  {
    title: "Roll out Treatment A",
    text: "Within this simulation, A shows stronger category conversion and repeat behavior at a lower reward cost than B. A measured rollout could test whether that behavior persists after the incentive ends. These fictional results alone do not establish causal impact.",
  },
  {
    title: "Test Treatment B with a different incentive",
    text: "B creates a clear, tangible points promise but costs more per member in this fictional experiment. A smaller bonus or a different qualifying threshold could test whether the offer remains motivating at a lower cost.",
  },
  {
    title: "Extend the experiment",
    text: "More observation could help distinguish short-term participation from sustained category behavior. Define the follow-up window and decision criteria first; longer duration also means additional cost and delayed decisions.",
  },
  {
    title: "Stop the promotion",
    text: "Stopping limits incentive spend and may be reasonable if the behavior does not justify the cost. It also gives up a potential category-growth opportunity. Examine margin, organic purchasing, and post-offer behavior before deciding.",
  },
] as const;
export function allocateMembers(total: number, percentages: number[]) {
  const exact = percentages.map((p) => (total * p) / 100);
  const counts = exact.map(Math.floor);
  const order = exact
    .map((n, i) => ({ i, fraction: n - counts[i] }))
    .sort((a, b) => b.fraction - a.fraction || a.i - b.i);
  const remainder = total - counts.reduce((a, b) => a + b, 0);
  for (let n = 0; n < remainder; n++) counts[order[n].i]++;
  return counts;
}
