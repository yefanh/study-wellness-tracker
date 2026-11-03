import { useId, type ReactNode } from 'react';

/**
 * Accessible wrapper for a chart. The SVG chart is hidden from screen readers (aria-hidden)
 * because a pile of <rect>s means nothing when read aloud. Instead they get:
 * - a one-sentence summary (visible to everyone), and
 * - the same numbers as a real <table>, visually hidden but read by screen readers.
 */
export function ChartFigure({
  title,
  summary,
  columns,
  rows,
  children,
}: {
  title: string;
  summary: string;
  columns: string[];
  rows: (string | number)[][];
  children: ReactNode;
}) {
  const id = useId();
  return (
    <figure aria-labelledby={`${id}-title`} className="card">
      <figcaption>
        <h3 id={`${id}-title`} className="card-title">
          {title}
        </h3>
        <p className="mb-3 text-sm text-slate-700">{summary}</p>
      </figcaption>
      <div aria-hidden="true">{children}</div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[0])}>
              {row.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
