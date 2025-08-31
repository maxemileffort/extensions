# Transcript Automator Chrome Extension

The Transcript Automator is a Chrome extension designed to streamline the process of extracting and summarizing text content from various web pages. It primarily focuses on YouTube video transcripts and job descriptions from popular job boards (LinkedIn, Greenhouse.io, Lever.co, Dice.com). The extension leverages the Gemini API for intelligent summarization of the extracted text.

## Features

*   **YouTube Transcript Extraction:** Automatically navigates YouTube video pages to reveal and extract the full transcript.
*   **Job Description Extraction:** Extracts job descriptions from supported job board websites.
*   **Gemini API Summarization:** Sends extracted text to the Gemini API for concise summarization.
*   **Copy to Clipboard:** Allows users to easily copy the extracted transcript (and summary, if available) to their clipboard.
*   **Configurable API Key:** Provides an options page to securely store the Gemini API key.

## How it Works

1.  **Content Script Injection (`content.js`):** When a user navigates to a supported URL (YouTube video page or a job board), the `content.js` script is automatically injected into the page.
2.  **Data Extraction:**
    *   For YouTube, `content.js` simulates clicks to open the transcript panel and then extracts the raw text, removing timestamps and excess whitespace.
    *   For job boards, `content.js` identifies and extracts the main job description text using specific selectors for each supported platform.
3.  **Popup Interaction (`popup.html`, `popup.js`):**
    *   The user clicks the "Get Transcript" button in the extension popup to initiate the extraction process.
    *   The extracted text (or a sample) is displayed in the popup.
    *   If a transcript is loaded, a "Summarize" button appears.
4.  **Background Processing (`background.js`):**
    *   When the "Summarize" button is clicked, `popup.js` sends the full text to `background.js`.
    *   `background.js` retrieves the user's Gemini API key (stored securely via `chrome.storage.sync`).
    *   It then makes a request to the Gemini API to summarize the provided text.
    *   The summary is sent back to `popup.js` for display.
5.  **Options Page (`options.html`, `options.js`):** Users can access the options page to enter and save their Gemini API key, which is essential for the summarization feature to function.

## Supported Platforms

*   **Video Transcripts:**
    *   YouTube (`youtube.com/watch`)
*   **Job Descriptions:**
    *   LinkedIn (`linkedin.com/jobs/view`, `linkedin.com/jobs/search`, `linkedin.com/jobs/collections`)
    *   Greenhouse.io (`greenhouse.io`)
    *   Lever.co (`jobs.lever.co`)
    *   Dice.com (`dice.com/job-detail`)

## Installation

1.  **Clone or Download:** Obtain the extension files.
2.  **Open Chrome Extensions:** Go to `chrome://extensions/` in your Chrome browser.
3.  **Enable Developer Mode:** Toggle on "Developer mode" in the top right corner.
4.  **Load Unpacked:** Click "Load unpacked" and select the `extensions/transcripts` directory.
5.  **Configure API Key:**
    *   Click on the "Transcript Automator" extension icon.
    *   Click the gear icon (⚙️) or "Extension options" to open the options page.
    *   Enter your Gemini API key and click "Save".

## Usage

1.  Navigate to a supported YouTube video page or a job posting on one of the supported job boards.
2.  Click the "Transcript Automator" extension icon in your browser toolbar.
3.  Click "Get Transcript" to extract the content.
4.  (Optional) Click "Summarize" to get a summary of the extracted text.
5.  Click "Copy to Clipboard" to copy the full text (and summary, if available).

## Development Notes

*   The extension uses Manifest V3.
*   API key storage is handled using `chrome.storage.sync` for secure, cross-device synchronization.
*   Error handling is implemented for API calls and element selection.
