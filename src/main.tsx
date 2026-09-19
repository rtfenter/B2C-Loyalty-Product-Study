import React, { useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import { RedemptionReturns } from './components/redemption/RedemptionReturns';
import { initialRedemption, redemptionReducer } from './redemptionScenario';
import './styles.css';

function App() {
  const [state, dispatch] = useReducer(redemptionReducer, initialRedemption);
  return <><a className="skip-link" href="#main">Skip to case study</a>
    <main id="main" tabIndex={-1}><RedemptionReturns state={state} dispatch={dispatch} /></main></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
