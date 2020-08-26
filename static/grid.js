import Tetrominoes from "./tetrominoes.js";
import F from "./Functional.js";

const {compose, filter, deepCopy, transpose, flatten} = F;

const Grid = Object.create(null);

// -------------------------------------------------------------------------- //
// -------------- GRID MODULE -------------- //
// -------------------------------------------------------------------------- //

/**
 *
 * Defines the change in the game state.
 *
 * Handles:
 *      1. The changes to the grid with the current movements.
 *      2. The gameArray object which is an array holding all grid values and
 *         row and col locations.
 */


// Flatten and filter the zeros from tetromino matrix for manipulation.

Grid.zerosGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const filterZeros = filter((x) => x !== 0);
const flattenFilter = compose(filterZeros, flatten);

// Returning new grid with adjusted values

const adjustGrid = function (grid, arr) {
    const newGrid = deepCopy(grid);
    const newArr = deepCopy(arr);
    newArr.map(
        function (i) {
            newGrid[i.row][i.col] = i.value;
        }
    );
    return newGrid;
};

// Adjust tetromino on the grid (gameGrid).

Grid.adjustTetromino = function (grid, tetro) {
    const newTetro = deepCopy(tetro);
    return adjustGrid(grid, flattenFilter(newTetro));
};

// Adjust all elements on the grid (currentGrid).

Grid.adjustCurrentGrid = (grid, gameArray) => adjustGrid(grid, gameArray);

// Check if the game is over

Grid.gameOver = function (tetromino, gameArray) {
    return (
        Tetrominoes.intersection(tetromino, gameArray) === 1
        ? 1
        : 0
    );
}

// Find collision

const findMaxIndex = function (total, currentElement, index) {
    const maxIndex = (
        currentElement === 0
        ? total
        : 19 - index + total - total - 1
    );
    return maxIndex;
};

const highestRowOccupiedInCol = function (grid, col, row) {
    const transposedGrid = transpose(deepCopy(grid).slice(row));
    return transposedGrid[col].reverse().reduce(findMaxIndex, 19);
};

Grid.findCollisionLocation = function (grid, tetromino) {

    // Assuring Immutability through deep copying

    const compareGrid = deepCopy(grid);
    const compareTetro = deepCopy(flattenFilter(tetromino));

    // Finding the lowest difference

    const differenceArray = compareTetro.map(
        (cell) => highestRowOccupiedInCol(
            compareGrid,
            cell.col,
            cell.row
        ) - cell.row
    );

    differenceArray.sort((a, b) => a - b);
    return Tetrominoes.collisionLocation(tetromino, differenceArray[0]);
};

Grid.hardDrop = function (currentTetromino, grid, ...ignore) {
    return Grid.findCollisionLocation(grid, currentTetromino);
};

// Check and return the rows that are full

const checkForFullRows = (grid) => grid.map((row) => (
    row.includes(0)
    ? 0
    : 1
));

const addFullRows = function (total, currentElement, index) {
    const newTotal = (
        currentElement === 1
        ? total.concat([index])
        : total
    );
    return newTotal;
};

const getAllFullRows = (array) => array.reduce(addFullRows, []);

Grid.fullRows = compose(getAllFullRows, checkForFullRows);

// Move everything downward

const reduceRow = function (cell, num) {
    return {"value": cell.value, "col": cell.col, "row": cell.row + num};
};

// Function that finds how many elements in the array are bigger than it

const numOfRowsToLower = function (cell, fullRowsArray) {
    return deepCopy(fullRowsArray).reduce((total, fullRow) => (
        cell.row < fullRow
        ? total + 1
        : total
    ), 0);
};

// function that returns the new game array

Grid.lowerAfterFullRows = function (fullRowsArray, gameArray) {
    const newGameArray = deepCopy(gameArray).map((cell) => (
        fullRowsArray.includes(cell.row)
        ? 0
        : reduceRow(cell, numOfRowsToLower(cell, fullRowsArray))
    ));
    return filterZeros(newGameArray);
};

Grid.removeFullRows = function (fullRowsArray, gameArray) {
    const newGameArray = deepCopy(gameArray).map((cell) => (
        fullRowsArray.includes(cell.row)
        ? 0
        : cell
    ));
    return filterZeros(newGameArray);
};

// Add to game Array

Grid.addToGameArray = function (gameArray, currentTetro) {
    const flattenedTetro = flattenFilter(currentTetro);
    return gameArray.concat(flattenedTetro);
};


export default Object.freeze(Grid);

