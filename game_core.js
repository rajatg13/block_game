var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '30px Arial';

// height and width of the canvas
var WIDTH = 500;
var HEIGHT = 500;

// keep track of the time player survived
var timeStarted = Date.now();
var frameCount = 0;

var score = 0;

// create object player
var player = {
    x:50,
    y:40,
    hp:12,
    width:20,
    height:20,
    color:'green',
    numofbul:0,
    shootang:0,
    pressdown:false,
    pressup:false,
    pressleft:false,
    pressright:false
};

// create enemy and stores them in the list
Enemy = function (id,x, y, spdx, spdy, width, height){
    var enemy = {
        x:x,
        spdx:spdx,
        y:y,
        spdy:spdy,
        id:id,
        width:width,
        height:height,
        color:'red',
        shootang:0
    };
    enemyList[id] = enemy;
}

// gets distance between player and enemy
getDistanceBetweenEntity = function(entity1, entity2){
    var vx = entity1.x-entity2.x;
    var vy = entity1.y-entity2.y;
    return Math.sqrt(vx*vx+vy*vy);
}

// makes two rectangles, one for player and other the enemy
testCollisionEntity = function(entity1, entity2){
    var rect1 = {
        x:entity1.x-entity2.width/2,
        y:entity1.y-entity1.height/2,
        width:entity1.width,
        height:entity1.height
    }

    var rect2 = {
        x:entity2.x-entity2.width/2,
        y:entity2.y-entity2.height/2,
        width:entity2.width,
        height:entity2.height
    }
    
    return testCollisionRect(rect1, rect2);
}

// controls the shooting angle
document.onmousemove = function(mouse){

    var mouseX = mouse.clientX - document.getElementById('ctx').getBoundingClientRect().left;
    var mouseY = mouse.clientY - document.getElementById('ctx').getBoundingClientRect().top;

    mouseX -= player.x;
    mouseY -= player.y;
    player.shootang = Math.atan2(mouseX, mouseY) /Math.PI * 180;
 }

 // shoots bullets on left click
document.onclick = function(){
    if(player.numofbul > 0){
        randomlyGenerateBullet(player);
        player.numofbul--;
    }
}

// shoots special attack on right click
document.oncontextmenu = function(mouse){
    if(player.numofbul >= 10){
        for(var i = 0; i < 360; i += 36){
            randomlyGenerateBullet(player, i);
        }
        player.numofbul -= 10;
    }
    mouse.preventDefault();
}

// know when a key is pressed
document.onkeydown = function(event){
    if(event.key === 'ArrowRight')
        player.pressright = true;
    else if(event.key === 'ArrowDown')
        player.pressdown = true;
    else if(event.key === 'ArrowLeft')
        player.pressleft = true;
    else if(event.key === 'ArrowUp')
        player.pressup = true;
}

// know when a key is done pressing
document.onkeyup = function(event){
    if(event.key === 'ArrowRight')
        player.pressright = false;
    else if(event.key === 'ArrowDown')
        player.pressdown = false;
    else if(event.key === 'ArrowLeft')
        player.pressleft = false;
    else if(event.key === 'ArrowUp')
        player.pressup = false;
}

// update the position of player based on the keys pressed
updatePlayerPosition = function(){
    if(player.pressright)
        player.x += 10;
    else if(player.pressleft)
        player.x -= 10;
    else if(player.pressdown)
        player.y += 10;
    else if(player.pressup)
        player.y -= 10;

    // keep the player in the game boundary
    if(player.x < player.width/2)
        player.x = player.width/2;
    if(player.x > WIDTH - player.width/2)
        player.x = WIDTH - player.width/2;
    if(player.y < player.height/2)
        player.y = player.height/2;
    if(player.y > HEIGHT - player.height/2)
        player.y = HEIGHT - player.height/2;
}


// calls other functions
updateEntity = function(something){
    updateEntityPosition(something);
    drawEntity(something);
}

// updates the position of the object (keeps them moving)
updateEntityPosition = function(something){
    something.x += something.spdx;
    something.y += something.spdy;
    

    if(something.x > WIDTH || something.x < 0){
        something.spdx = -something.spdx;
    }
    if(something.y > HEIGHT || something.y < 0){
        something.spdy = -something.spdy;
    }
}

// checks if the two rectangles collide
testCollisionRect = function(rect1, rect2){
    return rect1.x <= rect2.x+rect2.width
    && rect2.x <= rect1.x+rect1.width
    && rect1.y <= rect2.y+rect2.height
    && rect2.y <= rect1.y+rect1.height;
}


