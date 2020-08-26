import Grid from "./grid.js";
import Tetrominoes from "./tetrominoes.js";
import F from "./Functional.js";

const ui = Object.create(null);

const el = (id) => document.getElementById(id);

const {flattenFilter, deepCopy} = F;

let currentGrid = Grid.zerosGrid;

let gameGrid = Grid.zerosGrid;

let gameArray = [];

let currentTetromino = [];

let collisionLocation = [];

// Box width
const bw = 300;

// Box height
const bh = 600;

const canvas = el("map");
const context = canvas.getContext("2d");


const drawBoard = function () {
    context.beginPath();
    let x = 0;
    while (x <= bw) {
        let y = 0;
        while (y <= bh) {
            roundRect(x, y, bw / 10, bh / 20, 3);
            context.strokeStyle = "#444444";
            context.lineJoin = "round";
            context.lineWidth = 1;
            context.fillStyle = "#111111";
            context.stroke();
            context.fill();
            y = y + bh / 20;
        }
        x = x + bw / 10;
    }
};


const roundRect = function (x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
};

const colorBox = function (value, rowIndex, colIndex) {
    if (value !== 0) {
        context.beginPath();
        roundRect(
            (colIndex * bw / 10) + 1.5,
            (rowIndex * bh / 20) + 1.5,
            (bw / 10) - 3,
            (bh / 20) - 3,
            3
        );
        context.fillStyle = Tetrominoes.style[value - 1].color;
        context.strokeStyle = "white";
        context.lineJoin = "round";
        context.lineWidth = 1;
        context.fill();
        context.stroke();
    }
};

const drawGrid = function (grid) {
    grid.forEach(
        (row, rowIndex) => row.forEach(
            (el, colIndex) => colorBox(el, rowIndex, colIndex)
        )
    );
};

const clearGrid = function () {
    context.clearRect(0, 0, bw, bh);
    drawBoard();
};

const drawCollisionCell = function (rowIndex, colIndex, value) {
    context.beginPath();
    roundRect(
        (colIndex * bw / 10) + 1.5,
        (rowIndex * bh / 20) + 1.5,
        (bw / 10) - 3,
        (bh / 20) - 3,
        3
    );
    context.fillStyle = "transparent";
    context.strokeStyle = Tetrominoes.style[value - 1].border;
    context.lineJoin = "round";
    context.lineWidth = 1;
    context.fill();
    context.stroke();
};

const drawCollision = function (collisionLoc) {
    const flattened = flattenFilter(deepCopy(collisionLoc));
    flattened.forEach(
        (el) => drawCollisionCell(el.row, el.col, el.value)
    );
};

ui.init = function () {
    drawBoard();

    currentTetromino = Tetrominoes.new(10);
    gameGrid = Grid.adjustTetromino(currentGrid, currentTetromino);
    drawGrid(gameGrid);

    collisionLocation = Grid.findCollisionLocation(
        currentGrid,
        currentTetromino
    );

    drawCollision(collisionLocation);

    document.body.onkeydown = function (event) {
        const keyActions = {
            "ArrowUp": Tetrominoes.legalRotate,
            "ArrowDown": Tetrominoes.legalDownPosChange,
            "ArrowLeft": Tetrominoes.legalLeftPosChange,
            "ArrowRight": Tetrominoes.legalRightPosChange,
            " ": Grid.hardDrop
        };
        const move = keyActions[event.key] || F.identity;

        currentTetromino = move(currentTetromino, currentGrid, 10, gameArray);
        gameGrid = Grid.adjustTetromino(currentGrid, currentTetromino);
        clearGrid();

        collisionLocation = Grid.findCollisionLocation(
            currentGrid,
            currentTetromino
        );

        drawCollision(collisionLocation);
        drawGrid(gameGrid);

        if (move===Grid.hardDrop) {
            checkForCollision();
        }

    };

    gameIntervalFunc();
    gameOverIntervalFunc();


};

const goDown = function () {
    currentTetromino = Tetrominoes.legalDownPosChange(
        currentTetromino,
        0,
        10,
        gameArray
    );

    gameGrid = Grid.adjustTetromino(currentGrid, currentTetromino);
    clearGrid();
    drawCollision(collisionLocation);
    drawGrid(gameGrid);
};


const checkForCollision = function () {
    console.log("one round");
    if (JSON.stringify(currentTetromino) === JSON.stringify(collisionLocation)){
        gameArray = Grid.addToGameArray(gameArray, currentTetromino);
        currentTetromino = [];
        currentGrid = Grid.adjustCurrentGrid(Grid.zerosGrid, gameArray);
        clearGrid();
        drawGrid(currentGrid);

        const fullRowsArray = Grid.fullRows(currentGrid);

        if (fullRowsArray.length !== 0) {
            const prevGameArray = gameArray;
            gameArray = Grid.removeFullRows(fullRowsArray, gameArray);

            currentGrid = Grid.adjustCurrentGrid(Grid.zerosGrid, gameArray);

            clearGrid();
            drawGrid(currentGrid);

            gameArray = Grid.lowerAfterFullRows(
                fullRowsArray,
                prevGameArray
            );

            setTimeout(function () {
                currentGrid = Grid.adjustCurrentGrid(Grid.zerosGrid, gameArray);
                currentTetromino = Tetrominoes.new(10);
                gameGrid = Grid.adjustTetromino(currentGrid, currentTetromino);
                collisionLocation = Grid.findCollisionLocation(
                    currentGrid,
                    currentTetromino
                );
                clearGrid();
                drawGrid(gameGrid);
                drawCollision(collisionLocation);
            }, 250);

        } else {
            currentTetromino = Tetrominoes.new(10);
            if (Grid.gameOver(currentTetromino, gameArray) === 1) {
                console.log("game over losa!");
            }
            gameGrid = Grid.adjustTetromino(currentGrid, currentTetromino);
            drawGrid(gameGrid);

            collisionLocation = Grid.findCollisionLocation(
                currentGrid,
                currentTetromino
            );

            drawCollision(collisionLocation);
        }
    } else {
        goDown();
    }

};

const gameIntervalFunc  = () => setInterval(checkForCollision, 1000);

const gameOverIntervalFunc  = () => setInterval(function () {
    if (Grid.gameOver(currentTetromino, gameArray) === 1) {
        console.log("game over losa!");
        window.location.reload(true);
    }
}, 1000);



ui.init();

export default Object.freeze(ui);
