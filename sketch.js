


let screen = "menu";

const GAME_W = 900;
const GAME_H = 500;

let scaleFactor = 1;
let offsetX = 0;
let offsetY = 0;

let coins = 0;
let score = 0;
let bestScore = 0;

let selectedCar = 0;
let unlocked = [true, false, false];

let cars = [
  {name:"RED FURY", color:[245,40,45], price:0},
  {name:"BLUE VIPER", color:[30,130,255], price:100},
  {name:"GOLDEN GT", color:[255,190,25], price:250}
];

let playerLane = 1;
let playerX = 450;
let nitro = 100;
let speed = 6;

let traffic = [];
let coinItems = [];
let roadOffset = 0;

let leftPressed = false;
let rightPressed = false;
let nitroPressed = false;

let moveCooldown = 0;
let spawnTimer = 0;
let coinTimer = 0;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");
  rectMode(CENTER);
  angleMode(DEGREES);
  frameRate(60);
  updateScale();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateScale();
}

function updateScale() {
  scaleFactor = min(width / GAME_W, height / GAME_H);
  offsetX = (width - GAME_W * scaleFactor) / 2;
  offsetY = (height - GAME_H * scaleFactor) / 2;
}

function draw() {
  background(5, 12, 22);

  push();
  translate(offsetX, offsetY);
  scale(scaleFactor);

  if (screen === "menu") drawMenu();
  else if (screen === "garage") drawGarage();
  else if (screen === "game") drawGame();
  else if (screen === "over") drawGameOver();

  pop();
}

function px(x) {
  return (x - offsetX) / scaleFactor;
}

function py(y) {
  return (y - offsetY) / scaleFactor;
}

function laneX(lane) {
  return [300, 450, 600][lane];
}

function drawCar(x, y, s, col) {
  push();
  translate(x, y);
  scale(s);

  fill(5);
  rect(-23,-19,11,28,4);
  rect(23,-19,11,28,4);
  rect(-23,20,11,28,4);
  rect(23,20,11,28,4);

  fill(col[0],col[1],col[2]);
  rect(0,0,44,75,12);

  fill(15,35,55);
  rect(0,-3,32,22,6);
  rect(0,19,30,12,4);

  fill(255,240,160);
  rect(-14,-34,9,5,2);
  rect(14,-34,9,5,2);

  fill(255,30,30);
  rect(-14,34,8,5);
  rect(14,34,8,5);

  pop();
}

function button(x,y,w,h,label,col) {
  fill(0,0,0,70);
  rect(x,y+4,w,h,12);

  fill(col[0],col[1],col[2]);
  rect(x,y,w,h,12);

  fill(255);
  textAlign(CENTER,CENTER);
  textStyle(BOLD);
  textSize(19);
  text(label,x,y);
  textStyle(NORMAL);
}

function drawMenu() {
  drawRoadBackground();

  fill(0,0,0,150);
  rect(450,250,900,500);

  fill(255);
  textAlign(CENTER);
  textSize(48);
  textStyle(BOLD);
  text("HIGHWAY",450,100);

  fill(255,190,20);
  text("RUSH",450,155);

  textStyle(NORMAL);
  textSize(18);
  fill(220);
  text("SUPER CAR RACING",450,190);

  drawCar(450,285,1.1,cars[selectedCar].color);

  button(450,390,270,55,"START GAME",[20,185,95]);
  button(450,455,270,48,"GARAGE",[35,110,230]);

  fill(255,205,30);
  textSize(18);
  text("COINS: "+coins,450,485);
}

function drawGarage() {
  background(13,25,43);

  fill(255);
  textAlign(CENTER);
  textSize(32);
  textStyle(BOLD);
  text("SUPER GARAGE",450,45);

  fill(255,205,30);
  textSize(17);
  text("COINS: "+coins,450,75);

  for(let i=0;i<3;i++) {
    let x=155+i*295;

    fill(selectedCar===i ? color(35,100,170):color(40,48,65));
    rect(x,245,265,235,14);

    drawCar(x,185,0.75,cars[i].color);

    textAlign(CENTER);
    fill(255);
    textSize(17);
    textStyle(BOLD);
    text(cars[i].name,x,285);

    textStyle(NORMAL);
    textSize(15);

    if(unlocked[i]) {
      fill(80,255,140);
      text(selectedCar===i ? "SELECTED":"TAP TO SELECT",x,325);
    } else {
      fill(255,205,30);
      text("PRICE: "+cars[i].price,x,320);
      text("TAP TO BUY",x,345);
    }
  }

  button(155,445,150,48,"BACK",[90,95,110]);
  button(745,445,150,48,"START RACE",[20,185,95]);
}

function drawRoadBackground() {
  background(20,100,45);
  fill(45);
  rect(450,250,470,500);

  stroke(230);
  strokeWeight(4);

  for(let y=0;y<500;y+=80) {
    line(375,y,375,y+40);
    line(525,y,525,y+40);
  }

  noStroke();
}

function drawRoad() {
  background(20,100,45);

  fill(45);
  rect(450,250,470,500);

  fill(240);
  rect(215,250,5,500);
  rect(685,250,5,500);

  stroke(230);
  strokeWeight(4);

  for(let y=-80;y<580;y+=80) {
    let yy=(y+roadOffset)%580;
    line(375,yy,375,yy+40);
    line(525,yy,525,yy+40);
  }

  noStroke();
}

