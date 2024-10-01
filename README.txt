Demonstration: https://www.youtube.com/watch?v=8kerPqAcg5s&ab_channel=EhanHassan

Ehan Hassan
This project was done for an assignment in Comp 2406.

Install Instructions:

Have socket.io installed
do: npm install (to install node_modules dependencies)


Launch instructions: Cd to 03_Chat_Server_SocketIO then do: node server.js
Open the link it provides



Testing Instructions:

To test if the entire system is working open up 3 links from the link you get when you do node server.js

Should look like this:  http://localhost:3000/chatClient.html

1. Try to type 111 in any of the usernames and press enter you should get an alert message. (You also can't type in the messages box without registering user)
2. Create a username and you should get a "Welcome user" message and now you should be able to type in the messages box.
3. Register on all 3 links and talk to each other, you will notice whoever sent the message will be in blue on your window.
4. Type a lot of messages and press clear button, it should clear the messages on the window of the user who clicked it. 
5. Private messaging: type in the user and then a : after, eg. User: hey this is a private message! (If the other person is named User)
6. Group Private Messaging: type in the user then put a comma then the other user and end with a colon.

For an example lets say I have 3 users other than you: Test2, Test3, Test4, to send the private group message do: Test2, Test3, Test4: Hey!

You should see that the private message only sends to the usernames you wrote and won't appear in any other windows screen. And the client who sent the message will show their screen like:
"Me to User" as another functionality and the colour of the private messaging will be red as per requirements.

All the assignment requirements have been followed basically.


