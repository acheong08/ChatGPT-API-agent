// Add an event listener for the browser action icon click event
browser.browserAction.onClicked.addListener(() => {
  // Create a new tab
  new_tab();
});

browser.tabs.onRemoved.addListener((tabID) => {
  // Delete the container with the tabID as the name OpenAI (tabID)
  browser.contextualIdentities.query({}).then((containers) => {
    containers.forEach((container) => {
      if (container.name == "OpenAI (" + tabID + ")") {
        browser.contextualIdentities.remove(container.cookieStoreId);
      }
    });
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
        .then((tabID) => {
          // Add the tabID to the container
          browser.contextualIdentities.update(container.cookieStoreId, {
            name: "OpenAI (" + tabID.id + ")",
          });
        });
    });
}
