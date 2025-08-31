let scrapedDataGlobal = []; // To store data for CSV export

document.getElementById('scrapeButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content.js']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        document.getElementById('results').innerText = 'Error: Could not inject content script. Make sure you are on a Google Maps page.';
      }
    });
  });
});

document.getElementById('exportCsvButton').addEventListener('click', () => {
  if (scrapedDataGlobal.length === 0) {
    alert('No data to export. Please scrape data first.');
    return;
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const filename = `google_maps_data_${year}-${month}-${day}.csv`;

  const csvContent = "data:text/csv;charset=utf-8," + scrapedDataGlobal.map(e => `"${e.replace(/"/g, '""')}"`).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'displayData') {
    scrapedDataGlobal = request.data; // Store data globally
    const resultsDiv = document.getElementById('results');
    if (scrapedDataGlobal && scrapedDataGlobal.length > 0) {
      resultsDiv.innerText = scrapedDataGlobal.join('\n\n---\n\n');
    } else {
      resultsDiv.innerText = 'No data found with role="feed".';
    }
  }
});
