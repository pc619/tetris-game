import Tetrominoes from "./tetrominoes.js";
import F from "./Functional.js";

const {compose, filter, deepCopy, transpose} = F;

const Grid = Object.create(null);


// Flatten and filter the zeros from tetromino matrix for manipulation.

const flatten = (matrix) => matrix.flat();
const filterZeros = filter((x) => x !== 0);
const flattenFilter = compose(filterZeros, flatten);

// Returning new grid with adjusted values

const adjustGrid = function (grid, arr) {
    arr.map(
        function (i) {
            grid[i.row][i.col] = i.value;
        }
    );
    return grid;
};

// Adjust tetromino on the grid (gameGrid).

Grid.adjustTetromino = function (grid, tetro) {
    const newGrid = deepCopy(grid);
    const newTetro = deepCopy(tetro);
    return adjustGrid(newGrid, flattenFilter(newTetro));
};

Grid.mutableAdjustTetromino = function (grid, tetro) {
    return adjustGrid(grid, flattenFilter(tetro));
};

// Adjust all elements on the grid (currentGrid).

Grid.adjustCurrentGrid = (grid, gameArray) => adjustGrid(grid, gameArray);

// Find collision

const findMaxIndex = function (total, currentElement, index) {
    const maxIndex = (
        currentElement === 0
        ? total
        : 19 - index + total - total - 1
    );
    console.log(maxIndex);
    return maxIndex;
};

const highestRowOccupiedInCol = function (grid, col) {
    const transposedGrid = transpose(deepCopy(grid));
    return transposedGrid[col].reverse().reduce(findMaxIndex, 19);
};

Grid.findCollisionLocation = function (grid, tetromino) {

    // Assuring Immutability through deep copying

    const compareGrid = deepCopy(grid);
    const compareTetro = deepCopy(flattenFilter(tetromino));
    console.log(compareTetro);

    // Finding the lowest difference

    const differenceArray = compareTetro.map(
        (cell) => highestRowOccupiedInCol(compareGrid, cell.col) - cell.row
    );

    differenceArray.sort();
    console.log(differenceArray);
    return Tetrominoes.collisionLocation(tetromino, differenceArray[0]);
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
    return {"value": cell, "col": cell.col, "row": cell.row + num};
};

// Function that finds how many elements in the array are bigger than it

const numOfRowsToLower = function (cell, fullRowsArray) {
    return fullRowsArray.reduce((total, fullRow) => (
        cell.row < fullRow
        ? total + 1
        : total
    ), 0);
};

// function that returns the new game array

Grid.removeFullRows = function (fullRowsArray, gameArray) {
    const newGameArray = gameArray.splice().map((cell) => (
        fullRowsArray.includes(cell.row)
        ? 0
        : reduceRow(cell, numOfRowsToLower(cell, fullRowsArray))
    ));

    return newGameArray;
};

// Lower the tetromino every second

const updateLowerTetromino = function (grid, tetromino) {
    tetromino = Tetrominoes.downPosChange(tetromino);
    grid = Grid.mutableAdjustTetromino(grid, tetromino);
    console.log(tetromino);
};

Grid.lowerTetromino = function (grid, tetromino) {
    setInterval(updateLowerTetromino, 5000, grid, tetromino);
};

// const gameArrayReal = [
//     {value: "0", "row": 0, "col": 0},
//     {value: "1", "row": 1, "col": 1},
//     {value: "2", "row": 2, "col": 2},
//     {value: "3", "row": 3, "col": 3},
//     {value: "4", "row": 4, "col": 4},
//     {value: "5", "row": 5, "col": 5},
//     {value: "6", "row": 6, "col": 6}
//     ];
export default Object.freeze(Grid);

