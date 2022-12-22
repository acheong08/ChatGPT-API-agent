/// login.js
console.log("login.js loaded");

// Find the button with the text "Log in"
let button = document.querySelector(
  ".btn.flex.justify-center.gap-2.btn-primary"
);

console.log("button: ", button);

if (button && button.innerText === "Log in") {
  button.click();
} else {
  console.log("button not found");
}

// Get credentials from cookies
const cookies = document.cookie.split("; ");
// Get email and password from cookies
let email = cookies.find((cookie) => cookie.startsWith("email=")).split("=")[1];
let password = cookies
  .find((cookie) => cookie.startsWith("password="))
  .split("=")[1];

function setUsername() {
  let email = document.getElementById("username");
  let password = document.getElementById("password");
  if (email && password) {
    email.value = email;
    password.value = password;
    console.log("email: ", email);
    console.log("password", password);
  } else {
    setTimeout(setUsername, 1000);
  }
}

setUsername();
