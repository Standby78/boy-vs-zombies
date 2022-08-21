import { Scene } from 'phaser';
import star from '../../assets/star.png';
import player from '../../assets/player.png';
import zombie from '../../assets/zombie.png';
import deadZombie from '../../assets/deadzombie.png';

export interface Level1 extends Scene {
  keyLeft: any;
  keyRight: any;
  keyEsc: any;
  zombies: any;
  stars: any;
  lowerEdge: any;
  upperEdge: any;
  isBulletBlocked: boolean;
}

const ZOMBIE_SPAWN_DELAY = 500;
const ZOMBIE_SPEED = 100;
const BULLET_DELAY = 400;
const building = {
  x: window.innerWidth * 0.25,
  y: window.innerHeight * 0.4,
  width: window.innerWidth * 0.3,
  height: window.innerHeight * 0.6,
  windows: 5,
  floors: 7,
  gap: 25,
};

export class Level1 extends Scene {
  constructor() {
    super('level-1-scene');
    this.isBulletBlocked = false;
  }

  preload(): void {
    this.load.image('player', player);
    this.load.image('star', star);
    this.load.image('zombie', zombie);
    this.load.image('deadZombie', deadZombie);
  }

  destroyStar(star: any, zombie: any): void {
    this.stars.remove(star, true, true);
    zombie.body.setAllowGravity(true);
    zombie.setVelocity(0);
    zombie.setTexture('deadZombie');
  }

  destroyZombie(edge: any, zombie: any): void {
    zombie.destroy(true);
  }

  gameOver(edge: any, zombie: any): void {
    zombie.destroy(true);
    console.log('game over');
  }

  blockBullet(): void {
    this.isBulletBlocked = true;
    setTimeout(() => (this.isBulletBlocked = false), BULLET_DELAY);
  }
  create(): void {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x351f1b, 0x351f1b, 0xff7847, 0xff7847, 1);
    graphics.fillRect(0, window.innerHeight * 0.33, window.innerWidth, window.innerHeight * 0.33);

    graphics.fillStyle(0x002b49);
    graphics.fillRect(building.x, building.y, building.width, building.height);
    const windowWidth = (building.width - building.gap * (building.windows + 1)) / building.windows;
    const windowHeight = (building.height - building.gap * (building.floors + 1)) / building.floors;
    console.log(building.width, windowWidth, building.windows, building.gap);

    for (let i = 1; i <= building.floors; i++) {
      for (let e = 1; e <= building.windows; e++) {
        graphics.fillStyle(0xffff00, 0.3);
        const windowX = building.x + e * building.gap + (e - 1) * windowWidth;
        if (i === 1) console.log(windowX);

        const windowY = building.y + i * building.gap + (i - 1) * windowHeight;
        graphics.fillRect(windowX, windowY, windowWidth, windowHeight);
      }
    }
    this.zombies = this.physics.add.group({
      defaultKey: 'zombie',
      velocityY: -ZOMBIE_SPEED,
      collideWorldBounds: true,
    });
    this.lowerEdge = this.physics.add.sprite(building.x, building.height + building.y, zombie);
    this.lowerEdge.scaleX = 50;
    this.lowerEdge.scaleY = 0.1;
    this.lowerEdge.visible = false;
    this.lowerEdge.body.setAllowGravity(false);

    this.upperEdge = this.physics.add.sprite(building.x, building.y, zombie);
    this.upperEdge.scaleX = 50;
    this.upperEdge.scaleY = 0.1;
    this.upperEdge.visible = false;
    this.upperEdge.body.setAllowGravity(false);

    this.stars = this.physics.add.group();
    this.physics.add.overlap(this.stars, this.zombies, this.destroyStar, null!, this);
    this.physics.add.overlap(this.lowerEdge, this.zombies, this.destroyZombie, null!, this);
    this.physics.add.overlap(this.upperEdge, this.zombies, this.gameOver, null!, this);
    const player = this.physics.add
      .sprite(window.innerWidth * 0.4, window.innerHeight * 0.4 - 50, 'player')
      .setImmovable(true);
    player.body.setAllowGravity(false);
    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.keyLeft.on('down', () => {
      player.setFlipX(true);
      if (!this.isBulletBlocked) {
        this.blockBullet();
        this.stars.create(building.x, 290, 'star');
      }
    });
    this.keyRight.on('down', () => {
      player.setFlipX(false);
      if (!this.isBulletBlocked) {
        this.blockBullet();
        this.stars.create(building.x + building.width, 290, 'star');
      }
    });
    this.keyEsc.on('down', () => {
      console.log('esc');
    });
    setInterval(() => {
      const side = Math.random() > 0.5;
      const createdZombie = this.zombies.create(
        side ? building.x : building.x + building.width,
        800,
      );
      createdZombie.body.onWorldBounds = true;
      createdZombie.custom = this.zombies;
      createdZombie.body.setAllowGravity(false);
      createdZombie.setFlipX(side ? false : true);
    }, ZOMBIE_SPAWN_DELAY);
  }
  update(): void {}
}
