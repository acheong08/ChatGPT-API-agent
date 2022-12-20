browser.storage.local.get("endpoint").then((result) => {
  if (result.endpoint) {
    endpoint = result.endpoint;
  } else {
    endpoint = "localhost:8080";
  }
  let ws_route = "ws://" + endpoint + "/client/register";
  let ws = new WebSocket(ws_route);
  ws.onopen = function () {
    ws.onmessage = function (event) {
      console.log(event.data);
      let data = JSON.parse(event.data);
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
        let response = {
          id: data.id,
          message: "ChatGptResponse",
          data: JSON.stringify({
            response_id: "somerandomuuid",
            conversation_id: "somerandomuuid",
            content: "Hello world!",
          }),
        };
        ws.send(JSON.stringify(response));
      }
    };
  };
  ws.onclose = function () {
    console.log("Connection closed");
    delete connection_id;
  };
});
