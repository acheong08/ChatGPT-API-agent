// options.js
let credentials = [];

// Get references to the elements we will be interacting with
const addCredentialButton = document.getElementById("add-credential");
const credentialPopup = document.getElementById("credential-popup");
const credentialList = document.getElementById("credential-list");
const submitCredentialButton = document.getElementById("submit-credential");
let save = document.querySelector("#save");

// Get the endpoint string from the extension's storage (if it exists)
browser.storage.local.get("endpoint").then((result) => {
  // If the endpoint string exists, set the value of the form's endpoint input
  if (result.endpoint) {
    // If endpoint is empty, set it to the default value
    if (result.endpoint == "") {
      result.endpoint = "localhost:8080";
    }
    document.querySelector("#endpoint").value = result.endpoint;
  }
});

// Get the credentials array from the extension's storage (if it exists)
browser.storage.local.get("credentials").then((result) => {
  // If the credentials array exists, add each credential to the list
  if (result.credentials) {
    credentials = result.credentials;
    for (let credential of result.credentials) {
      const tableRow = document.createElement("tr");
      const emailCell = document.createElement("td");
      emailCell.textContent = credential.email;
      const passwordCell = document.createElement("td");
      passwordCell.textContent = credential.password;
      tableRow.appendChild(emailCell);
      tableRow.appendChild(passwordCell);
      credentialList.appendChild(tableRow);
    }
  }
});

// Add an event listener to the "Add Credential" button
addCredentialButton.addEventListener("click", () => {
  // Show the credential popup
  credentialPopup.style.display = "block";
});

// Add an event listener to the "Save" button in the popup
submitCredentialButton.addEventListener("click", (event) => {
  event.preventDefault(); // prevent the form from being submitted

  // Get the email and password from the form
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Add the credentials to the list
  const tableRow = document.createElement("tr");
  const emailCell = document.createElement("td");
  emailCell.textContent = email;
  const passwordCell = document.createElement("td");
  passwordCell.textContent = password;
  tableRow.appendChild(emailCell);
  tableRow.appendChild(passwordCell);
  credentialList.appendChild(tableRow);

  // Save the credentials to credentials array
  credentials.push({ email: email, password: password });

  // Clear the form and close the popup
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  credentialPopup.style.display = "none";

  // Save the credentials to the extension's storage
  browser.storage.local.set({ credentials: credentials });
});

// Add an event listener for the submit event
save.addEventListener("submit", function (event) {
  // Prevent the form from being submitted
  event.preventDefault();

  // Get the endpoint string from the form
  const endpoint = document.querySelector("#endpoint").value;

  // Save the endpoint string to the extension's storage
  browser.storage.local.set({ endpoint: endpoint });
});
