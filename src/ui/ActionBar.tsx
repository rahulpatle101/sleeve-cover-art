/** Sticky three-part action row: New Proof and Sound (secondary), Print Sleeve (primary), with the polite live region. */
export function ActionBar(p: {
  status: string; statusFile: string; soundOn: boolean; exporting: boolean; exported: boolean;
  onNewProof: () => void; onSound: () => void; onPrint: () => void;
}) {
  return (
    <section className="action-bar" aria-label="Proof and print">
      <p className="status" role="status" aria-live="polite">
        {p.status}
        {p.statusFile && <span className="status-file">{p.statusFile}</span>}
      </p>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={p.onNewProof}>
          <span className="btn-glyph" aria-hidden="true">↻</span>New Proof
        </button>
        <button type="button" className={`btn btn-toggle${p.soundOn ? ' is-on' : ''}`} aria-pressed={p.soundOn} onClick={p.onSound}>
          <span className="toggle-mark" aria-hidden="true" />
          Sound <span className="toggle-state" aria-hidden="true">{p.soundOn ? 'On' : 'Off'}</span>
        </button>
        <button type="button" className="btn btn-primary" onClick={p.onPrint} aria-disabled={p.exporting} aria-describedby="print-size">
          {p.exporting ? 'Printing…' : p.exported ? <>Printed <span aria-hidden="true">✓</span></> : 'Print Sleeve'}
        </button>
      </div>
      <span id="print-size" className="visually-hidden">3000 by 3000 pixel PNG</span>
    </section>
  );
}
