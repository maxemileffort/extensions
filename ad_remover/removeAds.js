// Count and remove ads based on adClassNames
function removeAdsAndCount() {
    const adClassNames = [
        'ad', 'ads', 'adsbox', 'ad-container', 'ad-wrapper', 'fb_iframe_widget',
        'ad-area', 'ad-slot', 'ad-banner', 'banner-ad', 'adsbygoogle',
        'top-pla-group-inner','ad-content', 'advert', 'advertisement', 
        'advertisement-box','sponsor', 'sponsored', 'sponsored-link', 
        'sponsored-box','sponsored-content', 'promo', 'promoted', 
        'promotional', 'SiteAd', 'dom_annotate_google_ad', 'q-sticky',
        'pw-corner-ad-video', ''
    ];
    let totalCount = 0;
  
    adClassNames.forEach(className => {
      const adElements = document.getElementsByClassName(className);
      totalCount += adElements.length;
      while(adElements.length > 0) {
        adElements[0].parentNode.removeChild(adElements[0]);
      }
    });
  
    return totalCount;
  }
  
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === "getAdCount") {
        const adCount = removeAdsAndCount();
        sendResponse({count: adCount});
      }
    }
  );
  