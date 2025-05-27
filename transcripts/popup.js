let fullTranscriptData = ''; // Variable to store the full transcript
let summaryData = ''; // Variable to store the summary

document.getElementById('runScript').addEventListener('click', () => {
    // Clear previous output, status, transcript sample, and stored data
    document.getElementById('output').textContent = '';
    document.getElementById('status').textContent = 'Starting...';
    document.getElementById('copyButton').textContent = 'Copy to Clipboard'; // Reset copy button text
    document.getElementById('summarizeButton').style.display = 'none'; // Hide summarize button
    document.getElementById('transcriptSample').textContent = ''; // Clear transcript sample
    fullTranscriptData = ''; // Clear stored transcript data
    summaryData = ''; // Clear stored summary data


    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "runScript" });
    });
});

// Listen for messages from content.js or background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'transcriptData') {
        fullTranscriptData = message.data; // Store the full transcript
        const sample = fullTranscriptData.substring(0, 500) + (fullTranscriptData.length > 500 ? '...' : ''); // Get a sample
        document.getElementById('transcriptSample').textContent = sample; // Display the sample
        document.getElementById('status').textContent = 'Transcript loaded. Ready to summarize.';
        document.getElementById('summarizeButton').style.display = 'block'; // Show summarize button
        document.getElementById('output').textContent = ''; // Clear previous summary if any
        summaryData = ''; // Clear previous summary data
    } else if (message.action === 'updateStatus') {
        document.getElementById('status').textContent = message.status;
    } else if (message.action === 'displaySummary') {
        summaryData = message.data; // Store the summary
        document.getElementById('output').textContent = summaryData; // Display the summary
        document.getElementById('status').textContent = 'Summary loaded.';
        document.getElementById('summarizeButton').style.display = 'none'; // Hide summarize button after summarizing
    }
});

// Summarize button functionality
document.getElementById('summarizeButton').addEventListener('click', () => {
    if (fullTranscriptData) {
        chrome.runtime.sendMessage({ action: 'summarizeTranscript', data: fullTranscriptData });
        document.getElementById('status').textContent = 'Sending transcript for summarization...';
        document.getElementById('summarizeButton').style.display = 'none'; // Hide summarize button while summarizing
    } else {
        document.getElementById('status').textContent = 'No transcript data available to summarize.';
    }
});


// Copy to Clipboard functionality
document.getElementById('copyButton').addEventListener('click', () => {
    let textToCopy = '';
    if (summaryData) {
        textToCopy = `Transcript:\n\n${fullTranscriptData}\n\n---\n\nSummary:\n\n${summaryData}`;
    } else if (fullTranscriptData) {
        textToCopy = fullTranscriptData;
    } else {
        document.getElementById('status').textContent = 'No content to copy.';
        return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        document.getElementById('copyButton').textContent = "Copied!";
    }).catch(err => {
        console.error('Failed to copy: ', err);
        document.getElementById('status').textContent = 'Failed to copy content.';
    });
});
