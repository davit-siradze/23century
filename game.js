let dino = document.getElementById('dino');
let obstacle = document.getElementById('obstacle');
let obstacle2 = document.getElementById('obstacle2');
let scoreDisplay = document.getElementById('score');
let levelDisplay = document.getElementById('levelDisplay');
let gameContainer = document.getElementById('gameContainer');
let gameOverBox = document.getElementById('gameOverBox');
let finalScore = document.getElementById('finalScore');
let playAgainButton = document.getElementById('playAgainButton');
let mobileMessageBox = document.getElementById('mobileMessageBox');
let startGameButton = document.getElementById('startGameButton');
let codeMessageGameOver = document.getElementById('codeMessageGameOver');
let congratulatoryMessageBox = document.getElementById('congratulatoryMessage');
let codeMessageCongratulatory = document.getElementById('codeMessageCongratulatory');

const DIFFICULTY_LEVELS = [
    { speed: 5, jumpVelocity: 16, spawnChance: 0.6, obstacleSpacing: 40 },
    { speed: 6, jumpVelocity: 15, spawnChance: 0.65, obstacleSpacing: 60 },
    { speed: 7, jumpVelocity: 14, spawnChance: 0.7, obstacleSpacing: 80 },
    { speed: 8, jumpVelocity: 13, spawnChance: 0.75, obstacleSpacing: 100 },
    { speed: 9, jumpVelocity: 12, spawnChance: 0.8, obstacleSpacing: 120 },
    { speed: 10, jumpVelocity: 11, spawnChance: 0.85, obstacleSpacing: 140 },
    { speed: 11, jumpVelocity: 10, spawnChance: 0.9, obstacleSpacing: 160 },
    { speed: 15, jumpVelocity: 9, spawnChance: 0.95, obstacleSpacing: 155 },
    { speed: 15, jumpVelocity: 8, spawnChance: 1.0, obstacleSpacing: 200 },
    { speed: 16, jumpVelocity: 7, spawnChance: 1.05, obstacleSpacing: 220 }
];

let isJumping = false;
let isFalling = false;
let score = 0;
let obstacleSpeed = DIFFICULTY_LEVELS[0].speed;
let gameOver = false;

const GRAVITY = -0.6;
let JUMP_VELOCITY = DIFFICULTY_LEVELS[0].jumpVelocity;
let obstacleSpacing = DIFFICULTY_LEVELS[0].obstacleSpacing;

let dinoBottom = 0;
let dinoVelocity = 0;

let difficultyIncreaseInterval = 2000;
let difficultyTimer = 0;

let currentLevel = 0;
let levelUpScore = 100;

function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

function startGame() {
    mobileMessageBox.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameLoop();
}

if (isMobile()) {
    gameContainer.classList.add('hidden');
    mobileMessageBox.classList.remove('hidden');

    startGameButton.addEventListener('click', startGame);

    startGameButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    }, { passive: false });
}

function jump() {
    if (!isJumping && !gameOver) {
        isJumping = true;
        dinoVelocity = JUMP_VELOCITY;
        dino.style.transition = 'none';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
});

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

document.addEventListener('touchend', (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

playAgainButton.addEventListener('click', () => {
    resetGame();
    gameOverBox.style.display = 'none';
});

playAgainButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    resetGame();
    gameOverBox.style.display = 'none';
}, { passive: false });

function resizeGameContainer() {
    gameContainer.style.width = window.innerWidth + 'px';
    gameContainer.style.height = window.innerHeight + 'px';
}

window.addEventListener('resize', resizeGameContainer);
resizeGameContainer();

function generateCode() {
    return Math.floor(1000000 + Math.random() * 9000000);
}

