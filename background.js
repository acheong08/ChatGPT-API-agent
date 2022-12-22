// Add an event listener for the browser action icon click event
browser.browserAction.onClicked.addListener(() => {
  // Get credentials from storage
  browser.storage.local.get("credentials").then((results) => {
    for (let i = 0; i < results.credentials.length; i++) {
      // Open a new tab for each credential
      new_tab(results.credentials[i].email, results.credentials[i].password);
    }
    console.log("credentials: ", results);
    console.log("credentials.length: ", results.credentials.length);
  });
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

function new_tab(email, password) {
  // Create a new container with tabID
  browser.contextualIdentities
    .create({
      name: "OpenAI (tmp)",
      color: "blue",
      icon: "circle",
    })
    .then((container) => {
      // Save email and password to container's cookies
      browser.cookies.set({
        url: "https://chat.openai.com",
        name: "email",
        value: email,
        storeId: container.cookieStoreId,
      });
      browser.cookies.set({
        url: "https://chat.openai.com",
        name: "password",
        value: password,
        storeId: container.cookieStoreId,
      });
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
