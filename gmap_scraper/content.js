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
})(arguments[0]);
