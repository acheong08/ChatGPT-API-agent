/// login.js
console.log("login.js loaded");
// Find the button with the text "Log in"
let button = document.querySelector('.btn.flex.justify-center.gap-2.btn-primary');

if (button && button.innerText === 'Log in') {
  button.click();
}
