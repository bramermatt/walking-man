document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const endButton = document.getElementById('endButton');
    const gameButtons = document.getElementById('gameButtons');

    let lastTime = 0;
    let gamePaused = false;
    let gameRunning = false;

    const scaleFactor = 4; // Scale factor to achieve blocky pixels
    const retroWidth = canvas.width / scaleFactor;
    const retroHeight = canvas.height / scaleFactor;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = retroWidth;
    offscreenCanvas.height = retroHeight;
    const offscreenCtx = offscreenCanvas.getContext('2d');

    const player = {
        x: retroWidth - 1, // Start at the rightmost edge
        y: retroHeight / 2,
        speed: 1,
        jumpHeight: 2.5, // Adjust jump height
        jumping: false,
        jumpCount: 0,
    };

    const viewport = {
        width: canvas.width,
        height: canvas.height,
    };

    const keys = {};
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    let obstacles = [];

    function generateTerrain(width, height) {
        const terrain = [];
        for (let x = 0; x < width; x++) {
            terrain[x] = [];
            for (let y = 0; y < height; y++) {
                // Adjust color based on position to create blue sky and green ground
                const color = (y < height / 2) ? '#87CEEB' : '#556B2F';
                terrain[x][y] = color;
            }
        }
        return terrain;
    }

    function generateObstacles() {
        obstacles = [];
        const numObstacles = 10; // Number of obstacles to generate

        for (let i = 0; i < numObstacles; i++) {
            const obstacleType = Math.random() < 0.5 ? 'square' : 'circle';
            const obstacleSize = Math.random() * 20 + 10; // Random size between 10 and 30

            // Random position within playable area
            const obstacleX = Math.random() * (retroWidth - obstacleSize);
            const obstacleY = retroHeight - 1 - Math.random() * (retroHeight / 2);

            obstacles.push({
                type: obstacleType,
                x: obstacleX,
                y: obstacleY,
                size: obstacleSize,
                color: '#FF6347', // Orange-red color for obstacles
                speed: 1, // Speed at which obstacles move (for scrolling effect)
            });
        }
    }

    function updateObstacles() {
        obstacles.forEach(obstacle => {
            obstacle.x -= obstacle.speed;

            // Wrap obstacles around when they go off-screen
            if (obstacle.x + obstacle.size < 0) {
                obstacle.x = retroWidth;
            }
        });
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            if (obstacle.type === 'square') {
                ctx.fillRect(obstacle.x * scaleFactor, obstacle.y * scaleFactor, obstacle.size * scaleFactor, obstacle.size * scaleFactor);
            } else if (obstacle.type === 'circle') {
                ctx.beginPath();
                ctx.arc((obstacle.x + obstacle.size / 2) * scaleFactor, (obstacle.y + obstacle.size / 2) * scaleFactor, obstacle.size / 2 * scaleFactor, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }

    function drawTerrain(terrain) {
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        for (let x = 0; x < terrain.length; x++) {
            for (let y = 0; y < terrain[x].length; y++) {
                const color = terrain[x][y];
                offscreenCtx.fillStyle = color;
                offscreenCtx.fillRect(x, y, 1, 1);
            }
        }
    }

    function updatePlayer() {
        // Handle player movement with "WASD" keys
        if (keys['w'] || keys['W']) {
            player.y -= player.speed;
        }
        if (keys['s'] || keys['S']) {
            player.y += player.speed;
        }
        if (keys['a'] || keys['A']) {
            player.x -= player.speed;
        }
        if (keys['d'] || keys['D']) {
            player.x += player.speed;
        }

        // Ensure player stays within terrain bounds
        player.x = Math.max(0, Math.min(retroWidth - 1, player.x));
        player.y = Math.max(0, Math.min(retroHeight - 1, player.y));

        // Handle player jumping with SPACEBAR
        if ((keys[' '] || keys['Space']) && !player.jumping && player.jumpCount < 2) {
            player.jumping = true;
            player.jumpCount++;
        }

        // Apply jump physics
        if (player.jumping) {
            player.y -= player.jumpHeight;
            if (player.y <= retroHeight / 4) {
                player.jumping = false;
            }
        } else {
            if (player.y < retroHeight - 1) {
                player.y += player.jumpHeight;
            }
        }

        // Reset jump count when player lands
        if (player.y >= retroHeight - 1) {
            player.jumpCount = 0;
        }
    }

    function drawPlayer() {
        const playerXInView = player.x * scaleFactor - viewport.width / 2;
        const playerYInView = player.y * scaleFactor - viewport.height / 2;

        // Ensure the player is within the terrain bounds when drawing
        const drawX = Math.min(Math.max(0, playerXInView), retroWidth * scaleFactor - viewport.width);
        const drawY = Math.min(Math.max(0, playerYInView), retroHeight * scaleFactor - viewport.height);

        ctx.drawImage(offscreenCanvas, drawX / scaleFactor, drawY / scaleFactor, viewport.width / scaleFactor, viewport.height / scaleFactor, 0, 0, canvas.width, canvas.height);
    }

    function drawCrosshair() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 2;
        const lineWidth = 1;

        ctx.strokeStyle = 'white';
        ctx.lineWidth = lineWidth;

        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX, centerY + size);
        ctx.stroke();

        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY);
        ctx.lineTo(centerX + size, centerY);
        ctx.stroke();
    }

    function gameLoop(timeStamp) {
        if (!gamePaused) {
            const deltaTime = timeStamp - lastTime;
            lastTime = timeStamp;

            // Update game objects
            updatePlayer();
            updateObstacles();

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw game objects
            drawTerrain(terrain);
            drawPlayer();
            drawObstacles();
            drawCrosshair(); // Draw the crosshair
        }

        if (gameRunning) {
            requestAnimationFrame(gameLoop);
        }
    }

    function startGame() {
        startButton.style.display = 'none';
        gameButtons.style.display = 'block';
        canvas.style.display = 'block';
        gameRunning = true;
        gamePaused = false;
        generateObstacles(); // Generate initial obstacles
        requestAnimationFrame(gameLoop);
    }

    function pauseGame() {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? 'Resume' : 'Pause';
    }

    function endGame() {
        gameRunning = false;
        gamePaused = false;
        startButton.style.display = 'block';
        gameButtons.style.display = 'none';
        canvas.style.display = 'none';
        pauseButton.textContent = 'Pause';
        player.x = retroWidth - 1; // Reset player position to the rightmost edge
        player.y = retroHeight / 2;
        obstacles = []; // Clear obstacles
    }

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    endButton.addEventListener('click', endGame);
});