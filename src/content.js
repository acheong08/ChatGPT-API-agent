browser.storage.local.get("endpoint").then((result) => {
  if (result.endpoint) {
    endpoint = result.endpoint;
  } else {
    endpoint = "localhost:8080";
  }
  let ws_route = "ws://" + endpoint + "/client/register";
  let ws = new WebSocket(ws_route);
  // On page refresh or exit, close the websocket connection
  window.onunload = function () {
    ws.close();
  };
  ws.onopen = function () {
    ws.onmessage = function (event) {
      let data = JSON.parse(event.data);
      console.log(data);
      if (data.message == "Connection id") {
        connection_id = data.id;
        let message = {
          message: "Connection id",
          id: connection_id,
          data: "",
        };
        ws.send(JSON.stringify(message));
        browser.storage.local.set({ connectionId: connection_id });
      } else if (data.message == "ping") {
        let message = {
          message: "pong",
          id: data.id,
          data: "",
        };
        ws.send(JSON.stringify(message));
      } else if (data.message == "ChatGptRequest") {
        // Construct API request
        let request_data = JSON.parse(data.data);
        // If conversation_id is "", make it undefined
        if (request_data.conversation_id == "") {
          request_data.conversation_id = undefined;
        }
        // Payload
        let payload = {
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
              console.log("Error: " + session_response.status);
              console.log(session_response);
              // Return error
              let chatGPTresponse = {
                id: data.id,
                message: "error",
                data: "Wrong response code",
                error: "Error: " + session_response.status,
              };
              ws.send(JSON.stringify(chatGPTresponse));
              // Close websocket connection
              ws.close();
              // refresh page
              window.location.reload();
              return;
            }
            session_response
              .json()
              .then((session_response_json) => {
                let accessToken = session_response_json.accessToken;
                console.log(accessToken);
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
                      console.log(conversation_response);
                      // Split data on "data: " prefix
                      const dataArray = conversation_response.split("data: ");
                      // Get the second last element of the array
                      const lastElement = JSON.parse(
                        dataArray[dataArray.length - 2]
                      );
                      console.log(lastElement);
                      // Construct response
                      let chatGPTresponse = {
                        id: data.id,
                        message: "ChatGptResponse",
                        data: JSON.stringify({
                          response_id: lastElement.message.id,
                          conversation_id: lastElement.conversation_id,
                          content: lastElement.message.content.parts[0],
                        }),
                      };
                      ws.send(JSON.stringify(chatGPTresponse));
                    });
                  })
                  .catch((error) => {
                    console.log(error);
                    // Return error
                    let chatGPTresponse = {
                      id: data.id,
                      message: "error",
                      data: "Unknown error",
                      error: error,
                    };
                    ws.send(JSON.stringify(chatGPTresponse));
                    // Close websocket connection
                    ws.close();
                    return;
                  });
              })
              .catch((error) => {
                console.log(error);
                // Return error
                let chatGPTresponse = {
                  id: data.id,
                  message: "error",
                  data: "Unknown error",
                  error: error,
                };
                ws.send(JSON.stringify(chatGPTresponse));
                // Close websocket connection
                ws.close();
                return;
              });
          })
          .catch((error) => {
            console.log(error);
            // Return error
            let chatGPTresponse = {
              id: data.id,
              message: "error",
              data: "Unknown error",
              error: error,
            };
            ws.send(JSON.stringify(chatGPTresponse));
            // Close websocket connection
            ws.close();
            return;
          });
      }
    };
  };
  ws.onclose = function () {
    console.log("Connection closed");
    delete connection_id;
  };
});
