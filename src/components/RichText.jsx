import { fold } from "../lib/bank.js";

// Splits multi-line text into paragraphs and ASCII-table blocks (lines starting with + or |).
function blocks(text) {
  const out = [];
  let para = [], table = [];
  const flushPara = () => {
    if (para.length) out.push({ table: false, text: para.join("\n") });
    para = [];
  };
  const flushTable = () => {
    if (table.length) out.push({ table: true, text: table.join("\n") });
    table = [];
  };
  for (const ln of text.split("\n")) {
    if (/^\s*[+|]/.test(ln)) {
      flushPara();
      table.push(ln);
    } else {
      flushTable();
      if (ln.trim()) para.push(ln.trim());
    }
  }
  flushPara();
  flushTable();
  return out;
}

// Marks every accent-insensitive occurrence of an already folded `term`.
function Highlight({ text, term }) {
  const folded = fold(text);
  if (!term || folded.length !== text.length) return text;
  const parts = [];
  let i = 0, at;
  while ((at = folded.indexOf(term, i)) >= 0) {
    parts.push(text.slice(i, at), <mark key={at}>{text.slice(at, at + term.length)}</mark>);
    i = at + term.length;
  }
  parts.push(text.slice(i));
  return <>{parts}</>;
}

export default function RichText({ text, highlight }) {
  if (!text.includes("\n")) return highlight ? <Highlight text={text} term={highlight} /> : text;
  return blocks(text).map((b, i) =>
    b.table ? <pre key={i} className="tbl">{b.text}</pre> : <span key={i} className="para">{b.text}</span>,
  );
}
