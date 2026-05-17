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

// --- MJ1: INVESTIGACIÓ ---
function startGame() {
    showScreen('screen-mj1');
    gameState.temps = 15;
    const area = document.getElementById('area-recerca');

    // Crear pistes aleatòries (Repte Atòmic: Clicar) [cite: 327]
    for(let i=0; i<3; i++) {
        let p = document.createElement('div');
        p.className = 'pista-obj';
        p.style.left = Math.random() * 700 + 'px';
        p.style.top = Math.random() * 300 + 'px';
        p.onclick = () => collectPista(i);
        area.appendChild(p);
    }

    let timer = setInterval(() => {
        gameState.temps--;
        document.getElementById('status-temps').innerText = `Temps: ${gameState.temps}`;
        if (gameState.pistes.length === 3 || gameState.temps <= 0) {
            clearInterval(timer);
            startMJ2();
        }
    }, 1000);
}

function collectPista(id) {
    gameState.pistes.push({ id: id, modificada: false, desc: `Prova real #${id+1}` });
    updateInventory();
    event.target.remove();
}

function updateInventory() {
    const list = gameState.pistes.map(p => p.desc).join(', ');
    document.getElementById('pistes-list').innerText = list || 'Cap';
}

// Noves variables per al MJ2
let currentLane = 1; // 0: Esquerra, 1: Centre, 2: Dreta
let runnerActive = false;

function startMJ2() {
    showScreen('screen-mj2');
    runnerActive = true;

    // Control de moviment (Repte Atòmic: Córrer/Canviar carril)
    window.addEventListener('keydown', (e) => {
        if (!runnerActive) return;
        if (e.key === 'ArrowLeft' && currentLane > 0) currentLane--;
        if (e.key === 'ArrowRight' && currentLane < 2) currentLane++;

        // Actualitzar posició visual (carrils de 100px)
        document.getElementById('player-runner').style.left = (currentLane * 100 + 30) + "px";
    });

    // Generador d'obstacles (Bucle Primari MJ2 )
    let obstacleInterval = setInterval(() => {
        if (!runnerActive) {
            clearInterval(obstacleInterval);
            return;
        }
        createObstacle();
    }, 1500);

    // Temps de joc per al Runner
    setTimeout(() => {
        runnerActive = false;
        alert("Has sobreviscut a la persecució!");
        startMJ3(); // Passem al següent minijoc
    }, 10000); // 10 segons de durada
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

        // Detecció de col·lisió (Drenador: -Vida )
        if (pos > 320 && pos < 380 && lane === currentLane) {
            gameState.vida -= 10;
            document.getElementById('status-vida').innerText = `Vida: ${gameState.vida}`;
            obs.style.backgroundColor = "red"; // Feedback visual de col·lisió
            if (gameState.vida <= 0) location.reload(); // Game Over [cite: 115]
        }

        if (pos > 450) {
            clearInterval(anim);
            obs.remove();
        }
    }, 20);
}


let pistesSeleccionades = [];
let provesGenerades = [];

function startMJ3() {
    showScreen('screen-mj3');
    const llista = document.getElementById('llista-pistes-mj3');
    llista.innerHTML = "";
    pistesSeleccionades = [];

    // Mostrem les pistes que hem recollit al MJ1
    gameState.pistes.forEach((pista, index) => {
        let card = document.createElement('div');
        card.className = 'pista-card';
        card.innerText = pista.desc;
        card.onclick = () => seleccionarPerComparar(pista, card);
        llista.appendChild(card);
    });
}

function seleccionarPerComparar(pista, element) {
    if (pistesSeleccionades.length < 2 && !pistesSeleccionades.includes(pista)) {
        pistesSeleccionades.push(pista);
        element.classList.add('selected');
        document.getElementById(`slot-${pistesSeleccionades.length}`).innerText = pista.desc;
    }
}

function compararPistes() {
    if (pistesSeleccionades.length === 2) {
        // Bucle Secundari: Transformar pistes en proves
        let novaProva = {
            id: Date.now(),
            desc: `PROVA IRREFUTABLE: ${pistesSeleccionades[0].id + 1} + ${pistesSeleccionades[1].id + 1}`
        };
        provesGenerades.push(novaProva);
        alert("Has generat una prova sòlida per al debat!");

        startMJ4();
    } else {
        alert("Selecciona dues pistes per comparar-les.");
    }
}

// --- MJ4: DEBAT ---
function startMJ4() {
    showScreen('screen-mj4');
    const container = document.getElementById('opcions-debat');
    container.innerHTML = "";

    // Presentar proves de l'inventari (Bucle Primari MJ4)
    provesGenerades.forEach(pista => {
        let btn = document.createElement('button');
        btn.className = "btn";
        btn.style.margin = "5px";
        btn.innerText = `Presentar: ${pista.desc}`;
        btn.onclick = () => {
            alert("Has convençut el públic! [cite: 32]");
            startMJ5();
        };
        container.appendChild(btn);
    });
}

// --- MJ5: BOSS FIGHT ---
function startMJ5() {
    showScreen('screen-mj5');
    // Listener de tecles per atacar
    window.addEventListener('keydown', (e) => {
        if (e.key === 'a' || e.key === 'A') {
            gameState.bossVida -= 5;
            document.getElementById('boss-hp-fill').style.width = gameState.bossVida + "%";

            if (gameState.bossVida <= 0) {
                alert("VICTÒRIA! IA derrotada. [cite: 365]");
                location.reload();
            }
        }
    });
}