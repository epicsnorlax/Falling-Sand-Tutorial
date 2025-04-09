import { checkBounds, moveParticle, getParticle, setParticle } from "./canvas.js";
import { getRandomInt } from "./util.js";

/**
 * Base particle class
 */
class Particle {
    constructor() {
        this.color = "";
        this.type = "";
    }

    /**
     * Returns true if the particle should swap with other when trying
     * to move onto the same grid location as {@link other}.
     * 
     * EX: Let sand sink below water
     * 
     * @param {Particle} other 
     * @returns {boolean} Should the particle swap
     */
    swap(other) {
        return false;
    }

    /**
     * Update the particle at location (row, col)
     * 
     * @param {number} row 
     * @param {number} col 
     */
    update(row, col) {

    }
}

/**
 * Sand particle
 */
export class Sand extends Particle {
    constructor() {
        super();
        this.color = "orange";
        this.type = "sand";
    }

    swap(other) {
        // TODO make sand fall under the water
        return other.type == "water";

    }

    update(row, col) {
        // Fall due to gravity
        let newRow = row + 1;
    
        // If nothing below move down
        if (!moveParticle(row, col, newRow, col)) {
            // Try to move left
            if (!moveParticle(row, col, newRow, col-1, this.swap)) {
                
                moveParticle(row, col, newRow, col+1, this.swap)
            }
        }
    }
}


/**
 * Create particle based on dropdown name
 * 
 * @param {string} value 
 * @returns 
 */
export function checkParticleType(value) {
    if (value == "Sand") {
        return new Sand();
    } else if (value == "Water") {
        return new Water();
    } else if (value == "Ice") {
        return new Ice();
    } else if (value == "Fire") {
        return new Fire();
    } else if (value == "Wood") {
        return new Wood();
    } else if (value == "Stone") {
        return new Stone();
    } else if (value == "Dirt") {   
        return new Dirt();
    }
    return null;
}
/**
 * Wood particle
 */
export class Wood extends Particle {
    constructor() {
        super(); // Call the constructor of the Particle class
        this.color = "brown";
        this.type = "wood";
    }

    update(row, col) {
        // Check all adjacent cells for water and grow wood in empty spaces
        const directions = [
            [1, 0],  // Down
            [-1, 0], // Up
            [0, 1],  // Right
            [0, -1], // Left
        ];

        for (const [dRow, dCol] of directions) {
            const neighbor = getParticle(row + dRow, col + dCol);

            // If water is adjacent and the space is empty, grow wood
            if (neighbor?.type === "water") {
                const growDirections = directions.filter(([gRow, gCol]) => {
                    const growNeighbor = getParticle(row + gRow, col + gCol);
                    return !growNeighbor; // Check for empty space
                });

                for (const [gRow, gCol] of growDirections) {
                    setParticle(row + gRow, col + gCol, new Wood());
                }
            }
        }
    }
}
/**
 * Fire particle
 */
export class Fire extends Particle {
    constructor() {
        super(); // Call the constructor of the Particle class
        this.color = "red";
        this.type = "fire";
    }

    update(row, col) {
        // Check all adjacent cells for wood and remove it
        const directions = [
            [1, 0],  // Down
            [-1, 0], // Up
            [0, 1],  // Right
            [0, -1], // Left
        ];

        for (const [dRow, dCol] of directions) {
            const neighbor = getParticle(row + dRow, col + dCol);

            // If wood is adjacent, remove it
            if (neighbor?.type === "wood") {
                setParticle(row + dRow, col + dCol, null); // Remove wood
            }
        }
    }
}
/**
 * Ice particle
 */
export class Ice extends Particle {
    constructor() {
        super(); // Call the constructor of the Particle class
        this.color = "lightblue";
        this.type = "ice";
    }

    update(row, col) {
        // Check all adjacent cells for water and convert them to ice
        const directions = [
            [1, 0],  // Down
            [-1, 0], // Up
            [0, 1],  // Right
            [0, -1], // Left
        ];

        for (const [dRow, dCol] of directions) {
            const neighbor = getParticle(row + dRow, col + dCol);
            if (neighbor?.type === "water") {
                setParticle(row + dRow, col + dCol, new Ice());
            }
        }
    }
}
/**
 * Rock particle
 */
export class Stone extends Particle {
    constructor() {
        super(); // Call the constructor of the Particle class
        this.color = "gray";
        this.type = "stone";
    }
    // No update or swap needed!
}


/**
 * Dirt particle
 */
export class Dirt extends Sand {
    constructor() {
        super(); // Call the constructor of the Sand class
        this.color = "brown";
        this.type = "dirt";
    }
    // No update or swap needed! It inherits from Sand.
}

export class Water extends Particle {
    constructor() {
        super();
        this.color = "blue";
        this.type = "water";
    }

    update(row, col) {
        // Make water turn dirt into grass when it touches it
        if (getParticle(row + 1, col)?.type == "dirt") {
            // Remove water and change dirt to grass
            setParticle(row + 1, col, new Grass());
            setParticle(row, col, null);
            return;
        }

        // Remove fire when touched by water
        const directions = [
            [1, 0],  // Down
            [-1, 0], // Up
            [0, 1],  // Right
            [0, -1], // Left
        ];

        for (const [dRow, dCol] of directions) {
            const neighbor = getParticle(row + dRow, col + dCol);
            if (neighbor?.type === "fire") {
                setParticle(row + dRow, col + dCol, null); // Remove fire
                setParticle(row, col, null); // Remove water
                return;
            }
        }

        // If sand is dropped on water, let it sink
        if (getParticle(row + 1, col) && getParticle(row + 1, col).type == "sand") {
            moveParticle(row, col, row + 1, col, super.swap);
        }

        // Try to move down
        if (getRandomInt(0, 2) && !getParticle(row + 1, col)) {
            moveParticle(row, col, row + 1, col, super.swap);
        }

        // Move left or right
        if (getRandomInt(0, 1) && !getParticle(row, col + 1)) {
            moveParticle(row, col, row, col + 1, super.swap);
        }
        // Move diagonally left
        else if (getRandomInt(0, 1) && !getParticle(row + 1, col - 1)) {
            moveParticle(row, col, row + 1, col - 1, super.swap);
        }
        // Move diagonally right
        else if (getRandomInt(0, 1) && !getParticle(row + 1, col + 1)) {
            moveParticle(row, col, row + 1, col + 1, super.swap);
        }
        else if (!getParticle(row, col - 1)) {
            moveParticle(row, col, row, col - 1, super.swap);
        }
    }
}