const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let score,
  scoreText,
  highscore,
  highscoreText,
  player,
  gravity,
  obstacles = [],
  gameSpeed,
  keys = {};

let isRunning = true;

document.addEventListener("keydown", function (evt) {
  keys[evt.code] = true;
});
document.addEventListener("keyup", function (evt) {
  keys[evt.code] = false;
});

let isDucking = false; // Track ducking state

// Duck button press
document.getElementById("duckBtn").addEventListener("mousedown", function () {
  isDucking = true; // Start ducking when button is pressed
});

// Duck button release
document.getElementById("duckBtn").addEventListener("mouseup", function () {
  isDucking = false; // Stop ducking when button is released
});

// Touch events for mobile support
document.getElementById("duckBtn").addEventListener("touchstart", function () {
  isDucking = true; // Start ducking on touch
});

document.getElementById("duckBtn").addEventListener("touchend", function () {
  isDucking = false; // Stop ducking on touch end
});

// Add the jump button listener as before
document.getElementById("jumpBtn").addEventListener("click", function () {
  keys["Space"] = true; // Simulate Space key press for jumping
  setTimeout(() => (keys["Space"] = false), 100); // Reset after a brief moment to allow another jump
});

class Player {
  constructor(x, y, w, h, imageSrc) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.dy = 0;
    this.jumpForce = 15;
    this.originalHeight = h;
    this.grounded = false;
    this.jumpTimer = 0;

    // Load the player image
    this.image = new Image();
    this.image.src = imageSrc;
  }

  Animate() {
    // Jumping Animation
    if (keys["Space"] || keys["KeyW"]) {
      this.Jump();
    } else {
      this.jumpTimer = 0;
    }

    if (keys["ShiftLeft"] || keys["KeyS"] || isDucking) {
      this.h = this.originalHeight / 2;
    } else {
      this.h = this.originalHeight;
    }

    this.y += this.dy;

    // Gravity
    if (this.y + this.h < canvas.height) {
      this.dy += gravity;
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = canvas.height - this.h;
    }

    this.Draw();
  }

  Jump() {
    if (this.grounded && this.jumpTimer == 0) {
      this.jumpTimer = 1;
      this.dy = -this.jumpForce;
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
      this.jumpTimer++;
      this.dy = -this.jumpForce - this.jumpTimer / 50;
    }
  }

  Draw() {
    ctx.save(); // Save the current drawing state

    // Move the origin to the center of the ellipse
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    // Scale the context to make the ellipse shape
    ctx.scale(this.w / this.image.width, this.h / this.image.height);

    // Draw the image, centered on the new scaled coordinates
    ctx.drawImage(
      this.image,
      -this.image.width / 2, // Center horizontally
      -this.image.height / 2 // Center vertically
    );

    ctx.restore(); // Restore the drawing state
  }
}

class Obstacle {
  constructor(x, y, w, h, imageSrc) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.dx = -gameSpeed;

    // Load the image
    this.image = new Image();
    this.image.src = imageSrc;
  }

  Update() {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw() {
    ctx.save(); // Save the current drawing state

    // Move the origin to the center of the ellipse
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    // Scale the context to make the ellipse shape
    ctx.scale(this.w / this.image.width, this.h / this.image.height);

    // Draw the image, centered on the new scaled coordinates
    ctx.drawImage(
      this.image,
      -this.image.width / 2, // Center horizontally
      -this.image.height / 2 // Center vertically
    );

    ctx.restore(); // Restore the drawing state
  }
}

class Text {
  constructor(t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.font = this.s + "px sans-serif";
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

function SpawnObstacle() {
  let size = RandomIntInRange(40, 70);
  let type = RandomIntInRange(0, 1);

  // Use an obstacle image
  let obstacleImageSrc = "./assets/corona.png";

  let obstacle = new Obstacle(
    canvas.width + size, // Start position outside the canvas
    canvas.height - size, // Y position based on size
    size, // Width
    size, // Height
    obstacleImageSrc // Image source
  );

  if (type == 1) {
    obstacle.y -= player.originalHeight - 10; // Adjust height for variation
  }
  obstacles.push(obstacle);
}

function RandomIntInRange(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function Start() {
  isRunning = true;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 400;
  canvas.classList.remove("hidden");

  // Scroll the canvas into view
  canvas.scrollIntoView({ behavior: "smooth", block: "center" });

  ctx.font = "20px sans-serif";

  gameSpeed = 3;
  gravity = 1;

  score = 0;
  highscore = 0;
  if (localStorage.getItem("highscore")) {
    highscore = localStorage.getItem("highscore");
  }

  player = new Player(25, 0, 50, 180, "./assets/nadia.png");

  scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
  highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

  requestAnimationFrame(Update);
}

function Stop() {
  isRunning = false; // Stop the game loop
  obstacles = [];

  gameSpeed = 3;
  window.localStorage.setItem("highscore", highscore);

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.fillStyle = "#212121";
  ctx.font = "30px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2); // Display game over text
  ctx.fillText("Your score: " + score, canvas.width / 2, canvas.height / 2 + 50);
  score = 0;
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function Update() {
  if (!isRunning) {
    return;
  }
  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  spawnTimer--;
  if (spawnTimer <= 0) {
    SpawnObstacle();
    console.log(obstacles);
    spawnTimer = initialSpawnTimer - gameSpeed * 8;

    if (spawnTimer < 60) {
      spawnTimer = 60;
    }
  }

  // Spawn Enemies
  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];

    if (o.x + o.w < 0) {
      obstacles.splice(i, 1);
    }

    if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
      Stop();
    }

    o.Update();
  }

  player.Animate();

  score++;
  scoreText.t = "Score: " + score;
  scoreText.Draw();

  if (score > highscore) {
    highscore = score;
    highscoreText.t = "Highscore: " + highscore;
  }

  highscoreText.Draw();

  gameSpeed += 0.003;
}
