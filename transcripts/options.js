document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('geminiApiKey').value;
    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
        const status = document.getElementById('status');
        status.textContent = 'API Key saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});

// Load saved API key when the options page is opened
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            document.getElementById('geminiApiKey').value = result.geminiApiKey;
        }
    });
});
