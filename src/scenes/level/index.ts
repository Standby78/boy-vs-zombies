import { Scene } from 'phaser';
import star from '../../assets/star.png';

export interface Level1 extends Scene {
  keyLeft: any;
  keyRight: any;
  keyEsc: any;
}
export class Level1 extends Scene {
  constructor() {
    super('level-1-scene');
  }

  preload(): void {
    this.load.image('star', star);
    console.log(star);
  }

  create(): void {
    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.keyLeft.on('down', () => {
      const image = this.physics.add.sprite(200, 290, 'star');
      image.setScale(0.25);
    });
    this.keyRight.on('down', () => {
      const image = this.physics.add.sprite(500, 290, 'star');
      image.setScale(0.25);
    });
    this.keyEsc.on('down', () => {
      console.log('esc');
    });
  }
  update(): void {}
}
