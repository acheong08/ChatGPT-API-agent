browser.storage.local.get("endpoint").then((result) => {
  const endpoint = result.endpoint || "localhost:8080";
  const wsRoute = "ws://" + endpoint + "/client/register";
  const ws = new WebSocket(wsRoute);
  console.info("Connecting to " + wsRoute);

  window.onunload = function () {
    console.info("Connection closed");
    ws.close();
  };

  ws.onerror = function (error) {
    console.error("An error occured");
    console.error(error);
    console.info("Connection closed");
    ws.close();
  };

  ws.onopen = function () {
    console.info("Connection opened");
    ws.onmessage = function (event) {
      const data = JSON.parse(event.data);

      console.log(`data ${JSON.stringify(data)}`);
      switch (data.message) {
        case "Connection id":
          handleConnectionId(ws, data);
          break;
        case "ping":
          handlePing(ws, data);
          break;
        case "ChatGptRequest":
          handleChatGptRequest(ws, data);
          break;
        default:
          console.error("Unknown message: " + data.message);
          break;
      }
    };
  };

  ws.onclose = function () {
    console.info("Connection closed");
    delete connectionId;
  };
});

function handleConnectionId(ws, data) {
  // Get connection id from cookies (if it exists)
  const cookies = document.cookie.split(";");
  let storedConnectionId = "";
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    if (cookie.includes("connectionId")) {
      storedConnectionId = cookie.split("=")[1];
    }
  }
  console.log(storedConnectionId);
  // If it exists, send it to the server
  if (storedConnectionId) {
    sendWebSocketMessage(ws, storedConnectionId, "Connection id", "");
  } else {
    sendWebSocketMessage(ws, data.id, "Connection id", "");
    // Store connectionId in cookie
    document.cookie = "connectionId=" + data.id;
  }
}

function handlePing(ws, data) {
  sendWebSocketMessage(ws, data.id, "pong", "");
}

function handleChatGptRequest(ws, data) {
  // Construct API request
  const requestData = JSON.parse(data.data);
  // If conversation_id is "", make it undefined
  if (requestData.conversation_id == "") {
    requestData.conversation_id = undefined;
  }
  // Payload
  const payload = {
    action: "next",
    messages: [
      {
        id: requestData.message_id,
        role: "user",
        content: { content_type: "text", parts: [requestData.content] },
      },
    ],
    parent_message_id: requestData.parent_id,
    conversation_id: requestData.conversation_id,
    model: "text-davinci-002-render",
  };
  // Send API request
  window
    .fetch("https://chat.openai.com/api/auth/session")
    .then((sessionResponse) => {
      // Check status code
      if (sessionResponse.status != 200) {
        console.error("Error: " + sessionResponse.status);
        console.error(`sessionResponse ${JSON.stringify(sessionResponse)}`);
        // Return error
        sendWebSocketMessage(
          ws,
          data.id,
          "error",
          "Wrong response code",
          "Error: " + sessionResponse.status
        );
        // Close websocket connection
        ws.close();
        // refresh page
        window.location.reload();
        return;
      }
      sessionResponse.json().then((sessionResponseJson) => {
        const accessToken = sessionResponseJson.accessToken;
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
            response.text().then((conversationResponse) => {
              console.log(
                `conversationResponse ${JSON.stringify(conversationResponse)}`
              );
              // Check if conversationResponse can be parsed as JSON
              try {
                const respJson = JSON.parse(conversationResponse);
                if (respJson.detail) {
                  console.error("Error: " + respJson.detail);
                  // Return error
                  sendWebSocketMessage(
                    ws,
                    data.id,
                    "error",
                    "Error: " + respJson.detail
                  );
                  // Close websocket connection
                  ws.close();
                  // refresh page
                  window.location.reload();
                  return;
                }
              } catch (e) {
                console.log("Not JSON");
              }
              // Split data on "data: " prefix
              const dataArray = conversationResponse.split("data: ");
              // Get the second last element of the array
              const lastElement = JSON.parse(dataArray[dataArray.length - 2]);
              console.log(lastElement);
              // Construct response
              const responseData = JSON.stringify({
                response_id: lastElement.message.id,
                conversation_id: lastElement.conversation_id,
                content: lastElement.message.content.parts[0],
              });
              sendWebSocketMessage(
                ws,
                data.id,
                "ChatGptResponse",
                responseData
              );
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
    const wsMessage = {
      id,
      message,
      data,
      error,
    };
    ws.send(JSON.stringify(wsMessage));
  } catch (error) {
    console.error("Error sending websocket message");
    console.error(error);
  }
}
