//Produce transcript
function automateClicks() {
    // Selector for the "..." (more actions) button below the YouTube video title
    // More robust selector: Look for a button with a specific ARIA label or text content
    const firstElementSelector = 'button[aria-label="More actions"]';
    // Fallback selector if ARIA label is not found (less robust)
    const firstElementFallbackSelector = '#expand';

    // Selector for the "Show transcript" button within the menu opened by the first click.
    // More robust selector: Look for an element with specific text content
    const secondElementText = 'show transcript';
    const maxWaitTime = 10000; // Increased max wait time
    const pollInterval = 500; // Increased poll interval

    chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Looking for "More actions" button...' });
    const firstElement = document.querySelector(firstElementSelector) || document.querySelector(firstElementFallbackSelector);

    if (firstElement) {
        firstElement.click();
        console.log("Clicked on the first element:", firstElementSelector);
        chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Clicked "More actions". Looking for "Show transcript" button...' });

        let elapsedTime = 0;
        const intervalId = setInterval(() => {
            // Look for the second element: prioritize aria-label, then text content
            const secondElement = document.querySelector('button[aria-label="Show transcript"]') ||
                                  Array.from(document.querySelectorAll('button, div, span'))
                                      .find(el => el.textContent.trim() === secondElementText);

            if (secondElement) {
                // Element found, click it and stop polling
                secondElement.click();
                console.log("Clicked on the second element:", secondElement.outerHTML); // Log the found element's HTML
                chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Clicked "Show transcript". Extracting transcript...' });
                clearInterval(intervalId);
                // Now that the transcript is likely visible, get the cleaned text
                setTimeout(getCleanedTextContent, 2000); // Increased delay to allow transcript to load
            } else {
                // Element not found yet, check if max wait time exceeded
                elapsedTime += pollInterval;
                if (elapsedTime >= maxWaitTime) {
                    console.error(`Second element (${secondElementText}) not found after ${maxWaitTime}ms.`);
                    chrome.runtime.sendMessage({ action: 'updateStatus', status: `"Show transcript" button not found.` });
                    clearInterval(intervalId);
                }
                // Optional: console.log("Waiting for second element...");
            }
        }, pollInterval);
    } else {
        console.error("First element not found:", firstElementSelector);
        chrome.runtime.sendMessage({ action: 'updateStatus', status: `"More actions" button not found.` });
    }
}

//Get Transcript
function getCleanedTextContent() {
    // Selector for the container holding the transcript content.
    // The target-id might be more stable than class names.
    const engagementPanelSelector = 'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]';
    // Selector for the main video title element
    const titleSelector = '#title > h1 > yt-formatted-string';
    // Selector for the channel name link (often within the #owner or #upload-info section).
    // NOTE: '#text > a' is generic; scoping it might improve reliability but needs verification.
    // Consider alternatives like '#owner #text > a' or inspecting for a more specific ID/class.
    const channelLinkSelector = '#owner #text > a'; // Attempting a slightly more specific scope

    const engagementPanel = document.querySelector(engagementPanelSelector);
    const titleElement = document.querySelector(titleSelector);
    const linkElement = document.querySelector(channelLinkSelector);

    // Initialize an empty string to store all cleaned text
    let cleanedText = '';

    // Clean and append the text content from the title element if it exists
    if (titleElement) {
        cleanedText += '\n' + titleElement.textContent.replace(/\s{2,}/g, ' ').trim();
    }

    // Clean and append the text content from the link element if it exists
    if (linkElement) {
        cleanedText += '\n@' + linkElement.textContent.replace(/\s{2,}/g, ' ').trim();
    }

    // Clean and append the text content from the engagement panel
    if (engagementPanel) {
        cleanedText +=  '\n' + engagementPanel.textContent
        .replace(/\b\d{1,2}:\d{2}\b/g, '') // Remove timestamps
        .replace(/\s{2,}/g, ' ')           // Replace consecutive whitespace
        .trim();
    }

    // Send the cleaned text back to popup.js
    if(cleanedText.length > 50 * 1000){
        cleanedText = cleanedText.slice(0, 25 * 1000) + '\n' + cleanedText.slice(25 * 1000)
    }
    chrome.runtime.sendMessage({ action: 'transcriptData', data: cleanedText.trim() });
    chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Transcript extracted.' });
    return cleanedText.trim(); // Trim any leading/trailing whitespace from the final result
}

