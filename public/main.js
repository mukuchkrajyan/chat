$(function () {

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

// Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page


    var $location = $('#location'); // The location


// Prompt for setting a username
    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    // var $currentInput = $usernameInput.focus();

    var socket = io();


    window.addEventListener('beforeunload', function(event) {
        localStorage.clear();
    });

    var userLogined = 0;

    if (localStorage.getItem("username") !== null) {

        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');

        userLogined =   1;

        username = localStorage.getItem("username");

        lat = localStorage.getItem("lat");

        long = localStorage.getItem("long");

        numUsers = localStorage.getItem("numUsers");

        nickNames = localStorage.getItem("nickNames");

        if(typeof(nickNames == 'string')){
            nickNames   =   nickNames.split(',');
        }

        curr_user_index = localStorage.getItem("curr_user_index");

        locationsArr = localStorage.getItem("locationsArr");

        console.log("locationsArr",locationsArr,typeof locationsArr);

        // Parse the string representation into an array of coordinate strings
        var coordinateStrings = locationsArr.split('],[');

// Initialize an array to store coordinates
        var coordinates = [];

        for (var i = 0; i < coordinateStrings.length; i++) {

            var coordinate = coordinateStrings[i].replace(/[\[\]]/g, '').split(',');

            coordinates.push(coordinate);
        }

        console.log(coordinates);
        // locationsArr = JSON.parse(locationsArr);

        console.log("coordinates",coordinates,typeof coordinates);

        locationsArr    =   coordinates;

        $("#index").val(curr_user_index);

        connected = true;
        // Display the welcome message
        var message = "Welcome to Socket.IO Chat – ";


        var test = localStorage.getItem('test');

        data = {
            numUsers: numUsers,

            nickNames: nickNames,

            locationsArr: locationsArr,

            test: test,

            username: username,

            lat: lat,

            long: long,

            curr_user_index: curr_user_index

        };

        log(message, {
            prepend: true
        });

        console.log('localStorage.getItem("nickNames")',localStorage.getItem("nickNames"));

        addParticipantsMessage(data);
    }

    $(".usersList").delegate(".user", "click", function () {
        user_name = $(this).attr('nickname');

        $("#ChatWithUserTitle").text(user_name);

        if ($(".chatConcret").css("display") == "none") {
            $(".chatConcret").css("display", "inline-block");
        }
    });

    $(".chatsAllSexion").find(".chatConcret").delegate("#sendUserMessage", "click", function () {
        message = $('.ChatWithUserMessage').val();
        // user_name = $("#username").val();
        user_name = localStorage.getItem('username');
        data = [];
        data.push(user_name);
        data.push($("#ChatWithUserTitle").text());
        data.push(message);
        // // data.push(message);
        socket.emit('new private message', data);
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }

    function showPosition(position) {

        lat = position.coords.latitude;

        long = position.coords.longitude;

        $("#location").attr('lat', lat);

        $("#location").attr('long', long);
    }
	
    function buildPrivateChatUsers(locationsArr, nickNames, test, numUsers) {

        $.each(nickNames, function (key, nickName) {

            console.log(test);
            console.log(key, nickName,localStorage.getItem('username'));

            //check same person or no
            if(localStorage.getItem('curr_user_index')!= key ){
                $(".usersList").append('<li nickname="' + nickName + '"  class="user">' + nickName + '(' + test[key] + ')' + '</li>');
            }
        });
    }

    function buildOrUpdateMap(locationsArr, nickNames, test, numUsers) {

        var myCenter = new google.maps.LatLng($("#location").attr('lat'), $("#location").attr('long'));

        var mapCanvas = document.getElementById("map");

        var mapOptions = {center: myCenter, zoom: 6};

        var map = new google.maps.Map(mapCanvas, mapOptions);

        console.log("locationsArr",locationsArr);
        // return;

        $.each(locationsArr, function (key, val) {

            console.log(key, val,test);

            if (test[key] = 0) {
                var icon = 'http://www.iconninja.com/files/151/159/771/map-marker-marker-outside-chartreuse-icon.png';
            }
            else {
                var icon = 'http://photothumbnails.themler.io/129/991129/896205_small_checkboard.jpg';
            }
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(val[0], val[1]),
                map: map,
                zoom: 6,
                title: nickNames[key],
                icon: icon
            });
            marker.setMap(map);

            infowindow = new google.maps.InfoWindow({
                content: nickNames[key]
            });

            infowindow.open(map, marker);
        });
    }

    function addParticipantsMessage(data) {

        console.log("addParticipantsMessage");
        var message = '';

        nickNames = data.nickNames;

        locationsArr = data.locationsArr;

        test = data.test;

        console.log("test",test);

        if (locationsArr.length > 0) {

            $("#map").show("fast");

            buildOrUpdateMap(locationsArr, nickNames, test, data.numUsers);

            buildPrivateChatUsers(locationsArr, nickNames, test, data.numUsers);
        }

        $(".mapSexion").show("fast");

        $(".chatSexionTitle").show("fast");

        $(".page").css("position", "relative");

        $(".chatsAllSexion").show("fast");

        $(".privateChatSexion").css("display", "inline-block");

        $(".chatsAllSexion").show("fast");

        if (data.numUsers === 1) {
            message += "there's 1 participant";
        } else {
            message += "there are " + data.numUsers + " participants";
        }

        log(message);
    }

// Sets the client's username
    function setUsername() {

        username = cleanInput($usernameInput.val().trim());

        $("#username").val(username);

        long = $location.attr("long").trim();

        lat = $location.attr("lat").trim();

        if ($(".status").prop("checked") == true) {
            status = 1;
        }
        else {
            status = 2;
        }


        // If the username is valid
        if (username) {
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            // $currentInput = $inputMessage.focus();

            // Tell the server your username
            socket.emit('add user', username, lat, long, status);
        }
        else {
            alert("Please type your NickName");
        }
    }

// Sends a chat message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
        }
    }

