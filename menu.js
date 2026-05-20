class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' }); 
    }

    preload() {
        this.load.image('fonsMenu', 'assets/fons_menu.png');
		this.load.image('logoGrup', 'assets/Empresa.png');
    }

    create() {
		
		let fons = this.add.image(400, 250, 'fonsMenu');
		fons.setDisplaySize(800, 500);
		
        //this.cameras.main.setBackgroundColor('#2c3e50');

        this.add.text(400, 150, 'Deepfake Truth', {
            fontSize: '48px',
            fontFamily: 'Segoe UI, Tahoma, sans-serif',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
		
		let logo = this.add.image(698, 470, 'logoGrup').setScale(0.2);
				
        this.crearBoto(400, 220, 'Començar Partida', () => {
            console.log("Iniciant la partida...");
            gameState.vida = 100;
            updateHUD();
            this.scene.start('SceneMJ2'); 
        });

        this.crearBoto(400, 290, 'Crèdits i Controls', () => {
			this.scene.start('CreditsScene');
            // escena credits i controls
        });

        this.crearSliderVolum(400, 420);
    }

	crearBoto(x, y, text, accioOnClick) {
			const boto = this.add.text(x, y, text, {
				fontSize: '24px',
				fontFamily: 'Segoe UI, sans-serif',
				fill: '#ffffff',
				backgroundColor: '#e74c3c',
				padding: { x: 20, y: 10 }
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

			boto.on('pointerover', () => {
				boto.setStyle({ backgroundColor: '#c0392b' });
				boto.setScale(1.05);
			});
			boto.on('pointerout', () => {
				boto.setStyle({ backgroundColor: '#e74c3c' });
				boto.setScale(1);
			});

			boto.on('pointerdown', accioOnClick);
			return boto;
		}

	crearSliderVolum(x, y) {
			this.add.text(x, y - 30, 'Volum General', {
				fontSize: '18px', fill: '#ffffff', fontFamily: 'Segoe UI, sans-serif'
			}).setOrigin(0.5);

			let ampladaBarra = 200;
			let iniciX = x - (ampladaBarra / 2);

			this.add.rectangle(x, y, ampladaBarra, 8, 0x555555).setOrigin(0.5);
			let barraPlena = this.add.rectangle(iniciX, y, ampladaBarra, 8, 0xe74c3c).setOrigin(0, 0.5);
			let knob = this.add.circle(iniciX + ampladaBarra, y, 12, 0xffffff)
				.setInteractive({ draggable: true, useHandCursor: true });

			knob.on('drag', (pointer, dragX) => {
				dragX = Phaser.Math.Clamp(dragX, iniciX, iniciX + ampladaBarra);
				knob.x = dragX;
				barraPlena.width = dragX - iniciX;
				let volum = (dragX - iniciX) / ampladaBarra;
				this.sound.volume = volum;
			});
		}
}


class CreditsScene extends Phaser.Scene {
	constructor() {
		super({ key: 'CreditsScene' });
	}
	
	create() {
		let fons = this.add.image(400, 250, 'fonsMenu');
		fons.setDisplaySize(800, 500);
		
		this.add.text(400, 80, 'Crèdits i Controls', {
			fontSize: '40px',
			fontFamily: 'Segoe UI, sans-serif',
			fill: '#ffffff',
			fontStyle: 'bold'
		}).setOrigin(0.5);
		
		this.add.text(400, 180, 'CONTROLS DEL JOC:\n\n Fletxa ESQUERRA: Anar al carril esquerre\n Fletxa DRETA: Anar al carril dret\n Objectiu: Esquiva els obstacles i sobreviu!', {
            fontSize: '20px',
            fontFamily: 'Segoe UI, sans-serif',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);
		
		this.add.text(400, 300, 'CRÈDITS:\n\nDesenvolupat per: Gerard Casellas Bosch i Arià Casellas Bosch', {
            fontSize: '18px',
            fontFamily: 'Segoe UI, sans-serif',
            fill: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);
		
		const botoTornar = this.add.text(400, 410, 'Tornar al Menú', {
            fontSize: '20px',
            fontFamily: 'Segoe UI, sans-serif',
            fill: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 20, y: 10 }
        })
		.setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
		
		botoTornar.on('pointerover', () => {
            botoTornar.setStyle({ backgroundColor: '#c0392b' });
            botoTornar.setScale(1.05);
        });
        botoTornar.on('pointerout', () => {
            botoTornar.setStyle({ backgroundColor: '#e74c3c' });
            botoTornar.setScale(1);
        });
		
		botoTornar.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
	}
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    parent: 'game-container',
	physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [MainMenu, CreditsScene, SceneMJ2]
};

const game = new Phaser.Game(config);