// content.js — HTML to Markdown converter
// Injected on demand via chrome.scripting.executeScript.
// The IIFE returns { markdown, filename } which executeScript captures as the result.

(function () {
  // Guard against double-injection (e.g. rapid button clicks)
  if (window.__pageToMarkdownRan__) {
    return { markdown: null, filename: null };
  }
  window.__pageToMarkdownRan__ = true;
  // Reset guard after 2s so the user can re-run if needed
  setTimeout(() => { delete window.__pageToMarkdownRan__; }, 2000);

  // ── Tags whose subtrees are entirely skipped ──────────────────────────────
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'NAV', 'HEADER', 'FOOTER', 'ASIDE',
    'BUTTON', 'FORM', 'IFRAME', 'SVG', 'CANVAS', 'TEMPLATE', 'DIALOG'
  ]);

  // ── Block-level container tags that just recurse into children ────────────
  const BLOCK_TAGS = new Set([
    'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'FIGURE', 'FIGCAPTION',
    'ADDRESS', 'DETAILS', 'SUMMARY', 'FIELDSET', 'LEGEND'
  ]);

  // ── 1. Smart content root selection ──────────────────────────────────────
  function getContentRoot() {
    return (
      document.querySelector('main') ||
      document.querySelector('article') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('.content') ||
      document.querySelector('#content') ||
      document.body
    );
  }

  // ── 2. Filename from page title ───────────────────────────────────────────
  function deriveFilename() {
    const title = document.title || 'page';
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 80);
    return (slug || 'page') + '.md';
  }

  // ── 3. Whitespace helpers ─────────────────────────────────────────────────
  function collapseWhitespace(str) {
    return str.replace(/[\t\r\n]+/g, ' ').replace(/ {2,}/g, ' ');
  }

  // ── 4. Inline text walker (applies inline formatting, no block structure) ─
  function getInlineText(node) {
    let result = '';
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        result += collapseWhitespace(child.textContent);
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = child.tagName.toUpperCase();
      if (SKIP_TAGS.has(tag)) continue;
      switch (tag) {
        case 'STRONG': case 'B':
          result += '**' + getInlineText(child) + '**'; break;
        case 'EM': case 'I':
          result += '_' + getInlineText(child) + '_'; break;
        case 'S': case 'DEL': case 'STRIKE':
          result += '~~' + getInlineText(child) + '~~'; break;
        case 'CODE':
          result += handleInlineCode(child); break;
        case 'A':
          result += handleLink(child); break;
        case 'IMG':
          result += handleImage(child); break;
        case 'BR':
          result += '  \n'; break;
        default:
          result += getInlineText(child); break;
      }
    }
    return result;
  }

  // ── 5. Tag handlers ───────────────────────────────────────────────────────

  function handleHeading(node, level) {
    const text = getInlineText(node).trim();
    if (!text) return '';
    return '\n\n' + '#'.repeat(level) + ' ' + text + '\n\n';
  }

  function handleCodeBlock(node) {
    // Find inner <code> for language class, but read text from <pre>
    const codeEl = node.querySelector('code') || node;
    let lang = '';
    const cls = codeEl.className || '';
    const langMatch = cls.match(/(?:language|lang|highlight)-(\w+)/);
    if (langMatch) {
      lang = langMatch[1];
    } else if (codeEl.dataset && codeEl.dataset.lang) {
      lang = codeEl.dataset.lang;
    } else if (codeEl.dataset && codeEl.dataset.language) {
      lang = codeEl.dataset.language;
    }
    // Use raw textContent — no markdown processing inside code blocks
    const code = node.textContent.replace(/^\n/, '').replace(/\n$/, '');
    return '\n\n```' + lang + '\n' + code + '\n```\n\n';
  }

  function handleInlineCode(node) {
    // If parent is <pre>, handleCodeBlock already handled this
    if (node.parentElement && node.parentElement.tagName === 'PRE') return '';
    const text = node.textContent;
    if (text.includes('`')) return '`` ' + text + ' ``';
    return '`' + text + '`';
  }

  function handleLink(node) {
    const text = getInlineText(node).trim();
    const href = node.getAttribute('href') || '';
    if (!href || href.startsWith('javascript:') || href === '#') return text;
    let absolute = href;
    try { absolute = new URL(href, document.baseURI).href; } catch (_) {}
    if (!text) return absolute;
    return '[' + text + '](' + absolute + ')';
  }

  function handleImage(node) {
    const alt = node.getAttribute('alt') || '';
    const src = node.getAttribute('src') || '';
    if (!src) return alt;
    let absolute = src;
    try { absolute = new URL(src, document.baseURI).href; } catch (_) {}
    return '![' + alt + '](' + absolute + ')';
  }

  function handleList(node, ctx) {
    const depth = ctx.listDepth || 0;
    const listType = node.tagName === 'UL' ? 'ul' : 'ol';
    const newCtx = { ...ctx, listType, listDepth: depth };

    let items = '';
    let counter = 1;
    for (const child of node.children) {
      if (child.tagName === 'LI') {
        items += handleListItem(child, { ...newCtx, olCounter: counter++ });
      }
    }
    if (depth === 0) return '\n\n' + items.trimEnd() + '\n\n';
    return items;
  }

  function handleListItem(node, ctx) {
    const depth = ctx.listDepth || 0;
    const indent = '  '.repeat(depth);
    const bullet = ctx.listType === 'ol' ? (ctx.olCounter || 1) + '. ' : '- ';

    let inlineText = '';
    let nested = '';

    for (const child of node.childNodes) {
      const tag = child.tagName && child.tagName.toUpperCase();
      if (tag === 'UL' || tag === 'OL') {
        nested += handleList(child, { ...ctx, listDepth: depth + 1 });
      } else {
        inlineText += nodeToMarkdown(child, ctx);
      }
    }

    const clean = collapseWhitespace(inlineText).trim();
    return indent + bullet + clean + '\n' + nested;
  }

  function handleTable(node) {
    const allRows = Array.from(node.querySelectorAll('tr'));
    if (!allRows.length) return '';

    const rows = allRows.map(tr =>
      Array.from(tr.querySelectorAll('th, td')).map(cell =>
        getInlineText(cell).trim().replace(/\|/g, '\\|').replace(/\n/g, ' ')
      )
    );

    const colCount = Math.max(...rows.map(r => r.length));
    const padded = rows.map(r => {
      while (r.length < colCount) r.push('');
      return r;
    });

    const toRow = cells => '| ' + cells.join(' | ') + ' |';
    const separator = Array(colCount).fill('---');

    const lines = [
      toRow(padded[0]),
      toRow(separator),
      ...padded.slice(1).map(toRow)
    ];

    return '\n\n' + lines.join('\n') + '\n\n';
  }

  function handleBlockquote(node, ctx) {
    const inner = walkChildren(node, ctx).trim();
    if (!inner) return '';
    return '\n\n' + inner.split('\n').map(line => '> ' + line).join('\n') + '\n\n';
  }

  function handleDefinitionList(node) {
    let output = '\n\n';
    for (const child of node.children) {
      const tag = child.tagName.toUpperCase();
      if (tag === 'DT') output += '**' + getInlineText(child).trim() + '**\n';
      else if (tag === 'DD') output += ': ' + getInlineText(child).trim() + '\n';
    }
    return output + '\n';
  }

  // ── 6. Core recursive node walker ─────────────────────────────────────────
  function walkChildren(node, ctx) {
    let result = '';
    for (const child of node.childNodes) {
      result += nodeToMarkdown(child, ctx);
    }
    return result;
  }

  function nodeToMarkdown(node, ctx) {
    if (node.nodeType === Node.TEXT_NODE) {
      return collapseWhitespace(node.textContent);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toUpperCase();
    if (SKIP_TAGS.has(tag)) return '';

    switch (tag) {
      case 'H1': return handleHeading(node, 1);
      case 'H2': return handleHeading(node, 2);
      case 'H3': return handleHeading(node, 3);
      case 'H4': return handleHeading(node, 4);
      case 'H5': return handleHeading(node, 5);
      case 'H6': return handleHeading(node, 6);
      case 'P':  return '\n\n' + getInlineText(node).trim() + '\n\n';
      case 'BR': return '  \n';
      case 'HR': return '\n\n---\n\n';
      case 'PRE': return handleCodeBlock(node);
      case 'CODE': return handleInlineCode(node);
      case 'STRONG': case 'B': return '**' + getInlineText(node) + '**';
      case 'EM': case 'I':     return '_' + getInlineText(node) + '_';
      case 'S': case 'DEL': case 'STRIKE': return '~~' + getInlineText(node) + '~~';
      case 'A':   return handleLink(node);
      case 'IMG': return handleImage(node);
      case 'UL': case 'OL': return handleList(node, ctx);
      case 'LI':  return handleListItem(node, ctx);
      case 'TABLE': return handleTable(node);
      case 'BLOCKQUOTE': return handleBlockquote(node, ctx);
      case 'DL':  return handleDefinitionList(node);
      // Skip table internals — handled by handleTable directly
      case 'THEAD': case 'TBODY': case 'TFOOT':
      case 'TR': case 'TH': case 'TD': return '';
      default:
        if (BLOCK_TAGS.has(tag)) return walkChildren(node, ctx);
        return getInlineText(node);
    }
  }

  // ── 7. Post-processing ────────────────────────────────────────────────────
  function postProcess(md) {
    return md
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+$/gm, '')
      .trim();
  }

  // ── 8. Run ────────────────────────────────────────────────────────────────
  const root = getContentRoot();
  const rawMd = walkChildren(root, { listDepth: 0 });
  const markdown = postProcess(rawMd);
  const filename = deriveFilename();

  return { markdown, filename };
})();
