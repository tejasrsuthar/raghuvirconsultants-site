import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 text-gray-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950/80 border-b border-gray-800 text-xs text-gray-400 font-mono">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInline(text) {
  if (!text) return null;

  // Split and process inline elements (bold, italic, code, links, images, strikethrough)
  const elements = [];
  let remaining = text;
  let key = 0;

  // Regex patterns
  const inlineRegex = /(!?\[([^\]]*)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*([^*]+)\*)|(_([^_]+)_)|(~~([^~]+)~~)/;

  while (remaining) {
    const match = remaining.match(inlineRegex);
    if (!match) {
      elements.push(<span key={key++}>{remaining}</span>);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      elements.push(<span key={key++}>{remaining.slice(0, matchIndex)}</span>);
    }

    const fullMatch = match[0];

    // Image ![alt](url)
    if (fullMatch.startsWith('![')) {
      const alt = match[2];
      const src = match[3];
      elements.push(
        <img
          key={key++}
          src={src}
          alt={alt}
          className="my-3 rounded-2xl max-w-full h-auto border border-gray-200 shadow-sm"
        />
      );
    }
    // Link [text](url)
    else if (fullMatch.startsWith('[')) {
      const linkText = match[2];
      const href = match[3];
      elements.push(
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline font-semibold inline-flex items-center gap-0.5"
        >
          {linkText} <ExternalLink className="w-3 h-3 inline" />
        </a>
      );
    }
    // Inline Code `code`
    else if (fullMatch.startsWith('`')) {
      const codeText = match[5];
      elements.push(
        <code key={key++} className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-pink-600 rounded-md font-mono text-[11px]">
          {codeText}
        </code>
      );
    }
    // Bold **text** or __text__
    else if (fullMatch.startsWith('**') || fullMatch.startsWith('__')) {
      const boldText = match[7] || match[9];
      elements.push(<strong key={key++} className="font-bold text-gray-900">{boldText}</strong>);
    }
    // Italic *text* or _text_
    else if (fullMatch.startsWith('*') || fullMatch.startsWith('_')) {
      const italicText = match[11] || match[13];
      elements.push(<em key={key++} className="italic text-gray-800">{italicText}</em>);
    }
    // Strikethrough ~~text~~
    else if (fullMatch.startsWith('~~')) {
      const strikeText = match[15];
      elements.push(<del key={key++} className="line-through text-gray-400">{strikeText}</del>);
    }

    remaining = remaining.slice(matchIndex + fullMatch.length);
  }

  return elements;
}

export default function MarkdownRenderer({ content = '', className = '' }) {
  if (!content.trim()) {
    return (
      <div className="text-gray-400 italic text-xs py-8 text-center">
        No markdown content written yet. Start typing in the editor...
      </div>
    );
  }

  const lines = content.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block ```lang
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push(
        <CodeBlock
          key={`code-${i}`}
          language={language}
          code={codeLines.join('\n')}
        />
      );
      i++;
      continue;
    }

    // Horizontal Rule --- or *** or ___
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-t-2 border-gray-100" />);
      i++;
      continue;
    }

    // Headings # H1 to ###### H6
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const inline = renderInline(text);

      if (level === 1) {
        blocks.push(<h1 key={`h1-${i}`} className="text-2xl font-black text-gray-900 mt-6 mb-3 tracking-tight">{inline}</h1>);
      } else if (level === 2) {
        blocks.push(<h2 key={`h2-${i}`} className="text-xl font-bold text-gray-900 mt-5 mb-2.5 tracking-tight border-b border-gray-100 pb-1.5">{inline}</h2>);
      } else if (level === 3) {
        blocks.push(<h3 key={`h3-${i}`} className="text-lg font-bold text-gray-800 mt-4 mb-2">{inline}</h3>);
      } else if (level === 4) {
        blocks.push(<h4 key={`h4-${i}`} className="text-base font-bold text-gray-800 mt-3 mb-1.5">{inline}</h4>);
      } else if (level === 5) {
        blocks.push(<h5 key={`h5-${i}`} className="text-sm font-bold text-gray-700 mt-2 mb-1">{inline}</h5>);
      } else {
        blocks.push(<h6 key={`h6-${i}`} className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-2 mb-1">{inline}</h6>);
      }
      i++;
      continue;
    }

    // Blockquote > quote
    if (line.trim().startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-4 pl-4 py-2 border-l-4 border-amber-500 bg-amber-50/50 rounded-r-2xl text-xs text-gray-700 italic"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? 'mt-1.5' : ''}>
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Markdown Table | col 1 | col 2 |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0].split('|').slice(1, -1).map(c => c.trim());
        const rowLines = tableLines.slice(2); // skip separator |---|---|

        blocks.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-800 font-bold">
                  {headerCells.map((hc, hIdx) => (
                    <th key={hIdx} className="p-3">
                      {renderInline(hc)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rowLines.map((row, rIdx) => {
                  const cells = row.split('|').slice(1, -1).map(c => c.trim());
                  return (
                    <tr key={rIdx} className="hover:bg-gray-50/60 transition-colors">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 text-gray-700">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Unordered List - item or * item
    if (/^\s*[-*+]\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-3 space-y-1.5 list-disc list-inside text-xs text-gray-700 leading-relaxed">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List 1. item
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-3 space-y-1.5 list-decimal list-inside text-xs text-gray-700 leading-relaxed font-medium">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Standard Paragraph
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('|') &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^(\*{3,}|-{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    blocks.push(
      <p key={`p-${i}`} className="my-2.5 text-xs text-gray-700 leading-relaxed">
        {renderInline(paraLines.join(' '))}
      </p>
    );
  }

  return (
    <div className={`prose-sm max-w-none text-gray-800 ${className}`}>
      {blocks}
    </div>
  );
}