function updateDifficulty() {
    if (score >= (currentLevel + 1) * levelUpScore && currentLevel < DIFFICULTY_LEVELS.length - 1) {
        currentLevel++;
        obstacleSpeed = DIFFICULTY_LEVELS[currentLevel].speed;
        JUMP_VELOCITY = DIFFICULTY_LEVELS[currentLevel].jumpVelocity;
        difficultyIncreaseInterval = 2000 / (currentLevel + 1);
        obstacleSpacing = DIFFICULTY_LEVELS[currentLevel].obstacleSpacing;
        levelDisplay.innerText = `დონე: ${currentLevel}`;
        console.log(`Level Up! Current Level: ${currentLevel}`);

        if (currentLevel === DIFFICULTY_LEVELS.length - 1) {
            congratulatoryMessageBox.classList.remove('hidden');
            codeMessageCongratulatory.innerText = `Your code: ${generateCode()}`;
            console.log('Congratulations! You won a pack of biscuits!');
        }
    }
}

function updateGame() {
    if (gameOver) return;

    let containerRect = gameContainer.getBoundingClientRect();
    let dinoRect = dino.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();
    let obstacle2Rect = obstacle2.getBoundingClientRect();

    if (isJumping || isFalling) {
        dinoVelocity += GRAVITY;
        dinoBottom += dinoVelocity;
        if (dinoBottom <= 0) {
            dinoBottom = 0;
            isJumping = false;
            isFalling = false;
        } else if (dinoBottom > containerRect.height - dinoRect.height) {
            dinoBottom = containerRect.height - dinoRect.height;
            isFalling = false;
        }
        dino.style.bottom = dinoBottom + 'px';
    }

    let obstacleRight = parseInt(getComputedStyle(obstacle).right);
    obstacle.style.right = (obstacleRight + obstacleSpeed) + 'px';
    if (parseInt(getComputedStyle(obstacle).right) > containerRect.width) {
        obstacle.style.right = -obstacleSpacing + 'px';
        score += 10;
        scoreDisplay.innerHTML = `ორცხობილა <img src="img201.png" alt="cookie" id="cookieimg201">: ${score}`;

        updateDifficulty();

        if (Math.random() < DIFFICULTY_LEVELS[currentLevel].spawnChance) {
            obstacle2.classList.remove('hidden');
            obstacle2.style.right = -obstacleSpacing - 30 + 'px';
        } else {
            obstacle2.classList.add('hidden');
        }
    }

    if (!obstacle2.classList.contains('hidden')) {
        let obstacle2Right = parseInt(getComputedStyle(obstacle2).right);
        obstacle2.style.right = (obstacle2Right + obstacleSpeed) + 'px';
        if (parseInt(getComputedStyle(obstacle2).right) > containerRect.width) {
            obstacle2.classList.add('hidden');
        }
    }

    if ((dinoRect.left < obstacleRect.right &&
        dinoRect.right > obstacleRect.left &&
        dinoRect.bottom > obstacleRect.top) ||
        (!obstacle2.classList.contains('hidden') &&
         dinoRect.left < obstacle2Rect.right &&
         dinoRect.right > obstacle2Rect.left &&
         dinoRect.bottom > obstacle2Rect.top)) {
        gameOver = true;
        finalScore.innerHTML = `ორცხობილა <img src="img201.png" alt="cookie"  id="cookieimg201">: ${score}`;
        codeMessageGameOver.innerText = `Your code: ${generateCode()}`;
        gameOverBox.style.display = 'block';
    }

    difficultyTimer += 20;
    if (difficultyTimer >= difficultyIncreaseInterval) {
        difficultyTimer = 0;
    }
}

function resetGame() {
    gameOver = false;
    score = 0;
    scoreDisplay.innerHTML = `ორცხობილა <img src="img201.png" alt="cookie"  id="cookieimg201">: 0`;
    obstacle.style.right = -obstacleSpacing + 'px';
    obstacle2.classList.add('hidden');
    dinoBottom = 0;
    dinoVelocity = 0;
    dino.style.bottom = '0px';

    currentLevel = 0;
    obstacleSpeed = DIFFICULTY_LEVELS[0].speed;
    JUMP_VELOCITY = DIFFICULTY_LEVELS[0].jumpVelocity;
    obstacleSpacing = DIFFICULTY_LEVELS[0].obstacleSpacing;
    levelDisplay.innerText = `დონე: ${currentLevel}`;
    gameOverBox.style.display = 'none';
    congratulatoryMessageBox.classList.add('hidden');
}

function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);
}

if (!isMobile()) {
    gameLoop();
}
