/// login.js
console.log("login.js loaded");

// Find the button with the text "Log in"
let button = document.querySelector(
  ".btn.flex.justify-center.gap-2.btn-primary"
);

if (button && button.innerText === "Log in") {
  button.click();
} else {
  console.error("button not found");
}

// Get credentials from cookies
const cookies = document.cookie.split("; ");
// Get email and password from cookies
let email = cookies.find((cookie) => cookie.startsWith("email=")).split("=")[1];
let password = cookies
  .find((cookie) => cookie.startsWith("password="))
  .split("=")[1];

function setUsername() {
  let emailForm = document.getElementById("username");
  if (emailForm) {
    emailForm.value = email;
    console.log("email: ", email);
  } else {
    setTimeout(setUsername, 1000);
  }
}

setUsername();

function setPassword() {
  let passwordForm = document.getElementById("password");
  if (passwordForm) {
    passwordForm.value = password;
    console.log("password: ", password);
  } else {
    setTimeout(setPassword, 1000);
  }
}
setPassword();

// c8fca5323 cb6b7c993 cee1c07cc c850d9a60 _button-login-password
button = document.querySelector("._button-login-password");
if (button) {
  button.click();
} else {
  console.error("button not found");
}
