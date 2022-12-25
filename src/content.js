browser.storage.local.get("endpoint").then((result) => {
  const endpoint = result.endpoint || "localhost:8080";
  const ws_route = "ws://" + endpoint + "/client/register";
  const ws = new WebSocket(ws_route);
  // On page refresh or exit, close the websocket connection
  window.onunload = function () {
    ws.close();
  };
  ws.onopen = function () {
    console.info("Connection opened");
    ws.onmessage = function (event) {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.message == "Connection id") {
        handleConnectionId(ws, data);
      } else if (data.message == "ping") {
        handlePing(ws, data);
      } else if (data.message == "ChatGptRequest") {
        handleChatGptRequest(ws, data);
      }
    };
  };
  ws.onclose = function () {
    console.info("Connection closed");
    delete connection_id;
  };
});

function handleConnectionId(ws, data) {
  connection_id = data.id;
  sendWebSocketMessage(ws, connection_id, "Connection id", "");
  browser.storage.local.set({ connectionId: connection_id });
}

function handlePing(ws, data) {
  sendWebSocketMessage(ws, data.id, "pong", "");
}

function handleChatGptRequest(ws, data) {
  // Construct API request
  const request_data = JSON.parse(data.data);
  // If conversation_id is "", make it undefined
  if (request_data.conversation_id == "") {
    request_data.conversation_id = undefined;
  }
  // Payload
  const payload = {
    action: "next",
    messages: [
      {
        id: request_data.message_id,
        role: "user",
        content: { content_type: "text", parts: [request_data.content] },
      },
    ],
    parent_message_id: request_data.parent_id,
    conversation_id: request_data.conversation_id,
    model: "text-davinci-002-render",
  };
  // Send API request
  window
    .fetch("https://chat.openai.com/api/auth/session")
    .then((session_response) => {
      // Check status code
      if (session_response.status != 200) {
        console.error("Error: " + session_response.status);
        console.error(`session_response ${JSON.stringify(session_response)}`);
        // Return error
        sendWebSocketMessage(ws, data.id, "error", "Wrong response code", "Error: " + session_response.status);
        // Close websocket connection
        ws.close();
        // refresh page
        window.location.reload();
        return;
      }
      session_response.json().then((session_response_json) => {
        const accessToken = session_response_json.accessToken;
        console.log(`accessToken ${accessToken}`);
        // Send actual request
        window
          .fetch("https://chat.openai.com/backend-api/conversation", {
            method: "POST",
            headers: {
              Accept: "text/event-stream",
              Authorization: "Bearer " + accessToken,
              "Content-Type": "application/json",
              "X-Openai-Assistant-App-Id": "",
              Connection: "close",
              Referer: "https://chat.openai.com/chat",
            },
            body: JSON.stringify(payload),
          })
          .then((response) => {
            response.text().then((conversation_response) => {
              console.log(`conversation_response ${JSON.stringify(conversation_response)}`);
              // Split data on "data: " prefix
              const dataArray = conversation_response.split("data: ");
              // Get the second last element of the array
              const lastElement = JSON.parse(
                dataArray[dataArray.length - 2]
              );
              console.log(lastElement);
              // Construct response
              const responseData = JSON.stringify({
                response_id: lastElement.message.id,
                conversation_id: lastElement.conversation_id,
                content: lastElement.message.content.parts[0],
              });
              sendWebSocketMessage(ws, data.id, "ChatGptResponse", responseData);
            });
          })
          .catch((error) => {
            console.error(error);
            // Return error
            sendWebSocketMessage(ws, data.id, "error", "Unknown error", error);
            // Close websocket connection
            ws.close();
            return;
          });
      });
    })
    .catch((error) => {
      console.error(error);
      // Return error
      sendWebSocketMessage(ws, data.id, "error", "Unknown error", error);
      // Close websocket connection
      ws.close();
      return;
    });
}

/**
 * @param {WebSocket} ws The websocket server
 * @param {string} id The data id
 * @param {string} message The message type
 * @param {string} data The data to send
 * @param {string} error If there is an error, the error message
 */
function sendWebSocketMessage(ws, id, message, data, error) {
  try {
    const ws_message = {
      id: id,
      message: message,
      data: data,
      error
    };
    ws.send(JSON.stringify(ws_message));
  } catch (error) {
    console.error("Error sending websocket message")
    console.error(error);
  }
}