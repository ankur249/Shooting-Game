const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');                // browser API for editing on the canvas
canvas.width = window.innerWidth+100;                   //to cover the canvas on the window
canvas.height = window.innerHeight+100;
let score = 0;
play.addEventListener('click', startNewGame);
function startNewGame() {
  overlay.style.display = 'none';
  score = 0;
  projectiles.length = 0;  // Reset the projectiles array
  enemies.length = 0;     // Reset the enemies array
  particles.length = 0;   // Reset the particles array
  animate();
  spawnenemies();
  animatescore();
  
}
function endGame() {
  cancelAnimationFrame(animationid);
  overlay.style.display = 'flex';
  scoreValue.innerHTML = score;
  projectiles.length = 0;  // Reset the projectiles array
  enemies.length = 0;     // Reset the enemies array
  particles.length = 0;   // Reset the particles array
  play.addEventListener('click', startNewGame);
}
function drawScore() {
  c.font = '24px Arial'; // Set the font size, style, and type
  c.fillStyle = 'white'; // Set the text color
  c.textAlign = 'left'; // Set the alignment of the text
  c.fillText(`Score -  ${score}`, 10, 30); // Display the score text at position (10, 30)
}
function animatescore() {
  drawScore();
  requestAnimationFrame(animatescore);
}

class Player {                                     //player created
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.fillStyle = this.color;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
  }
}
class Projectile {                                             //projectiles shooted by the shooter having some velocity
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.fillStyle = this.color;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
  }

  update() {                                     //updating the centre of the circle for movement of projectile
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

//creation of enemy

class Enemy {                                             //enemies approaching the shooter
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.fillStyle = this.color;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Particle {                                             //for enemy explosion
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save();                     // to ensure that the changes made within this state does not affect any other drawing operations
    c.globalAlpha = this.alpha;
    c.fillStyle = this.color;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;
const player = new Player(x, y, 10, 'white');
player.draw();

const projectiles = [];    //projectiles shooted by the center
const enemies = [];       //list of enemies approaching in a random manner
const particles = [];
//const newprojectile = new Projectile(x, y, 10, 'red', { x: 1, y: 1 });

function spawnenemies() {
  setInterval(() => {

    const border = Math.floor(Math.random() * 4); // Randomly choose a border (0-3)
    let x, y;
    if (border === 0) {
      // Top border
      x = Math.random() * canvas.width-20;
      y = -50;
    }
    else if (border === 1) {
      // Bottom border
      x = Math.random() * canvas.width;
      y = canvas.height+50;
    }
    else if (border === 2) {
      // Left border
      x = -50;
      y = Math.random() * canvas.height;
    }
    else {
      // Right border
      x = canvas.width+50;
      y = Math.random() * canvas.height;
    }
    const radius = 4 + 26 * Math.random();
    const color = `hsl(${360 * Math.random()},50%,50%)`; // using of template literal so as to compute the value of hue first and then substitute in hsl
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = { x: Math.cos(angle), y: Math.sin(angle) };          //it is the direction vector per unit time
    enemies.push(new Enemy(x, y, radius, color, velocity))
    //console.log(enemies);

  }, 1000)
}

// to move the bullet/projectile from the shooter to the target we need animation
let animationid;
function animate() {
  c.fillStyle = 'rgba(0,0,0,0.1)';   // the opacity i.e the value of alpha leads to the fading effect 
  c.fillRect(0, 0, canvas.width, canvas.height);   // to continuously erase the previously painted screen otherwise the projectile will act as a stream
  player.draw();                                     // to redraw the shooter
  animationid = requestAnimationFrame(animate);        // every animation frame is assigned to this animation id
  projectiles.forEach((projectile, pindex) => {
    projectile.update();                          // for each projectile printing the path

    //removing offscreen projectiles to speed up the game

    if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width
      || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
      projectiles.splice(pindex, 1);
    }
  });
  particles.forEach((particle, peindex) => {
    if ((particle.alpha) <= 0) {
      particles.splice(peindex, 1);
    }
    else
      particle.update();
  })
  enemies.forEach((enemy, eindex) => {
    enemy.update();                          // for each enemy printing the path

    //collison of the enemy with the player shooter

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    //end the game

    if ((dist - player.radius - enemy.radius) < 1) {
      endGame();
    }
    // collision detection of projectile and enemy 
    projectiles.forEach((projectile, pindex) => {
      const dist = Math.hypot(enemy.x - projectile.x, projectile.y - enemy.y);

      // collision of projectile and enemy is detected

      if ((dist - enemy.radius - projectile.radius) < 1) {
        //drawScore();
        for (let i = 0; i < 8; i++) {
          particles.push(new Particle(projectile.x, projectile.y, 1 + Math.random() * 3, enemy.color, {
            x: Math.random() - 0.5,
            y: Math.random() - 0.5
          }))
        }
        if ((enemy.radius) > 15) {                   // to slowly shrink the big enemies 
          gsap.to(enemy, {                         // fading effect on shrinking
            radius: enemy.radius - 10
          })
          setTimeout(() => {
            projectiles.splice(pindex, 1);        //erasing the projectile after the work is done 
          }, 0);
        }
        else {
          setTimeout(() => {
            score += 10;
            projectiles.splice(pindex, 1);
            enemies.splice(eindex, 1);
          }, 0);// immediately erase the enemy and projectile from the array to avoid flickering effect
        }
      }
    });
  });
}

// To shoot the projectile from the shooter we are using an event listener(projectile generator)

window.addEventListener('click', event => {
  //console.log('shoot');    
  const angle = Math.atan2(event.y - canvas.height / 2, event.x - canvas.width / 2);
  const velocity = { x: Math.cos(angle) * 4, y: Math.sin(angle) * 4 };           //distance vector from the target
  //console.log(angle);
  projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)); //on each click pushing a new projectile to the end of the array
  console.log(projectiles);
});

