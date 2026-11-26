import type { ReactNode } from 'react';

/** Section head: "n · LABEL" with a right-aligned technical alias (the panel reads as a signal path). */
export function SectionHead({ n, children, alias, id }: { n: number; children: ReactNode; alias?: string; id?: string }) {
  return (
    <h2 className="sec-head" id={id}>
      <span className="sec-title">
        <span aria-hidden="true">{n} · </span>
        {children}
      </span>
      {alias && <span className="sec-alias" aria-hidden="true">{alias}</span>}
    </h2>
  );
}
