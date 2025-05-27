// Listen for messages from content.js and popup.js
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'transcriptData') {
        // Transcript data received, do not summarize automatically
        console.log("Transcript data received in background.");
        // The popup will handle displaying the sample and showing the summarize button
    } else if (request.action === 'summarizeTranscript') {
        const transcript = request.data;
        chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Summarizing transcript with Gemini...' });

        // Retrieve your Gemini API key securely from storage
        chrome.storage.sync.get(['geminiApiKey'], async (result) => {
            const apiKey = result.geminiApiKey;

            if (!apiKey) {
                console.error("Gemini API key not configured in storage.");
                chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Error: Gemini API key not configured. Please add it in the extension options.' });
                return;
            }

            const model = 'gemini-2.5-flash-preview-04-17';
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const prompt = `Summarize the following text:\n\n${transcript}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const responseData = await response.json();
                // TODO: Extract the summary text from the API response
                const summary = responseData.candidates[0].content.parts[0].text; // Adjust based on actual response structure

                // Send the summary back to the popup
                chrome.runtime.sendMessage({ action: 'displaySummary', data: summary });

            } catch (error) {
                console.error("Error calling Gemini API:", error);
                chrome.runtime.sendMessage({ action: 'updateStatus', status: `Error summarizing: ${error.message}` });
            }
        });
    }
});

// Inject content script when a tab is updated or completed loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the tab has finished loading and has a valid URL
    if (changeInfo.status === 'complete' && tab.url) {
        // Define relevant URL patterns (YouTube and job boards)
        const relevantUrlPatterns = [
            'youtube.com/watch',
            'linkedin.com/jobs/view',
            'linkedin.com/jobs/search',
            'linkedin.com/jobs/collections',
            'greenhouse.io',
            'jobs.lever.co',
            'dice.com/job-detail'
        ];

        // Check if the tab's URL matches any of the relevant patterns
        const isRelevantUrl = relevantUrlPatterns.some(pattern => tab.url.includes(pattern));

        if (isRelevantUrl) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }).then(() => {
                console.log('content.js injected');
            }).catch(err => console.error('Failed to inject content.js:', err));
        }
    }
});
