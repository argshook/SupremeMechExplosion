/** 
* Define singleton!
* Singleton is a type of object
* which contains all our images
* so that they are only created once
**/

var imageRepository = function() {
  // Define images
  this.background = new Image();
  
  // Set images src  
  this.background.src = "http://www.wallseemly.com/wallpapers/2013/04/Background-texture-dark-shadow-480x360.jpg";;
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
    this.bgCanvas = document.getElementById('background');
    
    // test to see if canvas is supported
    if(this.bgCanvas.getContext) {
      this.bgContext = this.bgCanvas.getContext('2d');
      
      // Initialize objects to contain their context and canvasinformation
      
      Background.prototype.context = this.bgContext;
      
      Background.prototype.canvasWidth = this.bgCanvas.width;

      Background.prototype.canvasHeight = this.bgCanvas.height;
      
      //Initialize the background object
      
      this.background = new Background();
      
      this.background.init(0,0); // set draw point to 0,0
      
      return true;
      
    } else {
      return false;
    }
  };
  
  // start the animation loop
  
  this.start = function() {
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
  requestAnimFrame( animate );
  game.background.draw();
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



// initialize!
window.onload = function() {
 // init();
};