var cycle;
var bonusDelay = 1;
var speed = 100;

const defaultHead = [24, 20];

var apple = {
    position: [],
    generate: function () {
        var pos = [
            Math.floor(Math.random() * 49) + 1,
            Math.floor(Math.random() * 49) + 1,
        ]
        this.putOnBoard(pos)
    },
    putOnBoard: function (pos) {
        if (isXinY(pos, snake.body) || isXinY(pos, game.level)) {
            this.generate();
        } else {
            this.position = pos;
        }
    },
    ateApple: function () {
        this.position = [];
        scores.addScore();
        game.applesEaten++;
    }
}

var bonus = {
    position: [],
    generate: function () {
        var pos = [
            Math.floor(Math.random() * 49) + 1,
            Math.floor(Math.random() * 49) + 1,
        ]
        this.putOnBoard(pos)
    },
    putOnBoard: function (pos) {
        if (isXinY(pos, snake.body) || isXinY(pos, game.level)) {
            this.generate();
        } else {
            this.position = pos;
        }
    },
    ateBonus: function () {
        this.position = [];
        game.applesEaten = 0;
        this.bonusEffect();
    },
    setInfo: function (bonus) {
        let elem = document.getElementById('activeBonus');
        elem.classList.add(bonus);
        elem.innerHTML = bonus;
    },
    removeInfo: function (bonus) {
        let elem = document.getElementById('activeBonus');
        elem.classList.remove(bonus);
        elem.innerHTML = '-';
    },
    bonusEffect: function() {
        var rand = Math.floor((Math.random() * 6.4) + 1)
        switch(rand) {
            case 1:
                scores.addScore(game.xFactor);
            break;
            case 2:
                game.penaltyLength = game.xFactor;
            break;
            case 3:
                for (i = 0; i < game.xFactor; i++) {
                    snake.body.pop();
                }
            break;
            case 4:
                game.bonus.ghost = true;
                this.setInfo('ghost')
                setTimeout(function () {
                    game.bonus.ghost = false;
                    bonus.removeInfo('ghost')
                }, 1000 * game.yFactor);
            break;
            case 5:
                this.setInfo('fast');
                stopCycle();
                startCycle(game.speed*0.7);
                setTimeout(function () {
                    stopCycle();
                    startCycle(game.speed);
                    bonus.removeInfo('fast')
                }, 1000 * game.yFactor);
            break;
            case 6:
                this.setInfo('slow');
                stopCycle();
                startCycle(game.speed * 1.5);
                setTimeout(function () {
                    stopCycle();
                    startCycle(game.speed);
                    bonus.removeInfo('slow')
                }, 1000 * game.yFactor);
            break;
        }
    },
}

var gameSettings = {
    speed: 100,
    level: levelOne(),
    xFactor: 3,
    yFactor: 3,
}

var game = {
    running: false,
    speed: null,
    level: [],
    xFactor: 0,
    yFactor: 0,
    penaltyLength: 0,
    applesEaten: 0,
    changedDirection: false,
    bonus: {
        ghost: false,
    },
    pause: function() {
        this.running = !this.running
    },
    over: function () {
        this.running = false;
        scores.updateHighScores();
        alert('Game Over. Press \'New game\' to start');
    },
    start: function () {
        stopCycle();
        game.speed = gameSettings.speed;
        game.level = gameSettings.level;
        game.xFactor = gameSettings.xFactor;
        game.yFactor = gameSettings.yFactor;
        game.applesEaten = 0;
        game.running = true;
        snake.body = [];
        snake.head = defaultHead;
        snake.direction = [1, 0];
        apple.position = [];
        bonus.position = [];
        scores.current = 0;
        scores.updateScore();

        startCycle(game.speed);
    }
}

function stopCycle() {
    clearInterval(cycle);
}

function startCycle(speed) {
    cycle = setInterval(function () {
        if (game.running) {
            step();
        }
    }, speed);
}

