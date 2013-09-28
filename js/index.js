/** 
* Define singleton!
* Singleton is a type of object
* which contains all our images
* so that they are only created once
**/

var imageRepository = new function() {
  // Define images
  this.background = new Image();
  this.spaceship = new Image();
  this.bullet = new Image();
  this.enemy = new Image();
  this.enemyBullet = new Image();
  
  //ensure all images have loaded before starting the game
  var numImages = 5;
  var numLoaded = 0;
  function imageLoaded() {
    numLoaded++;
    if(numLoaded === numImages) {
      window.init();
    }
  }

  this.background.onload = function() {
    imageLoaded();
  }
  this.spaceship.onload = function() {
    imageLoaded();
  }
  this.bullet.onload = function() {
    imageLoaded();
  }
  this.enemy.onload = function() {
    imageLoaded();
  }
  this.enemyBullet.onload = function() {
    imageLoaded();
  }


  // Set images src  
  this.background.src = "images/bg.jpg";
  this.spaceship.src = "images/ship.png";
  this.bullet.src = "images/bullet.png";
  this.enemy.src = "images/enemy.png";
  this.enemyBullet.src = "images/bulletEnemey.png";
}

/**
 * Custom Pool object. Hlds Bullet
 * objects to be managed to prevent
 * garbage collection.
 */
function Pool(maxSize) {
  var size = maxSize; // Max bullets allowed in the pool
  var pool = [];

  // Populates the pool array with Bullet objects
  this.init = function() {
    for (var i = 0; i < size; i++) {
      // Initialize the bullet object
      var bullet = new Bullet();
      bullet.init(0,0, imageRepository.bullet.width, imageRepository.bullet.height);
      pool[i] = bullet;
    }
  };

  /*
    Grabs the last item in the list and initializes it
    and pushes it to the front of the array.
   */
  this.get = function(x, y, speed) {
    if(!pool[size - 1].alive) {
      pool[size - 1].spawn(x, y, speed);
      pool.unshift(pool.pop());
    }
  };


  /*
    Used for the ship to be able to get two bullets at once.
    If only the get() function is used twice, the ship is able
    to fire and only have 1 bullet spawn inseatd of 2.
   */
  this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
    if(!pool[size - 1].alive &&
       !pool[size - 2].alive) {
      this.get(x1, y1, speed1);
      this.get(x2, y2, speed2);
    }
  }

  /*
    Draws any in use Bullets.
    If a bullet goes off the screen, clears it and pushes it to the front of the array.
   */
  this.animate = function() {
    for (var i = 0; i < size; i++) {
      // Only draw until we find a bullet that is not alive
      if (pool[i].alive) {
        if(pool[i].draw()) {
          pool[i].clear();
          pool.push(pool.splice(i,1)[0]);
        }
      } else {
        break;
      }
    }
  };

}


/*
  Creates the Bullet object which the ship fires. The bullets
  are drawn on the "main" canvas.
 */
function Bullet() {
  this.alive = false; // Is true if the bullet is currently in use

  // sets the bullet values
  this.spawn = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.width = imageRepository.bullet.width;
    this.height = imageRepository.bullet.height;
    this.speed = speed * 2;
    this.alive = true;
  };

  /*
    Uses a "dirty rectangle" to erase the bullet and moves it.
    Returns true if the bullet moved off the screen, indicating
    that the bullet is ready to be cleared by the pool,
    otherwise draws the bullet.
   */
  this.draw = function() {
    this.context.clearRect(this.x, this.y, this.width, this.height);
    this.y -= this.speed;
    if (this.y <= 0 - this.height) {
      return true;
    } else {
      this.context.drawImage(imageRepository.bullet, this.x, this.y);
    }
  };

  /*
    Resets the bullet values
   */
  this.clear = function() {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.alive = false;
  };
}
Bullet.prototype = new Drawable();


/**
 * Create the Ship object that the player controls.
 * The ship drawn on the "ship" canvas and uses dirty rectangles
 * to move around the screen.
 */
function Ship() {
  this.speed = 6;
  this.bulletPool = new Pool(30);
  this.bulletPool.init();

  this.width = imageRepository.spaceship.width;
  this.height = imageRepository.spaceship.height;

  var fireRate = 15;
  var counter = 0;

  this.draw = function() {
    this.context.drawImage(imageRepository.spaceship, this.x, this.y);
  };

  this.move = function() {
    counter++;
    // Determine if the action is move action
    if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down || KEY_STATUS.up) {
      //The ship moved, so erase it's current image so it can be redrawn in it's new location
      this.context.clearRect(this.x, this.y, this.width, this.height);

      // Update x and y according to the direction to move and
      // redraw the ship.
      if(KEY_STATUS.left) {
        this.x -= this.speed;
        if(this.x <= 0) { //keep player within the screen
          this.x = 0;
        }
      }
      if(KEY_STATUS.right) {
        this.x += this.speed;
        if(this.x >= this.canvasWidth - this.width) {
          this.x = this.canvasWidth - this.width;
        }
      }
      if(KEY_STATUS.up) {
        this.y -= this.speed;
        /*
        this.canvasHeight/4*3 is used because we want
        the ship to be able to go up only 1/4th of the screen;
         */
        if(this.y <= 0) {
          this.y = 0;
        }
      }
      if(KEY_STATUS.down) {
        this.y += this.speed;
        if(this.y >= this.canvasHeight - this.height) {
          this.y = this.canvasHeight - this.height;
        }
      }

      // Finish by redrawing the ship
      this.draw();
    }

    if(KEY_STATUS.space && counter >= fireRate) {
      this.fire();
      counter = 0;
    }

  };

  // Fires two bullets
  this.fire = function() {
    this.bulletPool.getTwo(
      this.x+20, this.y + 20, 3,
      this.x+55, this.y + 20, 3);
  };

}
Ship.prototype = new Drawable();


