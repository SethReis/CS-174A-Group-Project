export class Maze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.maze = this.initializeMaze();
        this.generateMaze();
    }

    initializeMaze() {
        let maze = [];
        for (let i = 0; i < this.rows; i++) {
            maze[i] = [];
            for (let j = 0; j < this.cols; j++) {
                maze[i][j] = 'X';
            }
        }
        // enforce the entrance and exit
        maze[0][0] = 'O';
        maze[this.rows - 1][this.cols - 1] = 'O';
        maze[this.rows - 2][this.cols - 1] = 'O';
        maze[this.rows - 1][this.cols - 2] = 'O';
        return maze;
    }

    generateMaze() {
        let stack = [];
        let currentCell = { row: 0, col: 0 };

        this.maze[currentCell.row][currentCell.col] = 'O';
        stack.push(currentCell);

        while (stack.length > 0) {
            let cell = stack.pop();
            let neighbors = this.getUnvisitedNeighbors(cell);

            if (neighbors.length > 0) {
                stack.push(cell);

                let nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.removeWall(cell, nextCell);

                this.maze[nextCell.row][nextCell.col] = 'O';
                stack.push(nextCell);
            }
        }
    }

    getUnvisitedNeighbors(cell) {
        let neighbors = [];
        let directions = [[0, -2], [-2, 0], [0, 2], [2, 0]]; // two steps in each direction

        for (let [dr, dc] of directions) {
            let newRow = cell.row + dr;
            let newCol = cell.col + dc;

            if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols && this.maze[newRow][newCol] === 'X') {
                neighbors.push({ row: newRow, col: newCol });
            }
        }

        return neighbors;
    }

    removeWall(cell1, cell2) {
        let dRow = (cell2.row - cell1.row) / 2;
        let dCol = (cell2.col - cell1.col) / 2;

        this.maze[cell1.row + dRow][cell1.col + dCol] = 'O';
    }

    getGrid() {
        let grid = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.maze[i][j] === 'X') {
                    grid.push([i, j]);
                }
            }
        }
        return grid;
    }

    getAntiGrid(grid) {
        let antiGrid = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!grid.includes([i, j]))
                    antiGrid.push([i, j]);
            }
        }
        antiGrid.splice(0, 1); // remove the entrance
        return antiGrid;
    }
}