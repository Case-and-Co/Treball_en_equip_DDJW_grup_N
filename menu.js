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
            // this.scene.start('RunnerGame'); 
        });

        this.crearBoto(400, 290, 'Crèdits i Controls', () => {
            console.log("Obrint crèdits...");
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

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    parent: 'game-container',
    scene: [MainMenu]
};

const game = new Phaser.Game(config);