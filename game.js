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

        this.cameras.main.setBackgroundColor('#0b0f19');

        this.add.rectangle(this.lanesX[0], 300, 145, 600, 0x111827);
        this.add.rectangle(this.lanesX[1], 300, 145, 600, 0x1f2937);
        this.add.rectangle(this.lanesX[2], 300, 145, 600, 0x111827);

        this.linesGroup = this.add.group();
        for (let i = 0; i < 5; i++) {
            let line1 = this.add.rectangle(centerX - 75, i * 150, 4, 60, 0x00e5ff);
            let line2 = this.add.rectangle(centerX + 75, i * 150, 4, 60, 0x00e5ff);
            this.linesGroup.add(line1);
            this.linesGroup.add(line2);
        }

        let graphics = this.make.graphics({x: 0, y: 0, add: false});
        graphics.fillStyle(0x00e5ff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('glow-particle', 8, 8);

        this.trail = this.add.particles(0, 0, 'glow-particle', {
            speed: { min: 50, max: 150 },
            angle: { min: 80, max: 100 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            frequency: 30
        });

        this.timeText = this.add.text(20, 20, 'Temps: ' + gameState.temps, { fontSize: '24px', fill: '#00e5ff', fontFamily: 'monospace', fontStyle: 'bold' });
        this.bossHpText = this.add.text(600, 20, 'Boss HP: ' + gameState.bossVida, { fontSize: '24px', fill: '#ff0055', fontFamily: 'monospace', fontStyle: 'bold' });

        this.player = this.add.rectangle(this.lanesX[this.currentLane], 450, 40, 40, 0x0088ff);
        this.physics.add.existing(this.player);
        this.player.body.setImmovable(true);
        this.trail.startFollow(this.player, 0, 35);

        this.boss = this.add.rectangle(this.lanesX[1], 80, 100, 100, 0xff0055);
        this.physics.add.existing(this.boss);
		this.boss.body.setImmovable(true);

        this.tweens.add({
            targets: this.boss,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 400,
            yoyo: true,
            repeat: -1
        });

        this.obstaclesGroup = this.physics.add.group();
		this.bulletsGroup = this.physics.add.group();

        this.input.keyboard.on('keydown-LEFT', () => {
            if (!this.runnerActive) return;
            if (this.currentLane > 0) {
                this.currentLane--;
                this.tweens.add({
                    targets: this.player,
                    x: this.lanesX[this.currentLane],
                    duration: 100,
                    ease: 'Power2'
                });
            }
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            if (!this.runnerActive) return;
            if (this.currentLane < 2) {
                this.currentLane++;
                this.tweens.add({
                    targets: this.player,
                    x: this.lanesX[this.currentLane],
                    duration: 100,
                    ease: 'Power2'
                });
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
		if (!this.runnerActive) return;

        let obs = this.add.rectangle(this.boss.x, this.boss.y + 50, 45, 45, 0xff0055);
        this.physics.add.existing(obs); // Assegurem les físiques primer
        this.obstaclesGroup.add(obs);
        obs.body.setVelocityY(400);
        obs.hasCollided = false;

        this.tweens.add({
            targets: obs,
            angle: 360,
            duration: 800,
            repeat: -1,
            ease: 'Linear'
        });
    }
	
	shoot() {
        if (!this.runnerActive) return;
        let bullet = this.add.rectangle(this.player.x, this.player.y - 30, 6, 25, 0xffff00);
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
        this.cameras.main.shake(100, 0.005);
        this.time.delayedCall(100, () => { boss.fillColor = 0xcc0000; });
        if (gameState.bossVida <= 0) {
            this.runnerActive = false;
            this.physics.pause();

            this.trail.stop();
            this.cameras.main.flash(500, 255, 255, 255);

            this.time.delayedCall(600, () => {
                // alert("VICTÒRIA! Has derrotat la IA!");
                this.scene.start('MainMenu');
            });
        }
    }
	
    hitObstacle(player, obstacle) {
        if (obstacle.hasCollided || !this.runnerActive) return;
        obstacle.hasCollided = true;

        obstacle.fillColor = 0x444444;
        this.cameras.main.shake(300, 0.02);
        this.cameras.main.flash(200, 255, 0, 85);

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
        //alert("GAME OVER: " + motiu);

        this.time.delayedCall(1000, () => {
            this.scene.restart();
        });
    }

    update() {
        if (this.runnerActive) {
            this.linesGroup.getChildren().forEach(line => {
                line.y += 8;
                if (line.y > 650) {
                    line.y = -50;
                }
            });
        }

        this.obstaclesGroup.getChildren().forEach((obs) => {
            if (obs.y > 650) {
                obs.destroy();
            }
        });

        this.bulletsGroup.getChildren().forEach((bullet) => {
            if (bullet.y < -50) {
                bullet.destroy();
            }
        });
    }
}