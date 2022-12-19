// options.js

// Get the form element
const form = document.querySelector("form");

// Get the endpoint string from the extension's storage (if it exists)
browser.storage.local.get("endpoint").then((result) => {
    // If the endpoint string exists, set the value of the form's endpoint input
    if (result.endpoint) {
        document.querySelector("#endpoint").value = result.endpoint;
    }
});

// Add an event listener for the submit event
form.addEventListener("submit", function(event) {
  // Prevent the form from being submitted
  event.preventDefault();

  // Get the endpoint string from the form
  const endpoint = document.querySelector("#endpoint").value;

  // Save the endpoint string to the extension's storage
  browser.storage.local.set({ endpoint: endpoint });
});
