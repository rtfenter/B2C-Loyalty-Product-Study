import React, { useEffect, useReducer, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RedemptionReturns } from './components/redemption/RedemptionReturns';
import { initialRedemption, redemptionReducer } from './redemptionScenario';
import './styles.css';
import { EngagementStudy } from './components/engagement/EngagementStudy';

function App() {
  const [state, dispatch] = useReducer(redemptionReducer, initialRedemption);
  const [engagement, setEngagement] = useState(() => window.location.hash === '#engagement');
  useEffect(() => {
    const navigate = () => {
      if (window.location.hash !== '#main') setEngagement(window.location.hash === '#engagement');
      if (window.location.hash !== '#main') { window.scrollTo(0, 0); document.getElementById('main')?.focus({ preventScroll: true }); }
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  useEffect(() => { document.title = engagement ? 'Engagement & Incentives — Enrollment ≠ Activation' : 'B2C Commerce & Loyalty — Purchase ≠ Final Transaction'; }, [engagement]);
  return <><a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById("main")?.focus(); }}>Skip to case study</a>
    <main id="main" tabIndex={-1}>{engagement ? <EngagementStudy /> : <RedemptionReturns state={state} dispatch={dispatch} />}</main></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
