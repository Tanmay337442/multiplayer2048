document.querySelector('.gameDiv').style.float = "left";
document.querySelectorAll('.gameDiv')[1].style.float = "right";

var socket = io.connect('https://' + document.domain + ':' + location.port);
var room_id;

const dialogs = document.querySelectorAll('dialog')
const scorelabels = document.querySelectorAll('h2');

socket.on('connect', function () {
    socket.emit('join_room', { 'room_id': "{{room_id}}" });
    room_id = "{{room_id}}";
});

socket.on('show_score', function (data) {
    scorelabels.forEach(element => {
        element.style.textShadow = "";
        element.style.color = "";
    });
    scorelabels[data['player']].style.color = "#ff24c8";
    scorelabels[data['player']].style.textShadow = "0px 0px 5px rgba(255, 36, 200, 0.8)";
});

socket.on('joined', function (data) {
    if (Object.keys(data['game']).length == 2) {
        for (let player = 0; player < 2; player++) {
            let mat = Object.entries(data['game'])[player][1]['mat']
            let gameDiv = document.querySelectorAll('.gameDiv')[player]
            let cells = gameDiv.querySelectorAll('.cell');
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    let cellIndex = row * 4 + col;
                    if (mat[row][col] != 0) {
                        cells[cellIndex].textContent = mat[row][col];
                        cells[cellIndex].className = "cell cell-" + mat[row][col];
                    } else {
                        cells[cellIndex].textContent = "";
                        cells[cellIndex].className = "cell";
                    }
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown);

    } else {

        window.removeEventListener("keydown", handleKeyDown);

    }
});

function handleKeyDown() {

    var key;

    if (event.code == "ArrowUp" || event.code == "KeyW") {
        key = "w";

    } else if (event.code == "ArrowLeft" || event.code == "KeyA") {

        key = "a";

    } else if (event.code == "ArrowDown" || event.code == "KeyS") {

        key = "s";

    } else if (event.code == "ArrowRight" || event.code == "KeyD") {

        key = "d";

    }

    if (key != null) {
        socket.emit('update', { key, room_id });
    }
}

socket.on('remove_listener', function () {
    window.removeEventListener("keydown", handleKeyDown);
});

socket.on('updated', function (data) {
    var gameDiv = document.querySelectorAll('.gameDiv')[data['player']];
    var cells = gameDiv.querySelectorAll('.cell');
    var mat = data['mat'];

    for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 4; col++) {
            var cellIndex = row * 4 + col;
            if (mat[row][col] != 0) {
                cells[cellIndex].textContent = mat[row][col];
                cells[cellIndex].className = "cell cell-" + mat[row][col];
            } else {
                cells[cellIndex].textContent = "";
                cells[cellIndex].className = "cell";
            }

        }
    }

    gameDiv.querySelector('h2').textContent = "Score: " + data['score'];
});

socket.on('show_popup', function (data) {
    window.removeEventListener("keydown", handleKeyDown);
    const dialog = dialogs[data['player']];
    const message = dialog.querySelector('p');
    if (data['state'] == "win") {
        message.textContent = "You won!";
    } else if (data['state'] == "stuck") {
        message.textContent = "You're stuck!";
    } else {
        message.textContent = "You lost!";
    }
    dialog.showModal();
});

function reset() {
    socket.emit('reset', { room_id });
    dialogs.forEach(dialog => {
        dialog.close();
    });
    window.addEventListener("keydown", handleKeyDown);
}