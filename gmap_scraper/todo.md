# Google Maps Scraper - TODO List

This document outlines potential improvements, bug fixes, and new features for the Google Maps Scraper Chrome Extension.

## High Priority

*   [ ] **Improve Scraper Robustness:**
    *   Enhance the `div[role="feed"]` selector and item selectors to be more resilient to Google Maps UI changes.
    *   Implement more sophisticated checks for new content loading after scrolling, potentially using MutationObserver.
    *   Handle cases where the "feed" div might not be present or has a different structure.
*   [ ] **Error Handling and User Feedback:**
    *   Provide clearer status messages in the popup during scraping (e.g., "Scrolling 1/5", "Scraping data...").
    *   Improve error messages when the content script fails to execute or find elements.
    *   Add a visual indicator (e.g., spinner) during the scraping process.

## Medium Priority

*   [ ] **Data Parsing and Structure:**
    *   Currently, the scraper extracts raw `innerText`. Implement logic to parse this text into structured data (e.g., business name, address, rating, reviews, phone number, website). This would likely involve more specific selectors for sub-elements within each feed item.
    *   Consider using a library for more robust HTML parsing if needed.
*   [ ] **User Interface Enhancements:**
    *   Improve the styling of the popup for a better user experience.
    *   Display a count of scraped items in the popup.
    *   Allow users to preview parsed data before export.
*   [ ] **Export Options:**
    *   Add options to export data in other formats (e.g., JSON).
    *   Allow users to specify the output filename.

## Low Priority / Future Enhancements

*   [ ] **Automated Search:** Allow users to input a search query directly into the extension popup, which would then navigate to Google Maps and perform the search before scraping.
*   [ ] **Pagination Handling:** If Google Maps introduces traditional pagination alongside or instead of infinite scrolling, implement logic to navigate through pages.
*   [ ] **Rate Limiting/Throttling:** Implement measures to avoid potential rate limiting by Google Maps if scraping becomes too aggressive.
*   [ ] **Proxy Support:** For advanced users, consider adding an option to use proxies for scraping.
*   [ ] **Background Scraping:** Explore options for running the scraping process in the background without keeping the popup open.
