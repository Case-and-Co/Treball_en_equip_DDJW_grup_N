let gameState = {
    vida: 100,
    pistes: [],
    temps: 15,
    bossVida: 100
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

let currentLane = 1; // 0: Esquerra, 1: Centre, 2: Dreta
let runnerActive = false;

function startMJ2() {
    showScreen('screen-mj2');
    runnerActive = true;

    window.addEventListener('keydown', (e) => {
        if (!runnerActive) return;
        if (e.key === 'ArrowLeft' && currentLane > 0) currentLane--;
        if (e.key === 'ArrowRight' && currentLane < 2) currentLane++;

        document.getElementById('player-runner').style.left = (currentLane * 100 + 30) + "px";
    });

    let obstacleInterval = setInterval(() => {
        if (!runnerActive) {
            clearInterval(obstacleInterval);
            return;
        }
        createObstacle();
    }, 1500);

    setTimeout(() => {
        runnerActive = false;
        alert("Has sobreviscut a la persecució!");
        startMJ3();
    }, 10000);
}

function createObstacle() {
    const container = document.getElementById('runner-lane-container');
    const obs = document.createElement('div');
    const lane = Math.floor(Math.random() * 3);

    obs.className = 'obstacle';
    obs.style.left = (lane * 100 + 30) + "px";
    container.appendChild(obs);

    let pos = 0;
    let anim = setInterval(() => {
        pos += 5;
        obs.style.top = pos + "px";

        if (pos > 320 && pos < 380 && lane === currentLane) {
            gameState.vida -= 10;
            document.getElementById('status-vida').innerText = `Vida: ${gameState.vida}`;
            obs.style.backgroundColor = "red";
            if (gameState.vida <= 0) location.reload();
        }

        if (pos > 450) {
            clearInterval(anim);
            obs.remove();
        }
    }, 20);
}