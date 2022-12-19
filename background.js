// Add an event listener for the browser action icon click event
browser.browserAction.onClicked.addListener(() => {
    // Create a new tab
    browser.tabs.create({url: "https://chat.openai.com"});
  });
  