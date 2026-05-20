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

function updateHUD() {
    let vidaElement = document.getElementById('status-vida');
    if (vidaElement) vidaElement.innerText = `Vida: ${gameState.vida}`;
}
/*
let game;

function startGame() {
    gameState.vida = 100;
    updateHUD();

    showScreen('screen-mj2');

    if (game) {
        game.destroy(true);
    }

    const config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 600,
            parent: 'phaser-game-container'
        },
        backgroundColor: '#2b3e50',
        physics: {
            default: 'arcade',
            arcade: { debug: false }
        },
        scene: [ SceneMJ2 ]
    };

    game = new Phaser.Game(config);
}
*/
class SceneMJ2 extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMJ2' });
    }

    create() {
		this.physics.resume(); 

        this.runnerActive = true;
        this.currentLane = 1;

        const centerX = 400;
        const laneSpacing = 150;
        this.lanesX = [centerX - laneSpacing, centerX, centerX + laneSpacing];

        this.add.rectangle(this.lanesX[0], 300, 140, 600, 0x444444);
		this.add.rectangle(this.lanesX[1], 300, 140, 600, 0x555555);
		this.add.rectangle(this.lanesX[2], 300, 140, 600, 0x444444);

        this.player = this.add.rectangle(this.lanesX[this.currentLane], 450, 40, 40, 0x0088ff);
        this.physics.add.existing(this.player);
        this.player.body.setImmovable(true);

        this.obstaclesGroup = this.physics.add.group();

        this.input.keyboard.on('keydown-LEFT', () => {
            if (!this.runnerActive) return;
            if (this.currentLane > 0) {
                this.currentLane--;
                this.player.x = this.lanesX[this.currentLane];
            }
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            if (!this.runnerActive) return;
            if (this.currentLane < 2) {
                this.currentLane++;
                this.player.x = this.lanesX[this.currentLane];
            }
        });

        this.time.addEvent({
            delay: 1200,
            callback: this.createObstacle,
            callbackScope: this,
            loop: true
        });

        this.time.delayedCall(10000, () => {
            if (this.runnerActive) {
                this.runnerActive = false;
                this.physics.pause();
                alert("Has sobreviscut a la persecució!");
            }
        }, [], this);

        this.physics.add.overlap(this.player, this.obstaclesGroup, this.hitObstacle, null, this);
    }

    createObstacle() {
        if (!this.runnerActive) return;
        let lane = Phaser.Math.Between(0, 2);

        let obs = this.add.rectangle(this.lanesX[lane], -20, 60, 60, 0xffcc00);
        this.physics.add.existing(obs);
		this.obstaclesGroup.add(obs);
        obs.body.setVelocityY(400);
        obs.hasCollided = false;
    }

    hitObstacle(player, obstacle) {
        if (obstacle.hasCollided || !this.runnerActive) return;
        obstacle.hasCollided = true;
        obstacle.fillColor = 0xff0000;

        gameState.vida -= 10;
        updateHUD();

        if (gameState.vida <= 0) {
            this.runnerActive = false;
            this.physics.pause();

            this.time.delayedCall(1000, () => {
                gameState.vida = 100;
                updateHUD();
                this.scene.restart();
            });
        }
    }

    update() {
        this.obstaclesGroup.getChildren().forEach((obs) => {
            if (obs.y > 650) {
                obs.destroy();
            }
        });
    }
}