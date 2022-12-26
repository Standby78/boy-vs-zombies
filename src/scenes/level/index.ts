import { Scene } from 'phaser';
import star from '../../assets/star.png';
import player from '../../assets/player.png';
import zombie from '../../assets/zombie.png';
import deadZombie from '../../assets/deadzombie.png';
import airdrop from '../../assets/airdrop.png';
import fire from '../../assets/fire.png';

export interface Level1 extends Scene {
  keyLeft: any;
  keyRight: any;
  keyEsc: any;
  keyUp: any;
  keyDown: any;
  zombies: any;
  stars: any;
  lowerEdge: any;
  upperEdge: any;
  isBulletBlocked: boolean;
  isAirDropCollected: boolean;
  graphics: any;
  path: any;
  follower: any;
  aird: any;
  megaWeapon: any;
}

const ZOMBIE_SPAWN_DELAY = 500;
const ZOMBIE_SPEED = 100;
const BULLET_DELAY = 400;
const building = {
  x: window.innerWidth * 0.25,
  y: window.innerHeight * 0.4,
  width: window.innerWidth * 0.2,
  height: window.innerHeight * 0.6,
  windows: 8,
  floors: 10,
  gap: 15,
};

export class Level1 extends Scene {
  constructor() {
    super('level-1-scene');
    this.isBulletBlocked = false;
    this.isAirDropCollected = false;
  }

  preload(): void {
    this.load.image('player', player);
    this.load.image('star', star);
    this.load.image('zombie', zombie);
    this.load.image('deadZombie', deadZombie);
    this.load.image('airdrop', airdrop);
    this.load.image('fire', fire);
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

  airdropCollected(player: any, airdrop: any): void {
    if (!this.isAirDropCollected) {
      airdrop.visible = false;
      this.isAirDropCollected = true;
      setTimeout(() => {
        this.isAirDropCollected = false;
        airdrop.visible = true;
      }, 5000);
    }
  }

  create(): void {
    const graphics = this.add.graphics();
    /* path of air drop */
    const path = new Phaser.Curves.Path(window.innerWidth, 0);
    path.lineTo(-150, window.innerHeight * 0.2);
    //    graphics.lineStyle(2, 0xffffff, 1);
    //    this.path.draw(graphics);
    const airDrop: any = this.add.follower(path, window.innerWidth, 40, 'airdrop');
    this.physics.world.enable(airDrop);
    airDrop.body.setAllowGravity(false);
    airDrop.startFollow({
      duration: 5000,
      repeatDelay: 10000,
      yoyo: false,
      repeat: -1,
    });

    /**/
    graphics.fillGradientStyle(0x351f1b, 0x351f1b, 0xff7847, 0xff7847, 1);
    graphics.fillRect(0, window.innerHeight * 0.33, window.innerWidth, window.innerHeight * 0.33);

    graphics.fillStyle(0x281714);
    for (let buildings = 1; buildings <= 30; buildings++) {
      const height = Math.random() * (window.innerHeight * 0.45);
      graphics.fillRect(
        (buildings - 1) * (window.innerWidth / 30),
        window.innerHeight * 0.66 - height,
        window.innerWidth / 30,
        window.innerHeight,
      );
    }

    for (let buildings = 1; buildings <= 5; buildings++) {
      graphics.fillStyle(0x252329);
      const buildingHeight = window.innerHeight - Math.random() * window.innerHeight * 0.7;
      const buildingWidth = window.innerWidth / 5;
      const buildingX = (buildings - 1) * (buildingWidth + window.innerWidth * 0.02);
      const buildingY =
        buildingHeight < window.innerHeight * 0.6 ? buildingHeight : window.innerHeight * 0.6;
      graphics.fillRect(buildingX, buildingY, buildingWidth, window.innerHeight);
      const windowWidth = (buildingWidth - 10 * (10 + 1)) / 10;
      const windowHeight = (buildingHeight - 10 * (15 + 1)) / 15;

      for (let i = 1; i <= buildingHeight; i++) {
        for (let e = 1; e <= 10; e++) {
          graphics.fillStyle(0x231d2e);
          const windowX = buildingX + e * 10 + (e - 1) * windowWidth;
          const windowY = buildingY + i * 12 + (i - 1) * windowHeight;
          graphics.fillRect(windowX, windowY, windowWidth, windowHeight);
        }
      }
    }
    graphics.fillStyle(0x002b49);
    graphics.fillRect(building.x, building.y, building.width, building.height);
    const windowWidth = (building.width - building.gap * (building.windows + 1)) / building.windows;
    const windowHeight = (building.height - building.gap * (building.floors + 1)) / building.floors;

    for (let i = 1; i <= building.floors; i++) {
      for (let e = 1; e <= building.windows; e++) {
        graphics.fillStyle(0x004777);
        const windowX = building.x + e * building.gap + (e - 1) * windowWidth;
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

    this.upperEdge = this.physics.add.sprite(building.x, building.y, zombie).setImmovable();
    this.upperEdge.scaleX = 50;
    this.upperEdge.scaleY = 0.1;
    this.upperEdge.visible = false;
    this.upperEdge.body.setAllowGravity(false);

    this.stars = this.physics.add.group();
    this.physics.add.overlap(this.stars, this.zombies, this.destroyStar, null!, this);
    this.physics.add.overlap(this.lowerEdge, this.zombies, this.destroyZombie, null!, this);
    this.physics.add.overlap(this.upperEdge, this.zombies, this.gameOver, null!, this);
    const player = this.physics.add.sprite(
      building.x + building.width / 2,
      window.innerHeight * 0.4 - 150,
      'player',
    );
    this.physics.add.collider(player, this.upperEdge);
    this.physics.add.overlap(player, airDrop, this.airdropCollected, null!, this);

    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.keyDown.on('down', () => {
      if (this.isAirDropCollected) {
        this.megaWeapon = this.physics.add
          .sprite(building.x - 20, building.y, 'fire')
          .setOrigin(0, 0);
        this.megaWeapon.scaleX = 1.45;
        this.physics.add.overlap(this.megaWeapon, this.zombies, this.destroyZombie, null!, this);
      }
    });

    this.keyLeft.on('down', () => {
      player.setFlipX(true);
      if (!this.isBulletBlocked && player.body.velocity.y === 0) {
        this.blockBullet();
        this.stars.create(building.x, 290, 'star');
      }
    });
    this.keyRight.on('down', () => {
      player.setFlipX(false);
      if (!this.isBulletBlocked && player.body.velocity.y === 0) {
        this.blockBullet();
        this.stars.create(building.x + building.width, 290, 'star');
      }
    });
    this.keyUp.on('down', () => {
      if (player.body.touching.down) player.setVelocityY(-400);
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
      createdZombie.body.setAllowGravity(false);
      createdZombie.setFlipX(side ? false : true);
    }, ZOMBIE_SPAWN_DELAY);
  }
  update(): void {}
}
