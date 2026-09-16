import { useId, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import './scenario-reset.css';

type Props = {
  label: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onReset: () => void;
  disabled?: boolean;
};

export function ScenarioReset({ label, title, description, confirmLabel = label, onReset, disabled = false }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  return <div className="scenario-reset">
    <button type="button" className="reset-control" disabled={disabled} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
      <RotateCcw size={14} aria-hidden="true" />{label}
    </button>
    <dialog ref={dialog} className="reset-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
      onKeyDown={event => { if (event.key === 'Escape') event.stopPropagation(); }}>
      <p className="eyebrow">FORM LOYALTY STUDY</p>
      <h2 id={`${id}-title`}>{title}</h2>
      <p id={`${id}-description`}>{description}</p>
      <div className="reset-dialog-actions">
        <button type="button" className="reset-dialog-action" autoFocus onClick={() => dialog.current?.close()}>Cancel</button>
        <button type="button" className="reset-dialog-action is-confirm" onClick={() => { dialog.current?.close(); onReset(); }}>{confirmLabel}</button>
      </div>
    </dialog>
  </div>;
}