// Log a message
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

// Adds the visual chat message to the message list
    function addChatMessage(data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
            .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }

// Adds the visual chat typing message
    function addChatTyping(data) {
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
    }

// Removes the visual chat typing message
    function removeChatTyping(data) {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    }

// Adds a message element to the messages and scrolls to the bottom
// el - The element to add as a message
// options.fade - If the element should fade-in (default = true)
// options.prepend - If the element should prepend
//   all other messages (default = false)
    function addMessageElement(el, options) {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

// Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).html();
    }

// Updates the typing event
    function updateTyping() {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function () {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

// Gets the 'X is typing' messages of a user
    function getTypingMessages(data) {
        return $('.typing.message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    }

// Gets the color of a username through our hash function
    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

// Keyboard events

    $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            // $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
            }
        }
    });
    $("#continue").click(function (event) {
        if (!username) {
            setUsername();
        }
    });

    $inputMessage.on('input', function () {
        updateTyping();
    });

// Click events

// Focus input when clicking anywhere on login page
    $loginPage.click(function () {
        // $currentInput.focus();
    });

// Focus input when clicking on the message input's border
    $inputMessage.click(function () {
        // $inputMessage.focus();
    });

// Socket events

    socket.on('test', function (data, error) {
        console.log("addPrivateChatMessage");

        console.log(error);
    });

// Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
        //console.log(data); return;

        curr_username = data.username;

        curr_lat = data.lat;

        curr_long = data.long;

        numUsers = data.numUsers;

        nickNames = data.nickNames;

        console.log("data.locationsArr",data.locationsArr);

        locationsArr = JSON.stringify(data.locationsArr);

        locationsArr =  JSON.parse(locationsArr);

        console.log(locationsArr);
        //return false;

        test = data.test;

        console.log("test",test);

        curr_user_index = data.curr_user_index;

        $("#index").val(curr_user_index);

        localStorage.setItem("username", curr_username);

        localStorage.setItem("lat", curr_lat);

        localStorage.setItem("long", curr_long);

        localStorage.setItem("numUsers", numUsers);

        localStorage.setItem("nickNames", nickNames);

        localStorage.setItem("locationsArr", locationsArr);

        localStorage.setItem("curr_user_index", curr_user_index);

        localStorage.setItem("test", test);
        

        connected = true;
        // Display the welcome message
        var message = "Welcome to Socket.IO Chat – ";

        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
    });

// Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
        addChatMessage(data);
    });

// Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
        log(data.username + ' joined');
        addParticipantsMessage(data);
    });

// Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
        log(data.username + ' left');
        addParticipantsMessage(data);
        removeChatTyping(data);
    });

// Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
        addChatTyping(data);
    });

// Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
        removeChatTyping(data);
    });

    socket.on('disconnect', function () {
        log('you have been disconnected');
    });

    socket.on('reconnect', function () {
        log('you have been reconnected');
        if (username) {
            socket.emit('add user', username);
        }
    });

    socket.on('reconnect_error', function () {
        log('attempt to reconnect has failed');
    });

})
;
