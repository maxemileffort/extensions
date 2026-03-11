document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    status.className = '';
    status.textContent = 'Converting…';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      if (!result || !result.markdown) {
        throw new Error('No content extracted from page.');
      }

      const blob = new Blob([result.markdown], { type: 'text/markdown' });
      const blobUrl = URL.createObjectURL(blob);

      await chrome.downloads.download({
        url: blobUrl,
        filename: result.filename,
        saveAs: false
      });

      status.textContent = `Saved: ${result.filename}`;
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

    } catch (err) {
      status.className = 'error';
      status.textContent = `Error: ${err.message}`;
      console.error('[Page to Markdown]', err);
    } finally {
      btn.disabled = false;
    }
  });
});
