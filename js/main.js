var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game');

var mainState = {
    // preload game imgs and songs  
    preload: function() { 
        game.load.image('background', 'imgs/background.png');
        game.load.image('bird', 'imgs/bird.png'); 
        game.load.image('pipe', 'imgs/pipe.png');
        game.load.audio('jump', 'songs/jump.wav');
        game.load.audio('dead', 'songs/player_dead.wav');
    },
    // after preload
    create: function() { 
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.bg = game.add.tileSprite(0, 0, 400, 490, "background");
        this.bird = game.add.sprite(100, 245, 'bird');
        
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  
        this.bird.anchor.setTo(-0.2, 0.5);
        
        // jump when SPACEBAR is hit
        var spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceBar.onDown.add(this.jump, this); 
        game.input.onTap.add(function(e) { 
            this.jump();
        }); 
        
        // create 20 pipes
        this.pipes = game.add.group();  
        this.pipes.enableBody = true;  
        this.pipes.createMultiple(20, 'pipe');
        
        this.timer = game.time.events.loop(1600, this.addPipes, this);  
        
        this.score = 0;  
        this.scoreText = game.add.text(20, 20, "0", { font: "32px Arial", fill: "#ffffff" }); 
        
        this.jumpSound = game.add.audio('jump');
        this.deadSound = game.add.audio('dead');
    },  
    update: function() {
        // restart game when out of bounds
        if(this.bird.inWorld == false)
            this.restartGame();
        if (this.bird.angle < 20)  
            this.bird.angle += 1;
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
    },
    jump: function() { 
        if (this.bird.alive == false)  
            return; 
        this.bird.body.velocity.y = -350;
        var animation = game.add.tween(this.bird);
        animation.to({angle: -20}, 100).start();  
        this.jumpSound.play(); 
    },
    addPipes: function() {  
        var hole = Math.floor(Math.random() * 5) + 1;
        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole + 1) 
                this.addPipe(400, i * 60 + 10);   
        }
        this.scoreText.text = ++this.score;
    },
    addPipe: function(x, y) {  
        var firstDeadPipe = this.pipes.getFirstDead();
        firstDeadPipe.reset(x, y);
        firstDeadPipe.body.velocity.x = -200; 
        // kill pipe when out of bounds
        firstDeadPipe.checkWorldBounds = true;
        firstDeadPipe.outOfBoundsKill = true;
    },
    hitPipe: function() {  
        if (this.bird.alive == false)
            return;
        this.bird.alive = false; 
        game.time.events.remove(this.timer);
        this.deadText = game.add.text(100, 100, "Game Over", { font: "32px Arial", fill: "#ffffff" });
        this.deadSound.play();
        this.pipes.forEachAlive(function(p) {
            p.body.velocity.x = 0;
        }, this);
    },
    restartGame: function() {  
        game.state.start('main');
    }
};

game.state.add('main', mainState);  
game.state.start('main');  
