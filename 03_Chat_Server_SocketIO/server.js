/*
(c) 2023 Louis D. Nel
Based on:
https://socket.io
see in particular:
https://socket.io/docs/
https://socket.io/get-started/chat/

Before you run this app first execute
>npm install
to install npm modules dependencies listed in package.json file
Then launch this server:
>node server.js

To test open several browsers to: http://localhost:3000/chatClient.html

*/
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
                                                         //or command-line arguments

const ROOT_DIR = 'html' //dir to serve static files from
let activeUsers = {};

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}

//Socket Server
io.on('connection', function(socket) {
  console.log('client connected')
  //console.dir(socket)

  // For all the socket.on:
  // https://stackoverflow.com/questions/44270239/how-to-get-socket-id-of-a-connection-on-client-side
 // https://socket.io/docs/v3/server-socket-instance/

  // When the user registers their username
  socket.on('register', function(username) {
    if(username && !activeUsers[username]){
      // create a socket id for each username that is registered.
      // send a success/fail message back to the user client.
      activeUsers[username] = socket.id;
      socket.emit('register', {success:true});
      console.log(`User ${username} registered id: ${socket.id}`);
    } else { socket.emit('register', {success: false}); }
  })

  // When a user disconnects then the connection is terminated, and we can remove the user from the user list.
  socket.on('connectionTerminated', function() {
    for (let user in activeUsers) {
      if(activeUsers[user] === socket.id) {
        delete activeUsers[user];
        console.log(`User ${user} CONNECTION TERMINATED`);
        break;
      }
    }
  })
  // Client side
  socket.on('clientSays', function(data){
    if (activeUsers[data.username]) {
      console.log('RECEIVED: ' + data.message);
      // for private messaging
      // checks for : and seperates the receivers user.
      if (data.message.includes(':')) {
        let splitWord = data.message.split(':');
        let receiver = splitWord[0].trim();
          // message then also gets seperated/extracted
        let message = splitWord.slice(1).join(':').trim();
  
        // Send the private message and confirmtion that it has been sent
        if (receiver !== data.username) {
          io.to(activeUsers[receiver]).emit('privateMessage', { sender: data.username, message:message });
          io.to(activeUsers[data.username]).emit('privateMessageSend', { receiver:receiver, message:message });
        }
        // this else condition sends messages to everyone like normal, if check condition is only for private messaging.
      } else{
        let messageData = { username: data.username, message: data.message }
        io.emit('serverSays', messageData);
      }
    }
  })
  
  // group Private messaging
  socket.on('groupPrivateMessage', function(data) {
    if (activeUsers[data.sender]) {
      console.log('RECEIVED: ' + data.message);
      data.receivers.forEach(function(receiver) {
        if (receiver !== data.sender && activeUsers[receiver]) {
          // send the actual private message to the active users
          io.to(activeUsers[receiver]).emit('privateMessage', { sender: data.sender, message: data.message });
        }
      })
      // confirmation message in server
      io.to(activeUsers[data.sender]).emit('privateMessageSend', {receivers: data.receivers, message: data.message });
    }
  })

  // private messaging 
  socket.on('privateMessage', function(data){
    if (activeUsers[data.receiver]) {
      // when private message is sent to user
      io.to(activeUsers[data.receiver]).emit('privateMessage', { sender: data.sender, message: data.message });
      socket.emit('privateMessageSend', { receiver: data.receiver, message: data.message });
    } else {
// error message if the recipient isnt there
      socket.emit('privateMessageError', { receiver: data.receiver });
    }
  })
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)
