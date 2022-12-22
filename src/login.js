/// login.js
console.log("login.js loaded");

// Get credentials from cookies
const cookies = document.cookie.split("; ");
// Get email and password from cookies
let email = cookies.find((cookie) => cookie.startsWith("email=")).split("=")[1];
let password = cookies.find((cookie) => cookie.startsWith("password=")).split("=")[1];

// Find the button with the text "Log in"
let button = document.querySelector(
  ".btn.flex.justify-center.gap-2.btn-primary"
);

if (button && button.innerText === "Log in") {
  button.click();
}

function setUsername() {
  let input = document.getElementById("username");
  if (input) {
    input.value = email;
    console.log("email: ", email);
  } else {
    setTimeout(setUsername, 100); // try again in 100 milliseconds
  }
}

setUsername();
