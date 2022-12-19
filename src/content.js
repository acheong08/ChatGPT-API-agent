// Get endpoint from storage
browser.storage.local.get("endpoint").then((result) => {
  // If the endpoint string exists, set the value of the form's endpoint input
  if (result.endpoint) {
    // Set the endpoint
    endpoint = result.endpoint;
  }
});
// Make GET websocket request to endpoint
let ws_route = "ws://" + endpoint + "/client/register";
let ws = new WebSocket(ws+route);
// Wait for websocket to open
ws.onopen = function() {
    // Wait for websocket to receive message
    ws.onmessage = function (event) {
        // Do stuff with message
    }
}