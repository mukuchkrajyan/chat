//require('socket.io')
// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var navigator = require('navigator');

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;

var locationsArr = [];

var usersArr = [];

var nickNames = [];

var test = [];

var isRefreshing = false;


io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'new private message', this listens and executes
    socket.on('new private message', function (data) {
        console.log("new private message");
        console.log(data);


        socket.broadcast.emit('test', {
            data:1
        });
    });

    socket.broadcast.emit('test', {
        data:1
    });

    socket.on('new message', function (data) {
        console.log("new message");
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username, lat, long, status) {

        console.log("numUsers",numUsers);

        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;

        socket.status = status;

        curr_user_info = [socket.username];

        curr_user_location = [lat, long];

        curr_user_location_stringify = JSON.stringify(curr_user_location);

        curr_user_status = status;

        console.log()

        if (long && lat) {

            locationsArr.push(curr_user_location_stringify);

            nickNames.push(username);

            var curr_user_index = nickNames.length - 1;

            socket.status = status;

        }


        ++numUsers;

        addedUser = true;

        test.push(status);

        socket.emit('login', {

            numUsers: numUsers,

            lat: lat,

            long: long,

            nickNames: nickNames,

            locationsArr: locationsArr,

            test: test,

            username:username,

            curr_user_index: curr_user_index
        });

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,

            nickNames: nickNames,

            locationsArr: locationsArr,

            numUsers: numUsers,

            test: test
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {

        console.log('disconnect');

        if (addedUser) {
            --numUsers;

            console.log("numUsers",numUsers);


            console.log('disconnect',socket.username);

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,

                numUsers: numUsers,
            });
        }
    });
});