function isXinY(x, y) {
    var flag = false;
    y.forEach(function(elem) {
        if (elem[0] === x[0]
        && elem[1] === x[1]) {
            flag = true;
        }
    })
    return flag;
}

var scores = {
    current: 0,
    increment: 100,
    speedMultiplier: 1 * 100 / speed,
    levelMultiplier: 1,
    highscores: [],
    addScore: function (amount = 1) {
        this.current += this.increment * this.speedMultiplier * this.levelMultiplier * amount;
        this.current = Math.floor(this.current)
        this.updateScore();
    },
    updateScore: function () {
        document.getElementById('score').innerHTML = this.current;
    },
    deleteHighscoresList: function () {
        var ul = document.querySelector("ul#highscores");
        var li = ul.lastElementChild;
        while (li) {
            ul.removeChild(li);
            li = ul.lastElementChild;
        }
    },
    updateHighScores: function () {
        this.highscores.push(scores.current);
        this.deleteHighscoresList();
        this.highscores.sort(function (a, b) { return b - a });
        this.highscores = this.highscores.slice(0, 5);
        this.highscores.forEach(function (hs) {
            var li = document.createElement('li');
            var sc = document.createTextNode(hs);
            li.appendChild(sc);

            document.getElementById('highscores').appendChild(li)
        })
    }
}

var snake = {
    body: [],
    head: [19, 20],
    direction: [0, -1],
    outOfBounds: function (newHead) {
        if (this.head[0] > 49) { newHead[0] = 0 }
        if (this.head[0] < 0) { newHead[0] = 49 }
        if (this.head[1] > 49) { newHead[1] = 0 }
        if (this.head[1] < 0) { newHead[1] = 49 }
    },
    collisionWithSelf: function (newHead) {
        let flag = false;
        this.body.forEach(function (block) {
            if (block[0] === newHead[0]
                && block[1] === newHead[1]) {
                flag = true;
            }
        });
        return flag;
    },
    collisionWithMaze: function (newHead) {
        let flag = false;
        game.level.forEach(function (block) {
            if (block[0] === newHead[0]
                && block[1] === newHead[1]) {
                flag = true;
            }
        });
        return flag;
    }
}

function step() {
    if (!apple.position.length) { apple.generate() }
    if (!bonus.position.length && game.applesEaten >= bonusDelay) { bonus.generate() }
    //new head
    let newHead = [snake.head[0] + snake.direction[0], snake.head[1] + snake.direction[1]];
    if (!game.bonus.ghost &&
        (snake.collisionWithSelf(newHead) 
        || snake.collisionWithMaze(newHead))) {
        game.over();
        return;
    }
    snake.outOfBounds(newHead);
    //apple
    if (newHead[0] === apple.position[0]
        && newHead[1] === apple.position[1]) { 
        apple.ateApple();
    } else {
        if (game.penaltyLength > 0) {
            game.penaltyLength--;
        } else {
            snake.body.pop();
        }
    }
    //bonus
    if (newHead[0] === bonus.position[0]
        && newHead[1] === bonus.position[1]) {
        bonus.ateBonus();
    }
    snake.body.splice(0, 0, newHead);
    snake.head = newHead
    draw();
    game.changedDirection = false;
}

function draw() {
    var canvas = document.getElementById('snakeGame');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = 'forestgreen';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snake.body.forEach(function (element) {
            ctx.fillRect(element[0] * 10, element[1] * 10, 10, 10)
        })

        ctx.fillStyle = 'orange';
        ctx.fillRect(bonus.position[0] * 10, bonus.position[1] * 10, 10, 10)

        ctx.fillStyle = 'firebrick';
        ctx.fillRect(apple.position[0] * 10, apple.position[1] * 10, 10, 10)

        ctx.fillStyle = 'black'
        game.level.forEach(function (element) {
            ctx.fillRect(element[0] * 10, element[1] * 10, 10, 10)
        })
    }
}

