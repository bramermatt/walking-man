// Include perlin.js or similar library in your project
const noise = new Noise(Math.random());

function generateTerrain(width, height) {
    const terrain = [];
    for (let x = 0; x < width; x++) {
        terrain[x] = [];
        for (let y = 0; y < height; y++) {
            const value = noise.simplex2(x / 100, y / 100);
            terrain[x][y] = value;
        }
    }
    return terrain;
}

const terrain = generateTerrain(canvas.width, canvas.height);

function drawTerrain(terrain) {
    for (let x = 0; x < terrain.length; x++) {
        for (let y = 0; y < terrain[x].length; y++) {
            const value = terrain[x][y];
            const color = `rgb(${(value + 1) * 128}, ${(value + 1) * 128}, ${(value + 1) * 128})`;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function gameLoop(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTerrain(terrain);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
