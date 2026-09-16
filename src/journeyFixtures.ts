export type Lifecycle =
  "Enrolled" | "Activated" | "Engaged" | "At risk" | "Reactivated";
export const lifecycleOrder: Lifecycle[] = [
  "Enrolled",
  "Activated",
  "Engaged",
  "At risk",
  "Reactivated",
];
export const journeyRules = {
  engagementPurchases: 2,
  engagementWindowDays: 60,
  riskInactivityDays: 90,
  pointsPerDollar: 1,
  nextReward: 500,
} as const;
export const definitions: Record<Lifecycle, string> = {
  Enrolled:
    "Joined FORM Rewards but has not completed a qualifying activation event.",
  Activated: "A member becomes Activated after completing their first qualifying purchase following enrollment.",
  Engaged: `Completed at least ${journeyRules.engagementPurchases} qualifying purchases within the last ${journeyRules.engagementWindowDays} days.`,
  "At risk": `Was previously Engaged but has had no qualifying purchase for ${journeyRules.riskInactivityDays} days.`,
  Reactivated: "Completed a qualifying purchase after entering At risk.",
};
export type JourneyEvent = {
  day: number;
  kind: "enrollment" | "purchase" | "time";
  title: string;
  story: string;
  amount?: number;
  qualifying?: boolean;
};
export const journeyEvents: readonly JourneyEvent[] = [
  {
    day: 0,
    kind: "enrollment",
    title: "Joins FORM Rewards",
    story:
      "Maya joins the program. Enrollment opens the door; meaningful participation is still ahead.",
  },
  {
    day: 7,
    kind: "purchase",
    amount: 126,
    qualifying: true,
    title: "Makes her first qualifying purchase",
    story:
      "A Lift Legging and Sculpt Bra become Maya’s first qualifying purchase. For this FORM study, that first purchase is the activation event.",
  },
  {
    day: 35,
    kind: "purchase",
    amount: 96,
    qualifying: true,
    title: "Comes back for another purchase",
    story:
      "Twenty-eight days later, Maya makes a second qualifying purchase. Her recent behavior now meets FORM’s engagement definition.",
  },
  {
    day: 125,
    kind: "time",
    title: "90 days pass without a qualifying purchase",
    story:
      "Maya was Engaged. Now 90 days have passed since her last qualifying purchase. FORM has a reason to consider her experience, not proof of why she paused.",
  },
  {
    day: 132,
    kind: "purchase",
    amount: 78,
    qualifying: true,
    title: "Makes a qualifying purchase again",
    story:
      "Maya returns one week later. That purchase marks reactivation in this scenario; it does not establish that an intervention caused her return.",
  },
];
export type JourneySnapshot = {
  state: Lifecycle;
  previousState: Lifecycle | null;
  day: number;
  points: number;
  purchases: number;
  lastPurchaseDay: number | null;
  recentPurchases: number;
  daysSincePurchase: number | null;
  rule: string;
};
// Replay uses only scenario days and qualifying purchases; it never reads the clock
// or changes the consumer member fixture. Window boundaries are inclusive.
export function evaluateJourney(
  events: readonly JourneyEvent[],
): JourneySnapshot {
  let state: Lifecycle = "Enrolled";
  let previousState: Lifecycle | null = null;
  let day = 0;
  let points = 0;
  let previouslyEngaged = false;
  let rule = definitions.Enrolled;
  const purchases: number[] = [];
  for (const event of events) {
    previousState =
      event.kind === "enrollment" && purchases.length === 0 ? null : state;
    day = event.day;
    const qualifying = event.kind === "purchase" && event.qualifying === true;
    if (qualifying) {
      purchases.push(day);
      points += Math.floor((event.amount ?? 0) * journeyRules.pointsPerDollar);
    }
    const recent = purchases.filter(
      (purchaseDay) => day - purchaseDay <= journeyRules.engagementWindowDays,
    ).length;
    const last = purchases.at(-1);
    if (qualifying && state === "At risk") {
      state = "Reactivated";
      rule = definitions.Reactivated;
    } else if (
      previouslyEngaged &&
      last !== undefined &&
      day - last >= journeyRules.riskInactivityDays
    ) {
      state = "At risk";
      rule = definitions["At risk"];
    } else if (qualifying && recent >= journeyRules.engagementPurchases) {
      state = "Engaged";
      previouslyEngaged = true;
      rule = definitions.Engaged;
    } else if (qualifying && purchases.length === 1) {
      state = "Activated";
      rule = definitions.Activated;
    } else {
      rule =
        event.kind === "enrollment"
          ? definitions.Enrolled
          : "No new lifecycle threshold was met. The current state is retained.";
    }
  }
  const lastPurchaseDay = purchases.at(-1) ?? null;
  return {
    state,
    previousState,
    day,
    points,
    purchases: purchases.length,
    lastPurchaseDay,
    recentPurchases: purchases.filter(
      (d) => day - d <= journeyRules.engagementWindowDays,
    ).length,
    daysSincePurchase: lastPurchaseDay === null ? null : day - lastPurchaseDay,
    rule,
  };
}
export function snapshotAt(index: number) {
  return evaluateJourney(
    journeyEvents.slice(
      0,
      Math.max(0, Math.min(index, journeyEvents.length - 1)) + 1,
    ),
  );
}
export const stateExperiences: Record<
  Lifecycle,
  {
    options: string[];
    thought: string;
    headline: string;
    memberCopy: string;
    memberAction: string;
  }
