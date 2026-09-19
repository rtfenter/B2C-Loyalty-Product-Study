import { Check, ArrowDown } from 'lucide-react';
import { valueExchangeSnapshot, type ExchangeStage, type ExchangeRecord } from '../../valueExchange';
const number = (value: number) => value.toLocaleString('en-US');
const money = (value: number) => `$${number(value)}`;
const signed = (value: number) => `${value < 0 ? '−' : '+'}${number(Math.abs(value))}`;
const titles = ['You have 1,000 points.', 'Your $5 reward is ready.', 'Your purchase is complete.', 'Your return is complete.', 'A new purchase. A fresh earning.'];
const copy = [
  'Turn your points into a $5 reward, then follow one purchase through a return and a new purchase.',
  'You exchanged 1,000 points for a $5 reward. It is ready to use on your purchase.',
  'You used your $5 reward and paid $15 for a $20 item. You earned 20 points on the full qualifying purchase.',
  'Your $15 payment was refunded. Your reward came back as 1,000 points, and the 20 points earned on the returned item were removed.',
  'You paid $10 for a new item and earned 10 new points. Your earlier return is complete; these points belong to this new purchase.',
];
const productTitles = ['Start with a known balance.', 'Exchange value once.', 'Separate payment from earning.', 'One return. Three adjustments.', 'Keep the new earning independent.'];
const productCopy = [
  'A fixed opening balance anchors the journey. Every change below will reference the event that created it.',
  'The reward references the 1,000-point redemption. Points become reward value; they are no longer spendable points.',
  'The $20 purchase is funded by $5 of reward value and a $15 payment. Its earning basis is the full $20, independent of payment method.',
  'The return references the original purchase. Underneath one customer action, refund the actual payment, restore the originating redemption, and reverse the original earning.',
  'The new purchase has its own payment and earning records. Nothing from the returned purchase is transferred or counted again.',
];
function effect(item: ExchangeRecord) {
  if (item.points) return `${signed(item.points)} pts`;
  if (item.cash) return `${item.cash < 0 ? 'Refund' : 'Paid'} ${money(Math.abs(item.cash))}`;
  if (item.reward) return `${item.reward < 0 ? 'Used' : 'Issued'} ${money(Math.abs(item.reward))}`;
  return `${item.merchandise < 0 ? 'Returned' : 'Item'} ${money(Math.abs(item.merchandise))}`;
}
export function ValueExchange({ stage }: { stage: ExchangeStage }) {
  const value = valueExchangeSnapshot(stage);
  return <div className="commerce-perspectives">
    <section className="commerce-customer" aria-labelledby="customer-title">
      <div className="commerce-panel-label"><span className="eyebrow">CUSTOMER VIEW</span><span>What I need to know</span></div>
      <div aria-live="polite" aria-atomic="true" className="commerce-customer-message"><span className="commerce-receipt-label">{['BEFORE REDEMPTION', 'REWARD CONFIRMATION', 'PURCHASE RECEIPT', 'RETURN RECEIPT', 'NEW PURCHASE RECEIPT'][stage]}</span><h2 id="customer-title">{titles[stage]}</h2><p>{copy[stage]}</p>
        <dl className="commerce-receipt">
          {stage === 0 && <div><dt>Ready to redeem</dt><dd>1,000 points → $5 reward</dd></div>}
          {stage === 1 && <><div><dt>Points used</dt><dd>1,000 points</dd></div><div><dt>Reward ready to use</dt><dd>$5</dd></div></>}
          {stage === 2 && <><div><dt>Item price</dt><dd>$20</dd></div><div><dt>Reward used</dt><dd>−$5</dd></div><div><dt>You paid</dt><dd>$15</dd></div><div><dt>Points earned</dt><dd>+20 points</dd></div></>}
          {stage === 3 && <><div><dt>Refund to original payment method</dt><dd>$15</dd></div><div><dt>Points restored from your reward</dt><dd>+1,000 points</dd></div><div><dt>Points from the returned item removed</dt><dd>−20 points</dd></div></>}
          {stage === 4 && <><div><dt>New item · paid separately</dt><dd>$10</dd></div><div><dt>Points earned on this purchase</dt><dd>+10 points</dd></div><div><dt>Earlier payment refunded</dt><dd>$15</dd></div></>}
        </dl>
        <div className="commerce-balance"><span>Points available now</span><strong>{number(value.points)} <small>points</small></strong></div>
        <p className="commerce-reward-note">{stage === 1 ? '$5 reward available' : stage === 2 ? '$5 reward used on this purchase' : stage >= 3 ? 'Your $5 reward was restored as points, not another reward.' : 'No active reward yet'}</p>
      </div>
      <details className="commerce-activity"><summary>Your points activity</summary><ol>{value.history.map(item => <li key={item.id}><span>{item.label}</span><strong>{signed(item.points)}</strong></li>)}</ol></details>
    </section>
    <section className="commerce-product" aria-labelledby="product-title">
      <div className="commerce-panel-label"><span className="eyebrow">PRODUCT VIEW</span><span>What makes it correct</span></div>
      <h2 id="product-title">{productTitles[stage]}</h2><p className="commerce-product-copy">{productCopy[stage]}</p>
      <div className="commerce-record-heading"><span className="eyebrow">{stage === 0 ? 'OPENING RECORD' : 'RECORDS CREATED AT THIS STEP'}</span><span>{value.currentRecords.length} {value.currentRecords.length === 1 ? 'record' : 'records'}</span></div>
      <ol className="commerce-records">{value.currentRecords.map(item => <li key={item.id}><div className="commerce-record-top"><code id={`record-${item.id}`}>{item.id}</code><strong>{effect(item)}</strong></div><h3>{item.label}</h3>{item.sourceIds.length > 0 ? <p><ArrowDown size={12} aria-hidden="true" /> References {item.sourceIds.join(' · ')}</p> : <p>{item.kind === 'opening' ? 'Opening balance from prior activity' : 'Independent purchase transaction'}</p>}{item.kind === 'purchase' && <p>Qualifying merchandise: {money(item.qualifyingSpend)}</p>}</li>)}</ol>
      <details className="commerce-ledger"><summary>Inspect the linked history · {value.records.length} {value.records.length === 1 ? 'record' : 'records'}</summary><ol>{value.records.map(item => <li key={item.id}><div><code>{item.id}</code><strong>{effect(item)}</strong></div><p>{item.label}</p><small>{item.sourceIds.length ? `References ${item.sourceIds.join(', ')}` : 'Originating record'}</small></li>)}</ol></details>
      <div className="commerce-reconciliation"><p className="eyebrow"><Check size={14} aria-hidden="true" /> RECONCILIATION / CURRENT POSITION</p><dl><div><dt>Points balance</dt><dd>{number(value.points)}</dd></div><div><dt>Paid − refunded</dt><dd>{money(value.totalPaid)} − {money(value.totalRefunded)} = {money(value.netPaid)}</dd></div><div><dt>Active reward value</dt><dd>{money(value.rewardAvailable)}</dd></div><div><dt>Merchandise retained</dt><dd>{money(value.merchandiseRetained)}</dd></div></dl>{stage >= 3 && <p>{stage === 3 ? 'The original purchase is fully unwound. The customer is back to 1,000 points and $0 net paid.' : '1,000 − 1,000 + 20 + 1,000 − 20 + 10 = 1,010 points. Only the new $10 item and its earning remain.'} Reward value is restored once.</p>}</div>
    </section>
  </div>;
}
