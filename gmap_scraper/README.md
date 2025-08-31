# Google Maps Scraper Chrome Extension

The Google Maps Scraper is a Chrome extension designed to extract information from the dynamic "feed" section of Google Maps search results. It automates scrolling to load more results and then collects the visible text data, which can then be exported for further analysis.

## Features

*   **Google Maps Data Extraction:** Scrapes text content from the `div[role="feed"]` element on Google Maps search result pages.
*   **Configurable Scrolling:** Allows users to specify how many times the extension should scroll down the feed to load more results, enabling the collection of a larger dataset.
*   **Unique Data Collection:** Ensures that only unique data entries are collected, preventing duplicates.
*   **CSV Export:** Provides a convenient button to export the scraped data into a downloadable CSV file.

## How it Works

1.  **Popup Interaction (`popup.html`, `popup.js`):**
    *   The user opens the extension popup on a Google Maps search results page.
    *   They can specify the number of times to scroll the feed.
    *   Clicking "Scrape Data" initiates the data collection process.
2.  **Content Script Injection and Execution (`content.js`):**
    *   Upon clicking "Scrape Data", `popup.js` injects and executes `content.js` into the active Google Maps tab.
    *   `content.js` locates the main "feed" div.
    *   It then iteratively scrolls this div down, waiting for new content to load after each scroll, up to the specified `scrollCount`.
    *   After each scroll (and a final scrape), it collects the `innerText` of all visible items within the feed, storing them in a `Set` to ensure uniqueness.
    *   Finally, the collected unique data is sent back to `popup.js`.
3.  **Display and Export (`popup.js`):**
    *   `popup.js` receives the scraped data and displays it in the extension popup.
    *   The "Export to CSV" button allows the user to download the collected data as a CSV file, named with the current date.

## Supported Platforms

*   Google Maps search results pages (`https://www.google.com/maps/*`)

## Installation

1.  **Clone or Download:** Obtain the extension files.
2.  **Open Chrome Extensions:** Go to `chrome://extensions/` in your Chrome browser.
3.  **Enable Developer Mode:** Toggle on "Developer mode" in the top right corner.
4.  **Load Unpacked:** Click "Load unpacked" and select the `extensions/gmap_scraper` directory.

## Usage

1.  Navigate to a Google Maps search results page (e.g., search for "restaurants near me").
2.  Click the "Google Maps Scraper" extension icon in your browser toolbar.
3.  Enter the desired number of scrolls (e.g., 5) in the input field.
4.  Click "Scrape Data". The results will appear in the popup.
5.  (Optional) Click "Export to CSV" to download the scraped data.

## Development Notes

*   The extension uses Manifest V3.
*   Error handling is included for script execution and element selection.
*   The `content.js` script is directly embedded and executed via `chrome.scripting.executeScript` from `popup.js`.