> = {
  Enrolled: {
    options: ["Reinforce program value", "Encourage a meaningful first action"],
    thought:
      "Enrollment tells us Maya joined. It does not yet tell us whether the program is delivering value.",
    headline: "Your next move starts here.",
    memberCopy:
      "Welcome to FORM Rewards, Maya. Discover what moves you and earn points along the way.",
    memberAction: "Explore your favorites",
  },
  Activated: {
    options: [
      "Acknowledge the first qualifying purchase",
      "Make progress toward the next reward visible",
    ],
    thought:
      "A first purchase is a beginning. Make the value clear before asking for another action.",
    headline: "A good first move, Maya.",
    memberCopy:
      "Your first points are here. Every qualifying purchase brings your next reward a little closer.",
    memberAction: "Your rewards, in view",
  },
  Engaged: {
    options: [
      "Reinforce value without unnecessary promotion",
      "Personalize relevant categories or benefits",
    ],
    thought:
      "Maya is already participating. Relevance may be more useful than another incentive.",
    headline: "Made for your rhythm.",
    memberCopy:
      "Keep moving your way. Explore everyday essentials that work as hard as you do.",
    memberAction: "Discover everyday essentials",
  },
  "At risk": {
    options: [
      "Decide whether intervention is warranted",
      "Test a relevant re-engagement experience",
    ],
    thought:
      "A pause is a signal, not a diagnosis. Consider context and whether an intervention would add value.",
    headline: "Find your form. Again.",
    memberCopy:
      "Your next chapter of movement is yours to choose. Take another look at the essentials you love.",
    memberAction: "Rediscover your favorites",
  },
  Reactivated: {
    options: [
      "Acknowledge renewed engagement",
      "Observe whether behavior persists before escalating incentives",
    ],
    thought:
      "A return is encouraging. Watch what happens next before concluding that a lasting habit has formed.",
    headline: "Good to move with you again.",
    memberCopy:
      "Welcome back, Maya. Your points are growing, and your next reward is a little closer.",
    memberAction: "See your progress",
  },
};
export const riskDecisions = [
  {
    title: "Send a targeted incentive",
    text: "An incentive may encourage short-term action, but adds reward cost and makes it harder to tell whether Maya would have returned organically. Eligibility, relevance, and a comparison group matter.",
  },
  {
    title: "Show a personalized experience without an incentive",
    text: "A relevant experience can reinforce value without reward spend. It may be less motivating if relevance is not the real barrier; learn whether the experience addresses a member need.",
  },
  {
    title: "Wait and observe",
    text: "Waiting preserves a cleaner behavioral signal and avoids unnecessary contact or cost. It also risks allowing disengagement to continue. Choose an observation window and a point to reassess.",
  },
  {
    title: "Test multiple interventions",
    text: "A structured comparison can help distinguish relevance from incentive effects. It requires enough eligible members, a control, and clear decision criteria; one fictional member cannot establish effectiveness.",
  },
] as const;
