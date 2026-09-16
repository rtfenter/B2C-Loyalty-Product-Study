import { ScenarioReset } from "./ScenarioReset";
import { useMemberScenario } from "../MemberScenarioContext";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { Page } from "./Layout";
import "./study-navigation.css";
export const studyDestinations = [
  {
    label: "Member View",
    pages: [
      { page: "home", label: "FORM Home" },
      { page: "rewards", label: "Maya’s Rewards" },
    ],
  },
  {
    label: "Product View",
    pages: [
      { page: "studio", label: "Campaign Studio" },
      { page: "journey", label: "Member Journey" },
      { page: "redemption", label: "Redemption & Returns" },
      { page: "omnichannel", label: "Omnichannel" },
    ],
  },
] as const;
export function StudyNavigation({ page }: { page: Page }) {
  const { reset } = useMemberScenario();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const perspective =
    page === "studio" || page === "journey" || page === "redemption" || page === "omnichannel" ? "Product View" : "Member View";
  const destination =
    page === "offer"
      ? "Your offer"
      : page === "bag"
        ? "Bag"
        : studyDestinations
            .flatMap<{ page: Page; label: string }>((group) => group.pages)
            .find((item) => item.page === page)?.label;
  useEffect(() => setOpen(false), [page]);
  return (
    <aside
      className="study-navigation"
      aria-label="FORM Loyalty Study portfolio navigation"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <div className="study-nav-heading">
        <div className="study-identity">
          <strong>FORM Loyalty Study</strong>
          <span>B2C LOYALTY / FICTIONAL BRAND STUDY</span>
        </div>
        <span className="study-location">
          <span>{perspective}</span>
          <strong>{destination}</strong>
        </span>
        <button
          ref={toggle}
          className="study-menu-toggle"
          aria-expanded={open}
          aria-controls="study-destinations"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close study navigation" : "Open study navigation"}
        >
          {open ? <X size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      <nav
        id="study-destinations"
        className={open ? "study-destinations is-open" : "study-destinations"}
        aria-label="Study destinations"
      >
        {studyDestinations.map((group) => (
          <div
            className={
              group.label === perspective
                ? "study-group is-current-view"
                : "study-group"
            }
            key={group.label}
          >
            <span className="study-group-label">{group.label}</span>
            <div>
              {group.pages.map((item) => (
                <a
                  key={item.page}
                  href={`#${item.page}`}
                  aria-current={page === item.page ? "page" : undefined}
                  onClick={() => {
                    setOpen(false);
                    if (page === item.page) toggle.current?.focus();
                  }}
                >
                  {item.label}
                </a>
              ))}
              {(page === "bag" || page === "offer") &&
                group.label === "Member View" && (
                  <span className="study-bag-current" aria-current="page">
                    {page === "offer" ? "Your offer" : "Bag"}
                  </span>
                )}
            </div>
          </div>
        ))}
        <ScenarioReset label="Reset study" title="Reset Maya’s journey?"
          description="Return Maya to Enrolled with 0 points and restore her unused targeted offer. Other Product View scenarios will not be changed."
          confirmLabel="Reset Maya" onReset={reset} />
      </nav>
    </aside>
  );
}
