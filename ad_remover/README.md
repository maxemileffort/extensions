# Ad Remover Extension

This is a simple Chrome extension designed to remove advertisements from web pages. It works by identifying and hiding common ad elements, providing a cleaner browsing experience.

## Features

*   **Ad Blocking:** Hides various types of advertisements.
*   **Lightweight:** Designed to be efficient and not impact browsing performance significantly.

## Installation

1.  Download or clone this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" by toggling the switch in the top right corner.
4.  Click on "Load unpacked" and select the `ad_remover` directory.
5.  The extension should now be installed and active.

## Usage

Once installed, the extension will automatically start blocking ads on supported websites. There is no user interface for direct interaction, as it operates in the background.

## Files

*   `manifest.json`: Defines the extension's properties, permissions, and scripts.
*   `background.js`: Handles background tasks, such as listening for web requests and applying ad-blocking rules.
*   `removeAds.js`: Content script injected into web pages to identify and remove ad elements.
*   `popup.html`: (Optional) HTML for a popup window when the extension icon is clicked.
*   `popup.js`: (Optional) JavaScript for the popup window.
*   `images/`: Directory for extension icons.

## Contributing

Feel free to fork this repository and submit pull requests for any improvements or bug fixes.

## License

This project is open-source and available under the MIT License.
