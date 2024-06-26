const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 2,
};

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            player.y -= player.speed;
            break;
        case 'ArrowDown':
            player.y += player.speed;
            break;
        case 'ArrowLeft':
            player.x -= player.speed;
            break;
        case 'ArrowRight':
            player.x += player.speed;
            break;
    }
});

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, 10, 10);
}

function gameLoop(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTerrain(terrain);
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