function drawGame() {
  drawRoad();

  if(nitroPressed && nitro>0) {
    speed=10;
    nitro=max(0,nitro-0.65);
  } else {
    speed=6;
    nitro=min(100,nitro+0.12);
  }

  roadOffset=(roadOffset+speed)%80;

  if(moveCooldown>0) moveCooldown--;

  if(moveCooldown===0) {
    if(leftPressed) {
      playerLane=max(0,playerLane-1);
      moveCooldown=12;
      leftPressed=false;
    }

    if(rightPressed) {
      playerLane=min(2,playerLane+1);
      moveCooldown=12;
      rightPressed=false;
    }
  }

  spawnTimer++;

  if(spawnTimer>55) {
    spawnTimer=0;

    traffic.push({
      lane:floor(random(3)),
      y:-70,
      color:random([
        [220,40,50],
        [40,140,255],
        [230,180,30]
      ])
    });
  }

  for(let i=traffic.length-1;i>=0;i--) {
    let t=traffic[i];
    t.y+=speed*0.75;

    drawCar(laneX(t.lane),t.y,0.65,t.color);

    if(abs(t.y-370)<55 && t.lane===playerLane) {
      bestScore=max(bestScore,floor(score));
      screen="over";
      nitroPressed=false;
      return;
    }

    if(t.y>580) traffic.splice(i,1);
  }

  coinTimer++;

  if(coinTimer>65) {
    coinTimer=0;

    coinItems.push({
      lane:floor(random(3)),
      y:-25,
      spin:0
    });
  }

  for(let i=coinItems.length-1;i>=0;i--) {
    let c=coinItems[i];

    c.y+=speed;
    c.spin+=8;

    push();
    translate(laneX(c.lane),c.y);
    fill(255,190,15);
    ellipse(0,0,17*abs(cos(c.spin))+5,23);
    pop();

    if(abs(c.y-370)<35 && c.lane===playerLane) {
      coins++;
      score+=10;
      coinItems.splice(i,1);
      continue;
    }

    if(c.y>560) coinItems.splice(i,1);
  }

  playerX=lerp(playerX,laneX(playerLane),0.2);
  drawCar(playerX,370,1,cars[selectedCar].color);

  score+=0.1;

  fill(0,0,0,180);
  rect(450,35,880,60,10);

  textAlign(LEFT);
  textSize(16);
  fill(255);
  text("SCORE: "+floor(score),25,30);

  fill(255,210,25);
  text("COINS: "+coins,25,53);

  textAlign(RIGHT);
  fill(255);
  text("SPEED: "+floor(speed*20),875,30);

  fill(45);
  rect(780,55,130,12,6);

  fill(30,170,255);
  rect(715+nitro*0.65,55,nitro*1.3,12,6);

  // LEFT SIDE: LEFT BUTTON FIRST, THEN NITRO
  button(90,445,130,75,"◀ LEFT",[35,85,170]);
  button(245,445,130,75,"NITRO",[15,140,240]);

  // RIGHT SIDE: RIGHT BUTTON
  button(790,445,150,75,"RIGHT ▶",[35,85,170]);
}

function drawGameOver() {
  background(15,25,40);

  fill(0,0,0,200);
  rect(450,250,450,330,20);

  fill(255,60,60);
  textAlign(CENTER);
  textSize(38);
  textStyle(BOLD);
  text("GAME OVER",450,150);

  textStyle(NORMAL);
  fill(255);
  textSize(21);
  text("SCORE: "+floor(score),450,215);
  text("BEST: "+bestScore,450,255);

  fill(255,205,30);
  text("COINS: "+coins,450,295);

  button(450,355,230,55,"PLAY AGAIN",[20,185,95]);
  button(450,425,230,55,"MAIN MENU",[45,110,210]);
}

function startGame() {
  screen="game";
  score=0;
  speed=6;
  nitro=100;
  playerLane=1;
  playerX=450;

  traffic=[];
  coinItems=[];

  spawnTimer=0;
  coinTimer=0;
  moveCooldown=0;

  leftPressed=false;
  rightPressed=false;
  nitroPressed=false;
}

function handlePress(x,y) {
  if(screen==="menu") {
    if(y>355 && y<425) screen="garage";
    else if(y>430 && y<485) screen="garage";
  }

  else if(screen==="garage") {
    if(y>120 && y<365) {
      let i=floor((x-20)/295);

      if(i>=0 && i<3) {
        if(unlocked[i]) {
          selectedCar=i;
        } else if(coins>=cars[i].price) {
          coins-=cars[i].price;
          unlocked[i]=true;
          selectedCar=i;
        }
      }
    }

    if(y>410 && x<300) screen="menu";
    if(y>410 && x>600) startGame();
  }

  else if(screen==="game") {
    if(y>395) {
      if(x<165) leftPressed=true;
      else if(x>=165 && x<400) nitroPressed=true;
      else if(x>700) rightPressed=true;
    }
  }

  else if(screen==="over") {
    if(y>325 && y<390) startGame();
    else if(y>395 && y<465) screen="menu";
  }
}

function mousePressed() {
  handlePress(px(mouseX),py(mouseY));
  return false;
}

function mouseReleased() {
  leftPressed=false;
  rightPressed=false;
  nitroPressed=false;
  return false;
}

function touchStarted() {
  handlePress(px(mouseX),py(mouseY));
  return false;
}

function touchEnded() {
  leftPressed=false;
  rightPressed=false;
  nitroPressed=false;
  return false;
}

function keyPressed() {
  if(screen==="game") {
    if(keyCode===LEFT_ARROW || key==="a") leftPressed=true;
    if(keyCode===RIGHT_ARROW || key==="d") rightPressed=true;
    if(key===" ") nitroPressed=true;
  }

  return false;
}

function keyReleased() {
  leftPressed=false;
  rightPressed=false;
  nitroPressed=false;
  return false;
}
