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
		
		gameState.temps = 30;
        gameState.bossVida = 100;

        const centerX = 400;
        const laneSpacing = 150;
        this.lanesX = [centerX - laneSpacing, centerX, centerX + laneSpacing];

        this.add.rectangle(this.lanesX[0], 300, 140, 600, 0x444444);
		this.add.rectangle(this.lanesX[1], 300, 140, 600, 0x555555);
		this.add.rectangle(this.lanesX[2], 300, 140, 600, 0x444444);
		
		this.timeText = this.add.text(20, 20, 'Temps: ' + gameState.temps, { fontSize: '24px', fill: '#ffffff' });
        this.bossHpText = this.add.text(600, 20, 'Boss HP: ' + gameState.bossVida, { fontSize: '24px', fill: '#ff0000', fontStyle: 'bold' });

        this.player = this.add.rectangle(this.lanesX[this.currentLane], 450, 40, 40, 0x0088ff);
        this.physics.add.existing(this.player);
        this.player.body.setImmovable(true);
		
		this.boss = this.add.rectangle(this.lanesX[1], 80, 100, 100, 0xcc0000);
        this.physics.add.existing(this.boss);
		this.boss.body.setImmovable(true);

        this.obstaclesGroup = this.physics.add.group();
		this.bulletsGroup = this.physics.add.group();

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
		
		this.input.keyboard.on('keydown-SPACE', () => {
            this.shoot();
        });
		
		this.input.keyboard.on('keydown-ESC', () => {
            if (this.runnerActive) {
                this.scene.pause();
                this.scene.launch('PauseMenu');
            }
        });

        this.time.addEvent({
            delay: 1200,
            callback: this.createObstacle,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
		
		this.time.addEvent({
            delay: 800,
            callback: this.moureBoss,
            callbackScope: this,
            loop: true
        });
		
		this.physics.add.overlap(this.player, this.obstaclesGroup, this.hitObstacle, null, this);
		this.physics.add.overlap(this.bulletsGroup, this.obstaclesGroup, this.bulletHitObstacle, null, this);
		this.physics.add.overlap(this.bulletsGroup, this.boss, this.bulletHitBoss, null, this);
    }
	
	moureBoss() {
        if (!this.runnerActive) return;
        let carrilAleatori = Phaser.Math.Between(0, 2);
        this.tweens.add({
            targets: this.boss,
            x: this.lanesX[carrilAleatori],
            duration: 300,
            ease: 'Power1'
        });
    }
	
    createObstacle() {
       /* if (!this.runnerActive) return;
        let lane = Phaser.Math.Between(0, 2);

        let obs = this.add.rectangle(this.lanesX[lane], -20, 60, 60, 0xffcc00);
        this.physics.add.existing(obs);
		this.obstaclesGroup.add(obs);
        obs.body.setVelocityY(400);
        obs.hasCollided = false;*/
		if (!this.runnerActive) return;
        let obs = this.add.rectangle(this.boss.x, this.boss.y + 50, 60, 60, 0xffcc00);
        this.obstaclesGroup.add(obs);
        obs.body.setVelocityY(400);
        obs.hasCollided = false;
    }
	
	shoot() {
        if (!this.runnerActive) return;
        let bullet = this.add.rectangle(this.player.x, this.player.y - 30, 8, 20, 0xffffff);
        this.bulletsGroup.add(bullet);
        bullet.body.setVelocityY(-600);
    }
	
	bulletHitObstacle(bullet, obstacle) {
        bullet.destroy();
    }
	
	bulletHitBoss(boss, bullet) {
        bullet.destroy();
        if (!this.runnerActive) return;
        gameState.bossVida -= 10;
        this.bossHpText.setText('Boss HP: ' + gameState.bossVida);
        boss.fillColor = 0xffffff;
        this.time.delayedCall(100, () => { boss.fillColor = 0xcc0000; });
        if (gameState.bossVida <= 0) {
            this.runnerActive = false;
            this.physics.pause();
            alert("VICTÒRIA! Has derrotat la IA!");
            this.scene.start('MainMenu');
        }
    }
	
    hitObstacle(player, obstacle) {
        if (obstacle.hasCollided || !this.runnerActive) return;
        obstacle.hasCollided = true;
        obstacle.fillColor = 0xff0000;

        this.morir();
    }
	
	updateTimer() {
        if (!this.runnerActive) return;
        gameState.temps--;
        this.timeText.setText('Temps: ' + gameState.temps);

        if (gameState.temps <= 0) {
            this.morir("La IA ha escapat!");
        }
    }
	
	morir(motiu = "Has xocat amb un obstacle!") {
        if (!this.runnerActive) return;
        
        this.runnerActive = false;
        this.physics.pause();
        alert("GAME OVER: " + motiu);

        this.time.delayedCall(1000, () => {
            this.scene.restart();
        });
    }

    update() {
        this.obstaclesGroup.getChildren().forEach((obs) => {
            if (obs.y > 650) {
                obs.destroy();
            }
        });
    }
}