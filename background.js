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
        .then((tab) => {
          // Inject the content script into the tab
          browser.tabs.executeScript(tab.id, {
            file: "src/content.js",
          });
        });
      // Store container ID in local storage
      browser.storage.local.set({ containerId: container.cookieStoreId });
    });
}