/**
 * The keycodes that will be mapped when a user presses
 * a button. Original code by Doug McInnes
 */
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
};

/**
 * Creates the array to hold the KEY_CODES and sets all their
 * values ti fakse, Checking true/false is the quickest way to
 * check status of a key press and which one was pressed
 * when determining when to move and which direction.
 */
KEY_STATUS = {};
for(code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired
 * when any key on the keyboard is pressed down). When a key is
 * pressed, it sets the appropriate direction to true to let us
 * know which key it was.
 */
document.onkeydown = function(e) {
  // Firefox and opera use charCode instead of keyCode
  // to return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if(KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
};
/**
 * Sets up the document to listen to onkeyup event (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets the appropriate direction to false to let us know
 * which key it was.
 */
document.onkeyup = function(e) {
  // firefox and opera again...
  var keyCode = e.keyCode ? e.keyCode : e.charCode;
  if(KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
};

/**
* Define Drawable object which
* will be the base class for all
* drawable objects in the game.
* Sets up default variables
* that all child objects will inherit,
* as well as the default functions.
**/

function Drawable() {
  
  this.init = function(x, y) {
    // Default variables
    this.x = x;
    this.y = y;
  };
  
  this.speed = 0;
  this.canvasWidth = 0;
  this.canvasHeight = 0;
  
  // define abstract function to
  // be implemented in child objects
  
  this.draw = function() {
  };
  
}

/**
* Create the Background object which
* will become a child of the Drawable
* object. The background is drawn
* on the "background" canvas and 
* creates the illusion of moving
* by panning the image.
**/

function Background() {
  
  this.speed = 1; // redefine speed of the backgrond for panning
  
  // implement abstract function
  this.draw = function() {
    // pan background
    this.y += this.speed;
    
    this.context.drawImage(imageRepository.background, this.x, this.y);
    
    // draw another image at the top edfe of the first image
    
    this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);
    
    // if the image scrolled off the screen, reset
    
    if(this.y >= this.canvasHeight) {
      this.y = 0;
    }
    
  };
}

// set background to inherit properties from Drawable

Background.prototype = new Drawable();


/**
* Creates the Game object which
* will hold all objects and data
* for the game;
**/

function Game() {
  /**
  * gets canvas information and context
  * and sets up all game objects.
  * Returns true if the canvas is
  * supported and false otherwise.
  * This is to stop the animation
  * script from constantly running
  * on older browsers.
  **/
  
  this.init = function() {

    // get the canvas elements
    this.bgCanvas = document.getElementById('background');
    this.shipCanvas = document.getElementById('ship');
    this.mainCanvas = document.getElementById('main');
    

    // test to see if canvas is supported
    // only need to check one canvas
    if(this.bgCanvas.getContext) {
      this.bgContext = this.bgCanvas.getContext('2d');
      this.shipContext = this.shipCanvas.getContext('2d');
      this.mainContext = this.mainCanvas.getContext('2d');
      
      // Initialize objects to contain their context and canvas information
      
      Background.prototype.context = this.bgContext;
      Background.prototype.canvasWidth = this.bgCanvas.width;
      Background.prototype.canvasHeight = this.bgCanvas.height;
      
      Ship.prototype.context = this.shipContext;
      Ship.prototype.canvasWidth = this.shipCanvas.width;
      Ship.prototype.canvasHeight = this.shipCanvas.height;

      Bullet.prototype.context = this.mainContext;
      Bullet.prototype.canvasWidth = this.mainCanvas.width;
      Bullet.prototype.canvasHeight = this.mainCanvas.height;

      //Initialize the background object
      this.background = new Background();
      this.background.init(0,0); // set draw point to 0,0
      
      // initialize the ship object
      this.ship = new Ship();
      // set the ship to start near the bottom middle of the canvas
      var shipStartX = this.shipCanvas.width/2 - imageRepository.spaceship.width/2;
      var shipStartY = this.shipCanvas.height - imageRepository.spaceship.height;
      this.ship.init(shipStartX, shipStartY, imageRepository.spaceship.width, imageRepository.spaceship.height);

      return true;
      
    } else {
      return false;
    }
  };
  
  // start the animation loop
  
  this.start = function() {
    this.ship.draw();
    animate();
  };
  
}


/**
* The animation loop. Calls the
* requestAnimationFrame shim to
* optimize the game loop and draws
* all game objects. This functions
* must be a global function and
* cannot be within an object.
**/

function animate() {
  requestAnimFrame(animate);
  game.background.draw();
  game.ship.move();
  game.ship.bulletPool.animate();
}

/**
* requestAnim shim layer by Paul Irish
* Finds the first API that works
* to optimize the animation loop,
* otherwise defaults to setTImeout()
**/

window.requestAnimFrame = (function(){
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.oRequestAnimationFrame || 
    window.msRequestAnimationFrame || 
    function(/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

/**
* Initializes the Game and starts it.
**/

var game = new Game();

function init() {
  if(game.init())
    game.start();
}