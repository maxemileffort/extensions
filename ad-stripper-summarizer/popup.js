document.addEventListener('DOMContentLoaded', () => {
    const summaryField = document.getElementById('summary');
    const copyButton = document.getElementById('copy');
    
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SUMMARY') {
        summaryField.value = message.summary;
      }
    });
  
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(summaryField.value).then(() => {
        alert('Summary copied to clipboard!');
      });
    });
  });