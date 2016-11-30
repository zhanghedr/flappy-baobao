// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

// Create our 'main' state that will contain the game
var mainState = {
    
    // This function will be executed at the beginning     
    // load the game's assets  
    preload: function() { 
        // background picture
        game.load.image('background', 'imgs/background.png');
        
        // load the bird sprite
        game.load.image('bird', 'imgs/bird.png'); 
        
        // load the pipe sprite
        game.load.image('pipe', 'imgs/pipe.png');
        
        // sound
        game.load.audio('jump', 'songs/jump.wav');
        game.load.audio('dead', 'songs/player_dead.wav');
    },
    
    // This function is called after the preload function      
    create: function() { 
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        // display background pic
        this.bg = game.add.tileSprite(0, 0, 400, 490, "background");
        
        // Display the bird on the screen
        this.bird = game.add.sprite(100, 245, 'bird');
        
        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  
        
        // add anchor to the bird
        this.bird.anchor.setTo(-0.2, 0.5);
        
        // Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 
        
        // mobile tap input
        game.input.onTap.add(function(e){
            this.jump();
        }); 
        
        // create pipe group
        this.pipes = game.add.group();  
        this.pipes.enableBody = true;  // Add physics to the group  
        this.pipes.createMultiple(20, 'pipe'); // Create 20 pipes  
        
        // call the addRowOfPipes() function every 1.5 seconds
        this.timer = game.time.events.loop(1600, this.addRowOfPipes, this);  
        
        // score
        this.score = 0;  
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" }); 
        
        // sound
        this.jumpSound = game.add.audio('jump');
        this.deadSound = game.add.audio('dead');
    },
    
    // This function is called 60 times per second    
    // game logic   
    update: function() {
        // If the bird is out of the world (too high or too low), call the 'restartGame' function
        if(this.bird.inWorld == false)
            this.restartGame();
        
        // handle collide
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        
        // bird animation
        if (this.bird.angle < 20)  
            this.bird.angle += 1;
        
    },
    
    // Make the bird jump 
    jump: function() { 
        // dont jump if bird is dead
        if (this.bird.alive == false)  
            return; 

        // Add a vertical velocity to the bird 
        this.bird.body.velocity.y = -350;
        
        // Create an animation on the bird
        var animation = game.add.tween(this.bird);

        // Set the animation to change the angle of the sprite to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);

        // And start the animation
        animation.start();  
        
        // sound
        this.jumpSound.play(); 
    },
    
    // add one pipe
    addOnePipe: function(x, y) {  
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();

        // Set the new position of the pipe
        pipe.reset(x, y);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 

        // Kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    
    addRowOfPipes: function() {  
        // Pick where the hole will be, 1-6
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes 
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1) 
                this.addOnePipe(400, i * 60 + 10);   
        
        // score + 1
        this.score++;
        this.labelScore.text = this.score;
    },
    
    hitPipe: function() {  
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive == false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;  // bird cannot be controlled if it's dead
        
        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);
        
        // dead sound
        this.deadSound.play();
        this.deadText = game.add.text(100, 100, "Game Over", { font: "30px Arial", fill: "#ffffff" });
        
        // Go through all the pipes, and stop their movement
        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
    },
    
    // Restart the game
    restartGame: function() {  
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main');  