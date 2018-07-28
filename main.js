const readline = require('readline');
const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

// read instructions from stdin
io.on('line', (line) => {
    let instructions = String(line).split(''); // convert input to char array
    let photos = executeInstructions(instructions); // execute the drone instructions
    let photoCounts = getPhotoCounts(photos).filter(({ count }) => count > 1).sort((x, y) => y.count - x.count); // count & sort photos
    let summaryLines = getPhotoCountSummary(photoCounts); // generate report
    summaryLines.forEach((str) => process.stdout.write(str)); // print to stdout
});

/**
 * Calculate the next position based on the current position and a given instruction
 */
function delta({ x, y, instruction }) {
    switch (instruction) {
        case '^': // north
            --y;
            break;
        case 'v': // south
            ++y;
            break;
        case '>': // east
            ++x;
            break;
        case '<': // west
            --x;
            break;
    }
    return { x, y };
}

/**
 * Executes an array of drone instructions
 * @returns array of photo coordinates
 */
function executeInstructions(instructions) {
    let { photos } = instructions.reduce(({ x, y, direction, photos }, instruction) => { // compute instructions
        if (instruction === 'x') { // photograph!
            // use the current orientation of the drone (direction) to determine where the object in the photograph is!!
            photos.push(delta({ x, y, direction }));
        } else {
            var { x, y } = delta({ x, y, instruction });
        }
        return { x, y, direction: instruction, photos };
    }, { x: 0, y: 0, direction: '^', photos: [] });
    return photos;
}

/**
 * Lookup and count photos taken
 */
function getPhotoCounts(photos) {
    return [...photos.reduce((map, { x, y }) => {
        let key = [x, y].join('|');
        if (map.has(key)) {
            map.get(key).count++
        } else {
            map.set(key, { x, y, count: 1 });
        }
        return map;
    }, new Map()).values()];
}

const getPhotoCountSummary = (photoCounts) => photoCounts.map(({ x, y, count }) => `[${x}km, ${y}km]\t${count} photo${count !== 1 ? 's' : ''}\n`);