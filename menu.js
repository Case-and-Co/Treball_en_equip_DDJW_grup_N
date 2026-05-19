class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' }); 
    }

    preload() {
        // Per carregar imatges
        // this.load.image('logo', 'assets/logo.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#2c3e50');

        this.add.text(400, 150, 'Deepfake Truth', {
            fontSize: '48px',
            fontFamily: 'Segoe UI, Tahoma, sans-serif',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
		
        const startButton = this.add.text(400, 300, 'Començar Partida', {
            fontSize: '24px',
            fontFamily: 'Segoe UI, sans-serif',
            fill: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
		
        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#c0392b' });
            startButton.setScale(1.05);
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#e74c3c' });
            startButton.setScale(1);
        });

        startButton.on('pointerdown', () => {
            console.log("S'ha fet clic a començar!");
            // this.scene.start('escenaJoc');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    parent: 'game-container',
    scene: [MainMenu]
};

const game = new Phaser.Game(config);