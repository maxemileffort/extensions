let scrapedDataGlobal = []; // To store data for CSV export

document.getElementById('scrapeButton').addEventListener('click', () => {
  const scrollCount = document.getElementById('scrollCount').value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: (count) => {
        (async function(scrollCount) {
          console.log('Content script started. Scroll count:', scrollCount);
          const feedDiv = document.querySelector('div[role="feed"]');
          if (!feedDiv) {
            console.log('No div with role="feed" found.');
            chrome.runtime.sendMessage({ action: 'displayData', data: [] });
            return;
          }
          console.log('Feed div found:', feedDiv);

          let scrapedData = new Set(); // Use a Set to store unique data

          const scrapeCurrentData = () => {
            const currentItems = [];
            feedDiv.querySelectorAll(':scope > div').forEach(item => {
              const text = item.innerText.trim();
              if (text) { // Only add non-empty text
                currentItems.push(text);
              }
            });
            return currentItems;
          };

          const scrollAndScrape = async (iteration) => {
            console.log(`Iteration ${iteration}: Scraping data...`);
            const newlyScraped = scrapeCurrentData();
            newlyScraped.forEach(item => scrapedData.add(item));
            console.log(`Iteration ${iteration}: Scraped ${newlyScraped.length} items. Total unique items: ${scrapedData.size}`);

            const initialScrollHeight = feedDiv.scrollHeight;
            feedDiv.scrollTop = feedDiv.scrollHeight;
            console.log(`Iteration ${iteration}: Scrolled to bottom. New scrollTop: ${feedDiv.scrollTop}`);

            // Wait for content to load. Increased delay for robustness.
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check if new content loaded by comparing scrollHeight
            if (feedDiv.scrollHeight === initialScrollHeight) {
              console.log(`Iteration ${iteration}: No new content loaded after scroll.`);
              return false; // Indicate no new content
            }
            return true; // Indicate potential new content
          };

          for (let i = 0; i < scrollCount; i++) {
            const hasNewContent = await scrollAndScrape(i + 1);
            if (!hasNewContent && i > 0) { // If no new content after first scroll, stop early
              console.log('Stopping early: No new content detected after scroll.');
              break;
            }
          }

          // Scrape one last time after all scrolls
          console.log('Final scrape after all scrolls...');
          scrapeCurrentData().forEach(item => scrapedData.add(item));
          console.log('Final total unique items:', scrapedData.size);

          chrome.runtime.sendMessage({ action: 'displayData', data: Array.from(scrapedData) });
        })(count);
      },
      args: [parseInt(scrollCount)]
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error("Script execution error:", chrome.runtime.lastError.message);
        document.getElementById('results').innerText = 'Error: Could not execute content script. Make sure you are on a Google Maps page.';
      } else if (results && results[0] && results[0].error) {
        console.error("Content script reported error:", results[0].error);
        document.getElementById('results').innerText = 'Error in content script: ' + results[0].error;
      } else {
        console.log("Content script executed successfully.");
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
