(function() {
  const feedDivs = document.querySelectorAll('div[role="feed"]');
  let scrapedData = [];

  feedDivs.forEach(div => {
    scrapedData.push(div.innerText);
  });

  chrome.runtime.sendMessage({ action: 'displayData', data: scrapedData });
})();