// draws the objects on the canvas
drawEntity = function(something){
    ctx.save();
    ctx.fillStyle = something.color;
    ctx.fillRect(something.x - something.width/2,something.y - something.height/2, something.width, something.height);
    ctx.restore();
}

// starts a new game
newGame = function(){
    player.hp = 12;
    timeStarted = Date.now();
    frameCount = 0;
    enemyList = {};
    upgradeList = {};
    bulletList = {};
    score = 0;
    player.numofbul = 0;
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
}

// main function
update = function (){
    // clears the previous locations
    ctx.clearRect(0,0, WIDTH, HEIGHT);

    frameCount++;
    score++;

    // generate in enemy after 4s.
    if(frameCount % 100 == 0)
        randomlyGenerateEnemy();

    // generate upgrade after 3s.
    if(frameCount % 75 == 0)
        randomlyGenerateUpgrade();


    // go through bullet list
    for(var key in bulletList){
        updateEntity(bulletList[key]);

        // delete bullet if it touches boundary
        if(bulletList[key].x >= 500 || bulletList[key].x <= 0 || bulletList[key].y >= 500 || bulletList[key].y <= 0){
            delete bulletList[key];
            continue;
        }

        // if bullet collides with enemy then delete both
        for(var key2 in enemyList){
            var isColliding = testCollisionEntity(bulletList[key], enemyList[key2]);
            if(isColliding){
                delete enemyList[key2];
                delete bulletList[key];
                break;
            }
        }
    }
    
    // go through upgradelist
    for(var key in upgradeList){
        updateEntity(upgradeList[key]);
        var isColliding = testCollisionEntity(player, upgradeList[key]);
        if(isColliding){
            if(upgradeList[key].category === 'one'){
                player.numofbul++;
            }else{
                player.numofbul += 5;
                
            }

            delete upgradeList[key];
        }
    }


    // go through enemies
    for(var key in enemyList){
        updateEntity(enemyList[key]);

        var isColliding = testCollisionEntity(player, enemyList[key]);
        if(isColliding){
            player.hp = player.hp - 1;
            
        }
    }
    if(player.hp <= 0){
        var timeSurvived = Date.now() - timeStarted;
        console.log("you lost! you survived for " + timeSurvived + "ms.");
        newGame();
    }

    // update the position of player controlled through keys
    updatePlayerPosition();
    drawEntity(player);
    ctx.fillText(player.hp + "hp", 0, 30);
    ctx.fillText("score: " + score, 200, 30);
    ctx.fillText("Bullets: " + player.numofbul, 350, 490);
}

// generate enemies with random function
randomlyGenerateEnemy = function(){
    var x = Math.random() * WIDTH;
    var y = Math.random() * HEIGHT;
    var height = 10  + Math.random() * 30;
    var width = 10 + Math.random() * 30;
    var id = Math.random();
    var spdx = 5 + Math.random() * 5;
    var spdy = 5 + Math.random() * 5;
    Enemy(id,x,y,spdx,spdy,width,height);
}

// creates upgrades and stores them in list
upgrade = function (id,x, y, spdx, spdy, width, height, category, color){
    var upgrade = {
        x:x,
        spdx:spdx,
        y:y,
        spdy:spdy,
        id:id,
        width:width,
        height:height,
        color:color,
        category:category
    };
    upgradeList[id] = upgrade;
}

// generates upgrades
randomlyGenerateUpgrade = function(){
    var x = Math.random() * WIDTH;
    var y = Math.random() * HEIGHT;
    var height = 10; 
    var width = 10;
    var id = Math.random();
    var spdx = 0;
    var spdy = 0;

    if(Math.random() < 0.5){
        var category = 'one';
        var color = 'orange';
    }else{
        var category = 'five';
        var color = 'purple';
    }
    upgrade(id,x,y,spdx,spdy,width,height,category,color);
}

// creates bullets and stores them in list
bullet = function (id,x, y, spdx, spdy, width, height){
    var bullet = {
        x:x,
        spdx:spdx,
        y:y,
        spdy:spdy,
        //name:'E',
        id:id,
        width:width,
        height:height,
        color:'black',

    };
    bulletList[id] = bullet;
}

// generates bullets
randomlyGenerateBullet = function(actor, overwrite){
    var x = actor.x;
    var y = actor.y;
    var height = 5; 
    var width = 5;
    var id = Math.random();

    var angle = actor.shootang;
    if(overwrite != undefined)
       angle = overwrite;

    var spdx = Math.cos(angle/180*Math.PI)*5;
    var spdy = Math.sin(angle/180*Math.PI)*5;
    bullet(id,x,y,spdx,spdy,width,height);
}


newGame();
 

setInterval(update, 40);
