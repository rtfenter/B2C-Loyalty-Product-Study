import { ArrowRight } from "lucide-react";
import { BrandMark, ReferenceImage } from "../Brand";
import {
  journeyRules,
  stateExperiences,
  type JourneySnapshot,
} from "../../journeyFixtures";
export function MemberPreview({ snapshot }: { snapshot: JourneySnapshot }) {
  const experience = stateExperiences[snapshot.state];
  return (
    <div className="journey-member-frame">
      <div className="journey-member-header">
        <span className="wordmark">FORM</span>
        <span>Maya’s rewards</span>
      </div>
      <div className="journey-member-body">
        <div>
          <BrandMark />
          <p className="eyebrow">MORE MOVEMENT. MORE YOU.</p>
          <h3>{experience.headline}</h3>
          <p>{experience.memberCopy}</p>
          <span className="member-preview-action">
            {experience.memberAction}
            <ArrowRight size={15} />
          </span>
        </div>
        <ReferenceImage
          crop="285 55 220 484"
          label="FORM performance activewear"
        />
      </div>
      <div className="journey-member-points">
        <div>
          <strong>{snapshot.points}</strong>
          <span>points</span>
        </div>
        <p>
          Your next reward
          <br />
          <strong>{journeyRules.nextReward} points</strong>
        </p>
        <div className="journey-member-progress">
          <span
            style={{
              width: `${Math.min(100, (snapshot.points / journeyRules.nextReward) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
