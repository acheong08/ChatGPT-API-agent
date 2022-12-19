// Add an event listener for the browser action icon click event
browser.browserAction.onClicked.addListener(() => {
  // Create a new tab
  new_tab();
});

browser.tabs.onRemoved.addListener(() => {
  // Get container ID from local storage
  browser.storage.local.get("containerId").then((result) => {
    // Delete the container
    browser.contextualIdentities.remove(result.containerId);
  });
});

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    browser.tabs.executeScript(tabId, {
      file: 'src/content.js',
    });
  }
});


function new_tab() {
  // Create a new container with tabID
  browser.contextualIdentities
    .create({
      name: "OpenAI (tmp)",
      color: "blue",
      icon: "circle",
    })
    .then((container) => {
      // Create a new tab in the container with the tabID and URL
      browser.tabs
        .create({
          cookieStoreId: container.cookieStoreId,
          url: "https://chat.openai.com",
        })
      // Store container ID in local storage
      browser.storage.local.set({ containerId: container.cookieStoreId });
    });
}