function getGreenhouseJobDescription() {
    // Selector for the job description content within a Greenhouse job posting.
    const greenhouseJobDescriptionSelector = '.job__description';

    const element = document.querySelector(greenhouseJobDescriptionSelector);

    // Check if the element exists
    if (element) {
        return element.innerText; // Return the inner text of the element
    } else {
        console.error('Greenhouse job description element not found');
        return null; // Return null if the element is not found
    }
}


function getInnerTextOfElement() {
    // Selector for the job description content within a LinkedIn job posting.
    const linkedInJobDescriptionSelector = '.jobs-description-content__text--stretch';

    const element = document.querySelector(linkedInJobDescriptionSelector);

    // Check if the element exists
    if (element) {
        return element.innerText; // Return the inner text of the element
    } else {
        console.error('Job description element not found');
        return null; // Return null if the element is not found
    }
}

function getDiceJobDescription() {
    // Selector for the job description content within a Dice job posting.
    const diceJobDescriptionSelector = '#jobDescription';

    const element = document.querySelector(diceJobDescriptionSelector);

    // Check if the element exists
    if (element) {
        return element.innerText; // Return the inner text of the element
    } else {
        console.error('Dice job description element not found');
        return null; // Return null if the element is not found
    }
}

function getLeverJobDescription() {
    // Selector for the job description content within a Lever job posting.
    const leverJobDescriptionSelector = '[data-qa="job-description"]';

    const element = document.querySelector(leverJobDescriptionSelector);

    // Check if the element exists
    if (element) {
        return element.innerText; // Return the inner text of the element
    } else {
        console.error('Lever job description element not found');
        return null; // Return null if the element is not found
    }
}

function getConfig(){
    const jobBoardConfig = [
        {
            urlPattern: 'linkedin.com/jobs/view',
            extractor: getInnerTextOfElement,
            name: 'LinkedIn'
        },
        {
            urlPattern: 'linkedin.com/jobs/search',
            extractor: getInnerTextOfElement,
            name: 'LinkedIn'
        },
        {
            urlPattern: 'linkedin.com/jobs/collections',
            extractor: getInnerTextOfElement,
            name: 'LinkedIn'
        },
        {
            urlPattern: 'greenhouse.io',
            extractor: getGreenhouseJobDescription,
            name: 'Greenhouse.io'
        },
        {
            urlPattern: 'jobs.lever.co',
            extractor: getLeverJobDescription,
            name: 'Lever.co'
        },
        {
            urlPattern: 'dice.com/job-detail',
            extractor: getDiceJobDescription,
            name: 'Dice.com'
        }
    ];

    return jobBoardConfig;
}


function checkUrlAndRunFunction() {
    // Get the current page URL
    const currentUrl = window.location.href;

    // Check for substrings in the URL and call the respective function
    if (currentUrl.includes('youtube.com/watch')) { // Be more specific for YouTube video pages
        // Run the functions
        automateClicks();
        // getCleanedTextContent is now called after the second click in automateClicks
    } else {
        let jobDetailsExtracted = false;
        for (const config of getConfig()) {
            if (currentUrl.includes(config.urlPattern)) {
                chrome.runtime.sendMessage({ action: 'updateStatus', status: `Extracting ${config.name} job details...` });
                const text = config.extractor();
                if (text) {
                    console.log(text);
                    chrome.runtime.sendMessage({ action: 'transcriptData', data: text.trim() });
                    chrome.runtime.sendMessage({ action: 'updateStatus', status: `${config.name} job details extracted.` });
                } else {
                    chrome.runtime.sendMessage({ action: 'updateStatus', status: `Could not extract ${config.name} job details.` });
                }
                jobDetailsExtracted = true;
                break; // Stop after the first match
            }
        }

        if (!jobDetailsExtracted) {
            chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Not a supported YouTube video, LinkedIn job page, or Greenhouse.io job page.' });
        }
    }
}


// Listen for messages from the extension
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "runScript") {
            checkUrlAndRunFunction();
        }
    }
);
