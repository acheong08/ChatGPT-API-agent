const BASE_URL = "https://chat.openai.com";
const CHAT_URL = `${BASE_URL}/chat`;
const BACKEND_URL = `${BASE_URL}/backend-api/conversation`;
const SESSION_URL = `${BASE_URL}/api/auth/session`;

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
  console.debug(`storedConnectionId ${storedConnectionId}`);
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

async function handleChatGptRequest(ws, data) {
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

  try {
    const accessToken = await getAccessToken();
    const conversationResponse = await sendChatRequest(accessToken, payload);
    const responseData = createResponseData(conversationResponse);
    sendWebSocketMessage(ws, data.id, "ChatGptResponse", responseData);
  } catch (error) {
    console.error(error);
    sendWebSocketMessage(ws, data.id, "error", "Unknown error", error);
  }
}

async function getAccessToken() {
  try {
    const sessionResponse = await fetchData(SESSION_URL);
    const sessionResponseJson = await sessionResponse.json();
    return sessionResponseJson.accessToken;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function sendChatRequest(accessToken, payload) {
  try {
    const response = await fetchData(BACKEND_URL, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Openai-Assistant-App-Id": "",
        Connection: "close",
        Referer: CHAT_URL,
      },
      body: JSON.stringify(payload),
    });
    const conversationResponse = await response.text();
    try {
      // Check if conversationResponse can be parsed as JSON
      const respJson = JSON.parse(conversationResponse);
      if (respJson.detail) {
        console.error(`Error: ${respJson.detail}`);
        throw new Error(`Error: ${respJson.detail}`);
      }
    } catch (e) {
      console.log("Not JSON");
    }
    // Split data on "data: " prefix
    const dataArray = conversationResponse.split("data: ");
    // Get the second last element of the array
    const lastElement = JSON.parse(dataArray[dataArray.length - 2]);
    console.log(lastElement);
    return lastElement;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function createResponseData(conversationResponse) {
  return JSON.stringify({
    response_id: conversationResponse.message.id,
    conversation_id: conversationResponse.conversation_id,
    content: conversationResponse.message.content.parts[0],
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

/**
 * Fetch data from an url with optional options.
 * It will throw an error if the response is not ok, or if the status code is not 200.
 *
 * @async
 * @param {String} url The url to fetch from
 * @param {RequestInit} options The options to pass to fetch
 * @returns The response
 */
async function fetchData(url, options = {}) {
  const response = await window.fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status code: ${response.status}`);
  }

  if (response.status !== 200) {
    // This isn't the best way to handle the status code check, but it works for now
    throw new Error(`Wrong response code: ${response.status}`);
  }

  return response;
}
