const http = require("http");

const { Server } = require("socket.io");

const uuidv4 = require('uuid').v4;

const httpServer = http.createServer();


const typesDef = {
USER_EVENT: 'userevent',
GAME: 'gameevent'
}

let currentGame = {}
const users = {}
const clients = {}

const PORT = 8080,
HOST = "127.0.0.1";

const wsServer = new Server(httpServer, {
cors: {
  origin: "*", // or a list of origins you want to allow e.g ["http://localhost:3000"]
  credentials: true,
},
});


function handleMessage(message, userId) {
console.log(`Received message: ${message} , from ${userId}`);
let json
messageReceived = JSON.parse(message)
if (messageReceived.type === typesDef.USER_EVENT) {
  const characteristic = {}
  characteristic["name"] = messageReceived.name
  characteristic["side"] = messageReceived.side
  users[userId]= characteristic
  console.log(users)
  json = JSON.stringify(users)
  wsServer.emit("UserEvent",json);
  if (currentGame["game"]){
    let json2 = JSON.stringify(currentGame["game"])
    wsServer.emit("GameEvent",json2);
  }

} else if (messageReceived.type === typesDef.GAME) {
  currentGame["game"] = messageReceived.game
  json = JSON.stringify(currentGame["game"])
  wsServer.emit("GameEvent",json);
}
}


function handleDisconnect(userId) {
if (!userId){
  return 
}
let json
console.log(`${userId} disconnected.`)
console.log("coucou" ,users);
delete clients[userId];
delete users[userId];
json = JSON.stringify(users)
wsServer.emit("UserEvent",json);

// if (users=={} && currentGame["game"]){
//   console.log("coucou")
//   delete currentGame["game"];
// }
}

wsServer.on("connection", (socket) => {


clients[socket.id] = socket;
console.log(`${socket.id} connected.`);

socket.on("message", (message) => handleMessage(message,socket.id));
socket.on("disconnect", () => handleDisconnect(socket.id));   

});

httpServer.listen(PORT, HOST, () => {
console.log("Server running on : ", HOST+":"+PORT);
});
