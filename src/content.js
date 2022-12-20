// Get endpoint from storage
browser.storage.local.get("endpoint").then((result) => {
  // If the endpoint string exists, set the value of the form's endpoint input
  if (result.endpoint) {
    // Set the endpoint
    endpoint = result.endpoint;
  } else {
    // Set the endpoint to the default value
    endpoint = "localhost:8080";
  }
  // Make GET websocket request to endpoint
  let ws_route = "ws://" + endpoint + "/client/register";
  let ws = new WebSocket(ws_route);
  // Wait for websocket to open
  ws.onopen = function () {
    // Wait for message from server
    ws.onmessage = function (event) {
      // Log the message
      console.log(event.data);
      // Parse data as JSON
      let data = JSON.parse(event.data);
      // If message is "Connection id" then set the connection id
      if (data.message == "Connection id") {
        connection_id = data.id;
        // Return id to websocket
        let message = {
          "message": "Connection id",
          "id": connection_id,
        }
        ws.send(JSON.stringify(message));
      }
    }
  }
});
