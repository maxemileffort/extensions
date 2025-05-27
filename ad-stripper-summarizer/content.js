// content.js
async function sendToAI(content, prompt) {
    const apiKey = 'YOUR_AI_API_KEY'; // Replace with your AI API Key
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: `${prompt}: ${content}`,
        max_tokens: 2000,
      }),
    });
    const data = await response.json();
    return data.choices[0].text.trim();
  }
  
  async function analyzePage() {
    const html = document.documentElement.outerHTML;
    
    // Step 1: Ask AI to identify ads
    const adFreeHtml = await sendToAI(html, 'Identify and remove all ad-related elements in the following HTML');
    
    // Step 2: Remove any text outside HTML tags
    const cleanHtml = adFreeHtml.replace(/>[^<>]+</g, '><');
    
    // Step 3: Replace the page content
    document.documentElement.innerHTML = cleanHtml;
    
    // Step 4: Ask AI for a summary
    const summary = await sendToAI(cleanHtml, 'Provide a summary of the following HTML content');
    
    // Step 5: Send the summary back to the popup
    chrome.runtime.sendMessage({ type: 'SUMMARY', summary });
  }
  
  analyzePage();
  