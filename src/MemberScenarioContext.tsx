import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { initialMemberScenario, memberScenarioReducer } from './memberScenario';
const Context = createContext({ state: initialMemberScenario, complete: () => {}, reset: () => {} });
export function MemberScenarioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(memberScenarioReducer, initialMemberScenario);
  return <Context.Provider value={{state, complete: () => dispatch('complete'), reset: () => dispatch('reset')}}>{children}</Context.Provider>;
}
export function useMemberScenario() { return useContext(Context); }
