const socket = io(); // Connects to the same server that served the page by default
let currentUser = null; 

// Copy the server.js and make a serverSays that listens from the server
socket.on('serverSays', function(data){
  if (currentUser !== null){
    let msgDiv = document.createElement('div');
    msgDiv.textContent = data.username +': ' + data.message;
    if (data.username === currentUser) {
      msgDiv.classList.add('local-message');
    } else {
      msgDiv.classList.add('server-message');
    }
  document.getElementById('messages').appendChild(msgDiv);
  }
})

function sendMessage() {
  let message = document.getElementById('msgBox').value.trim();
  // if empty return null
  if(message === '' || currentUser === null) return;
  // If message includes a : it means its a private message
  // Copy rest of code from server.js for private message logic
  if (message.includes(':')) {
    let splitWord = message.split(':');
    // .map removes any white space so proper group messagigng can be handled with multiple users being typed and then a :
    let receiver = splitWord[0].split(',').map(name => name.trim());
    let groupMessage = splitWord.slice(1).join(':').trim();
    // group private message to server
    socket.emit('groupPrivateMessage', { sender: currentUser, receivers: receiver, message: groupMessage });
  } else {
    // every other message
    socket.emit('clientSays', { username: currentUser, message: message });
  }
  document.getElementById('msgBox').value = '';
}

function handleKeyDown(event) {
  if (event.key === 'Enter') {
    sendMessage();
    return false;
  }
}

// function that Clears the entire client chat
function clearAll() {
  document.getElementById('messages').innerHTML = '';
}

// function that registers a user into the database
function registerUser() {
  // remove any trailing spaces and store whatever the user typed in the variable username
  let username = document.getElementById('username').value.trim();
  // if its not a valid user (from the function requirements) then provide alert message
  if (!validUser(username)) {
    alert('Please type in a valid username: Only user names that start with a letter and have only letters and numbers should be accepted, Press ENTER if you undertand');
    return;
  }
  // disable input until registration is confirmed
  currentUser = username;
  document.getElementById('username').disabled = true;
  document.getElementById('connect_button').disabled = true;
  socket.emit('register', username); 
}

// For this validUser function I had help from these websites:
// https://www.geeksforgeeks.org/javascript-program-to-check-if-a-string-contains-only-alphabetic-characters/
// https://www.w3resource.com/javascript/form/all-letters-field.php
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function validUser(username){
  return /^[A-Za-z][0-9A-Za-z]*$/.test(username); 
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('send_button').addEventListener('click', sendMessage);
  document.getElementById('msgBox').addEventListener('keydown', handleKeyDown);
  document.getElementById('connect_button').addEventListener('click', registerUser);
  document.getElementById('clear_button').addEventListener('click', clearAll);
  // register the user manually with enter key
  document.getElementById('username').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      registerUser();
    }
  })

  // Event listener from server for private messages
  socket.on('privateMessage', function(data) {
    if (currentUser !== null) {
      let msgDiv = document.createElement('div');
      msgDiv.textContent = data.sender + ': ' + data.message;
      msgDiv.classList.add('private-message');
  
      document.getElementById('messages').appendChild(msgDiv);
    }
  })

  // Registration from user event listener
  socket.on('register', function(data) {
    // If the user successfully registeres then reenable all the html elements that were blocked off
    if (data.success) {
      document.getElementById('send_button').disabled = false; 
      document.getElementById('msgBox').disabled = false;
      document.getElementById('clear_button').disabled = false; 
      document.getElementById('success_message').textContent = 'Connection Successful, Welcome! ' + currentUser;
      document.getElementById('success_message').style.display = 'block';
      // if it fails then alert them and remain having the html elements blocked.
    } else{
      // If registration failed, allow the user to try a different username and try again
      document.getElementById('username').disabled = false;
      document.getElementById('connect_button').disabled =false;
      currentUser = null; 
      alert('Try again and enter a username that starts with a letter and have only letters and numbers, press ENTER if you understand');
    }
  })
})
  
    // Event listener from server for private messages for confirmation
 socket.on('privateMessageSend', function(data) {
  if (currentUser !== null) {
    let msgDiv = document.createElement('div');
    // replicates Me to in chat to show if you sent a private message to someone or not
    msgDiv.textContent = 'Me to ' + data.receivers.join(', ') + ': ' + data.message;
    msgDiv.classList.add('private-message');
    document.getElementById('messages').appendChild(msgDiv);
  }
})


