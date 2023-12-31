export class Mob {
    constructor(startingPosition) {
        this.position = startingPosition;
        this.speed = 0.015;
        this.direction = 'right';
        this.size = 0.15;

        // bounding box
        this.left = this.position.x;
        this.right = this.position.x + this.size;
        this.top = this.position.z - this.size;
        this.bottom = this.position.z + this.size;
    }

    move(wall_array) {
        // Calculate the next position based on the direction and speed
        let nextX = this.position.x;
        let nextZ = this.position.z;

        switch (this.direction) {
            case 'up':
                nextZ -= this.speed; // Calculate the next z-coordinate for moving up
                break;
            case 'down':
                nextZ += this.speed; // Calculate the next z-coordinate for moving down
                break;
            case 'left':
                nextX -= this.speed; // Calculate the next x-coordinate for moving left
                break;
            case 'right':
                nextX += this.speed; // Calculate the next x-coordinate for moving right
                break;
            default:
                break;
        }

        // Check for collisions with walls using the wall array
        let mobLeft, mobRight, mobTop, mobBottom;
        let collided = false;
        for (let i = 0; i < wall_array.length; i++) {
            let wallX = wall_array[i][0]; // x-coordinate of the wall
            let wallZ = wall_array[i][1]; // z-coordinate of the wall

            // Calculate bounds based on direction
            switch (this.direction) {
                case 'up':
                    mobLeft = nextX - this.size;
                    mobRight = nextX + this.size;
                    mobTop = nextZ - this.size;
                    mobBottom = nextZ;
                    break;
                case 'down':
                    mobLeft = nextX - this.size;
                    mobRight = nextX + this.size;
                    mobTop = nextZ;
                    mobBottom = nextZ + this.size;
                    break;
                case 'left':
                    mobLeft = nextX - this.size;
                    mobRight = nextX;
                    mobTop = nextZ - this.size;
                    mobBottom = nextZ + this.size;
                    break;
                case 'right':
                    mobLeft = nextX;
                    mobRight = nextX + this.size;
                    mobTop = nextZ - this.size;
                    mobBottom = nextZ + this.size;
                    break;
                default:
                    break;
            }

            // Calculate bounds for the wall
            let wallLeft = wallX - 0.5;
            let wallRight = wallX + 0.5;
            let wallTop = wallZ - 0.5;
            let wallBottom = wallZ + 0.5;

            // Check if the mob's bounds intersect with any wall
            if (mobLeft < wallRight && mobRight > wallLeft && mobTop < wallBottom && mobBottom > wallTop) {
                collided = true;
                break; // Exit the loop if collision detected
            }
        }

        // If collision detected, choose a random direction
        if (collided) {
            const directions = ['up', 'down', 'left', 'right'];
            // Select a random direction
            this.direction = directions[Math.floor(Math.random() * directions.length)];
        } else {
            // If no collision, update the mob's position
            this.position.x = nextX;
            this.position.z = nextZ;
            // Update the bounding box
            this.left = mobLeft;
            this.right = mobRight;
            this.top = mobTop;
            this.bottom = mobBottom;
        }
    }

    getPosition() {
        return this.position; // Return the current position of the mob
    }

    getDirection() {
        return this.direction; // Return the current direction of the mob
    }
}