document.addEventListener('keydown', function (e) {
    if (game.changedDirection == false) {
        switch (e.which) {
            case 40: 
                if (snake.direction[1]!==-1) {
                    snake.direction = [0, 1]
                } 
                game.changedDirection = true;
            break;
            case 37:
                if (snake.direction[0] !== 1) {
                    snake.direction = [-1, 0]
                }
                game.changedDirection = true;
            break;
            case 38:
                if (snake.direction[1] !== 1) {
                    snake.direction = [0, -1]
                }
                game.changedDirection = true;
            break;
            case 39:
                if (snake.direction[0] !== -1) {
                    snake.direction = [1, 0]
                }
                game.changedDirection = true;
            break;
        }
    }
});

//levels
function levelOne() {
    var maze = [];
    for (var i = 0; i <= 20; i++) {
        maze.push([i + 15, 24])
    }

    return maze;
}

function levelTwo() {
    var maze = [];
    for (var i = 0; i <= 29; i++) {
        maze.push([i + 9, 24])
    }
    for (var i = 0; i <= 30; i++) {
        maze.push([24, i + 9])
    }

    return maze;
}

function levelThree() {
    var maze = [];
    for (var i = 0; i <= 31; i++) {
        maze.push([i + 9, 9])
    }
    for (var i = 0; i <= 31; i++) {
        maze.push([41, i + 9])
    }
    for (var i = 0; i <= 31; i++) {
        maze.push([i + 9, 40])
    }
    for (var i = 0; i <= 26; i++) {
        maze.push([9, i + 9])
    }

    return maze;
}

function levelFour() {
    var maze = [];
    for (var i = 0; i <= 45; i++) {
        maze.push([i + 2, i + 2])
    }
    for (var i = 0; i <= 45; i++) {
        maze.push([47 - i, 2 + i])
    }
    for (var i = 0; i <= 50; i++) {
        maze.push([i, 0])
    }
    for (var i = 0; i <= 50; i++) {
        maze.push([0, i])
    }
    for (var i = 0; i <= 50; i++) {
        maze.push([49, i])
    }
    for (var i = 0; i <= 50; i++) {
        maze.push([i, 49])
    }

    return maze;
}

function levelFive() {
    var maze = [];
    for (var x = 0; x <= 16; x++) {
        for (var i = 0; i <= 16; i++) {
            maze.push([3*i, 3*x])
        }
    }
        
    return maze;
}

//settings
function setLevelInfo(lvl) {
    document.getElementById('levelInfo').innerHTML = lvl;
    document.getElementById('levelPointsInfo').innerHTML = scores.levelMultiplier;
}

function setLevel(level) {
    switch (level) {
        case 1:
            gameSettings.level = levelOne();
            scores.levelMultiplier = 1;
            setLevelInfo(1);
        break;
        case 2:
            gameSettings.level = levelTwo();
            scores.levelMultiplier = 1.5;
            setLevelInfo(2);
        break;
        case 3:
            gameSettings.level = levelThree();
            scores.levelMultiplier = 2;
            setLevelInfo(3);
        break;
        case 4:
            gameSettings.level = levelFour();
            scores.levelMultiplier = 3;
            setLevelInfo(4);
        break;
        case 5:
            gameSettings.level = levelFive();
            scores.levelMultiplier = 5;
            setLevelInfo(5);
        break;
    }
}

function setSpeed(newSpeed) {
    gameSettings.speed = newSpeed;
    scores.speedMultiplier = Math.round((100 / newSpeed)*10) / 10;
    speed = Math.floor(1000 / newSpeed);
    document.getElementById('speedInfo').innerHTML = speed;
    document.getElementById('speedPointsInfo').innerHTML = scores.speedMultiplier;
}

function setXfactor(x) {
    gameSettings.xFactor = x;
    document.getElementById('xInfo').innerHTML = x;
}
function setYfactor(y) {
    gameSettings.yFactor = y;
    document.getElementById('yInfo').innerHTML = y;
}