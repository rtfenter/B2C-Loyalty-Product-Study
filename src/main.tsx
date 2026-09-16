import { Omnichannel } from "./components/omnichannel/Omnichannel";
import { initialOmni, omniReducer } from "./omnichannelScenario";
import { RedemptionReturns } from "./components/redemption/RedemptionReturns";
import { initialRedemption, redemptionReducer } from "./redemptionScenario";
import { MemberScenarioProvider } from "./MemberScenarioContext";
import React, { useEffect, useRef, useState, useReducer } from "react";
import { createRoot } from "react-dom/client";
import { Header, Footer, type Page } from "./components/Layout";
import { Landing } from "./components/Landing";
import { Rewards } from "./components/Rewards";
import { Bag } from "./components/Bag";
import "./styles.css";
import {
  CampaignStudio,
  ProductEntry,
} from "./components/campaign/CampaignStudio";
import { MemberJourney } from "./components/journey/MemberJourney";
import { StudyNavigation } from "./components/StudyNavigation";
import { TargetedOffer } from "./components/offer/TargetedOffer";
function currentPage(): Page {
  const page = window.location.hash.slice(1);
  return page === "rewards" ||
    page === "bag" ||
    page === "studio" ||
    page === "journey" ||
    page === "offer" || page === "redemption" || page === "omnichannel"
    ? page
    : "home";
}
function App() {
  const [page, setPage] = useState<Page>(currentPage);
  const [redemption, dispatchRedemption] = useReducer(redemptionReducer, initialRedemption);
  const [omni, dispatchOmni] = useReducer(omniReducer, initialOmni);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const navigate = () => {
      setPage(currentPage());
      window.scrollTo(0, 0);
      main.current?.focus({ preventScroll: true });
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  useEffect(() => {
    document.title = {
      omnichannel: "Omnichannel — FORM Product View",
      redemption: "Redemption & Returns — FORM",
      home: "FORM — Movement, rewarded.",
      rewards: "Your rewards — FORM",
      bag: "Your bag — FORM",
      offer: "Your targeted offer — FORM",
      studio: "Campaign Studio — FORM Product View",
      journey: "Maya’s Member Journey — FORM Product View",
    }[page];
  }, [page]);
  return (
    <>
      <StudyNavigation page={page} />
      {page !== "studio" && page !== "journey" && page !== "redemption" && page !== "omnichannel" && <Header page={page} />}
      <main id="main" ref={main} tabIndex={-1}>
        {/* Preserve independent study selections when switching perspectives. */}
        <div hidden={page !== "studio"}><CampaignStudio /></div>
        <div hidden={page !== "journey"}><MemberJourney /></div>
        {page === "omnichannel" ? (<Omnichannel state={omni} dispatch={dispatchOmni}/>) : page === "redemption" ? (<RedemptionReturns state={redemption} dispatch={dispatchRedemption} />) : page === "offer" ? (
          <TargetedOffer />
        ) : page === "journey" ? (
          null
        ) : page === "studio" ? (
          null
        ) : page === "home" ? (
          <Landing />
        ) : page === "rewards" ? (
          <Rewards />
        ) : (
          <Bag />
        )}
      </main>
      {page !== "studio" && page !== "journey" && page !== "redemption" && page !== "omnichannel" && (
        <>
          <ProductEntry />
          <Footer />
        </>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MemberScenarioProvider><App /></MemberScenarioProvider>
  </React.StrictMode>,
);
