// app.js
(() => {
  const $ = (sel) => document.querySelector(sel);

  const form = $("#form");
  const urlInput = $("#urlInput");
  const output = $("#output");
  const statusEl = $("#status");
  const copyBtn = $("#copyBtn");
  const clearBtn = $("#clearBtn");
  const fetchBtn = $("#fetchBtn");
  const indent2 = $("#indent2");
  const bytesLabel = $("#bytes");

  const VOID_TAGS = new Set([
    "area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"
  ]);

  function setStatus(msg, cls = "") {
    statusEl.className = `status ${cls}`.trim();
    statusEl.textContent = msg;
  }

  function isLikelyYouTube(u) {
    try {
      const { hostname } = new URL(u);
      return /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(hostname);
    } catch {
      return false;
    }
  }

  function prettyPrintHTML(html, indentSize = 2) {
    const space = " ".repeat(indentSize);
    // Keep script/style blocks intact to avoid noisy reflow
    const blocks = [];
    html = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (m) => {
      blocks.push(m);
      return `___BLOCK_${blocks.length - 1}___`;
    });

    // Normalize: newlines between tags
    html = html
      .replace(/\r\n?/g, "\n")
      .replace(/>\s*</g, ">\n<")
      .replace(/^\s+|\s+$/g, "");

    const lines = html.split("\n");
    let level = 0;
    const out = [];

    for (let raw of lines) {
      let line = raw.trim();

      // Restore blocks placeholders on-the-fly
      if (/___BLOCK_\d+___/.test(line)) {
        const id = Number(line.match(/___BLOCK_(\d+)___/)[1]);
        line = blocks[id];
      }

      const isClosing = /^<\/[^>]+>/.test(line);
      const isSelfClose = /^<[^>]+\/>/.test(line);
      const openTagMatch = line.match(/^<([a-zA-Z0-9-]+)(\s[^>]*)?>/);
      const tagName = openTagMatch?.[1]?.toLowerCase() || null;
      const isVoid = tagName ? VOID_TAGS.has(tagName) : false;

      if (isClosing) level = Math.max(level - 1, 0);

      out.push(`${space.repeat(level)}${line}`);

      if (!isClosing && !isSelfClose && !isVoid && /^<[^!/?][^>]*>/.test(line) && !/<\/[^>]+>$/.test(line)) {
        level += 1;
      }
    }

    return out.join("\n");
  }

  function updateBytes(text) {
    // Rough byte count (UTF-8 by code unit length)
    bytesLabel.textContent = `${new TextEncoder().encode(text).length.toLocaleString()} bytes`;
  }

  async function doFetch(url) {
    setStatus("Fetching…", "");
    output.textContent = "";
    bytesLabel.textContent = "0 bytes";

    // In extension popup context with host permissions, this direct fetch will work.
    // In a normal web page, CORS for YouTube will likely block access.
    // No external libs, no proxy usage here by design.
    const controller = new AbortController();
    const signal = controller.signal;

    fetchBtn.disabled = true;

    try {
      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        redirect: "follow",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const raw = await res.text();
      const formatted = prettyPrintHTML(raw, indent2.checked ? 2 : 4);

      // Display as raw text (escaped automatically via textContent)
      output.textContent = formatted;
      updateBytes(raw);
      setStatus("Done.", "ok");
      output.focus();
    } catch (err) {
      setStatus(`Error: ${err.message}`, "err");
    } finally {
      fetchBtn.disabled = false;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    if (!/^https?:\/\//i.test(url)) {
      setStatus("Please include http(s)://", "warn");
      return;
    }
    if (!isLikelyYouTube(url)) {
      setStatus("Warning: Not a YouTube URL.", "warn");
    } else {
      setStatus("");
    }
    doFetch(url);
  });

  clearBtn.addEventListener("click", () => {
    output.textContent = "";
    urlInput.value = "";
    bytesLabel.textContent = "0 bytes";
    setStatus("");
    urlInput.focus();
  });

  copyBtn.addEventListener("click", async () => {
    const text = output.textContent || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied to clipboard.", "ok");
    } catch {
      setStatus("Copy failed.", "err");
    }
  });

  indent2.addEventListener("change", () => {
    if (!output.textContent) return;
    const raw = output.textContent.replace(/\t/g, "  "); // normalize before re-format
    // We can't reconstruct original HTML from pretty output; just re-indent current view
    // Better UX: refetch on demand for exact reformat; here we just adjust tabs visually.
    output.style.tabSize = indent2.checked ? "2" : "4";
  });
})();
