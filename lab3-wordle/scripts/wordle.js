window.onload = function () {
    // Exercise 1: Array of possible words
    const wordList = [
        'media', 'table', 'chair', 'piano', 'mouse', 
        'house', 'plant', 'brain', 'cloud', 'beach', 
        'fruit', 'pizza', 'dance', 'water', 'paper'
    ];

    let board = document.getElementById('board');
    let guessButton = document.getElementById('guessButton');
    let guessInput = document.getElementById('guessInput');
    let newGameButton = document.getElementById('newGameButton');
    let messageDiv = document.getElementById('message');
    let statsDiv = document.getElementById('stats');

    let word;
    let tries = 0;
    let gameOver = false;

    // Exercise 9: Load statistics from localStorage
    let stats = {
        gamesPlayed: parseInt(localStorage.getItem('gamesPlayed')) || 0,
        gamesWon: parseInt(localStorage.getItem('gamesWon')) || 0,
        currentStreak: parseInt(localStorage.getItem('currentStreak')) || 0
    };

    function createBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            let row = document.createElement('div');
            row.classList.add('row');
            board.append(row);

            for (let j = 0; j < 5; j++) {
                let cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-column', j);
                row.append(cell);
            }
        }
    }

    // Exercise 1: Initialize game with random word
    function initGame() {
        word = wordList[Math.floor(Math.random() * wordList.length)];
        tries = 0;
        gameOver = false;
        guessInput.value = '';
        guessInput.disabled = false;
        guessButton.disabled = false;
        createBoard();
        hideMessage();
        newGameButton.classList.add('hidden');
        updateStatsDisplay();
        console.log('Secret word:', word); // For testing
    }

    // Exercise 2: Show message function
    function showMessage(text, type = 'error') {
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + type;
        setTimeout(() => {
            hideMessage();
        }, 3000);
    }

    function hideMessage() {
        messageDiv.classList.add('hidden');
    }

    // Exercise 2: Input validation
    function validateInput(guess) {
        if (!guess || guess.length !== 5) {
            showMessage('Please enter exactly 5 letters!', 'error');
            return false;
        }
        if (!/^[a-zA-Z]+$/.test(guess)) {
            showMessage('Please enter only letters!', 'error');
            return false;
        }
        return true;
    }

    // Exercise 8: Enhanced color feedback logic for duplicate letters
    function getColorFeedback(guess, word) {
        let feedback = new Array(5).fill('red');
        let wordLetters = word.split('');
        let guessLetters = guess.split('');

        // First pass: Mark correct positions (green)
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === wordLetters[i]) {
                feedback[i] = 'green';
                wordLetters[i] = null; // Mark as used
                guessLetters[i] = null;
            }
        }

        // Second pass: Mark wrong positions (yellow)
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] !== null) {
                let index = wordLetters.indexOf(guessLetters[i]);
                if (index !== -1) {
                    feedback[i] = 'yellow';
                    wordLetters[index] = null; // Mark as used
                }
            }
        }

        return feedback;
    }

    function makeGuess() {
        if (gameOver) {
            showMessage('Game is already over!', 'info');
            return;
        }

        let guess = guessInput.value.toLowerCase();

        // Exercise 2: Validate input
        if (!validateInput(guess)) {
            return;
        }

        // Exercise 8: Get proper color feedback
        let feedback = getColorFeedback(guess, word);

        // Exercise 7: Add animation and update cells
        for (let i = 0; i < 5; i++) {
            let currentCell = document.querySelector(
                `[data-row="${tries}"][data-column="${i}"]`
            );
            
            setTimeout(() => {
                let currentLetter = document.createTextNode(guess[i]);
                currentCell.append(currentLetter);
                currentCell.classList.add('flip');
                currentCell.classList.add(feedback[i]);
            }, i * 100);
        }

        if (word === guess) {
            setTimeout(() => {
                showMessage('🎉 You won! Great job!', 'success');
                gameOver = true;
                guessInput.disabled = true;
                guessButton.disabled = true;
                newGameButton.classList.remove('hidden');
                
                // Exercise 9: Update statistics
                stats.gamesPlayed++;
                stats.gamesWon++;
                stats.currentStreak++;
                saveStats();
                updateStatsDisplay();
                statsDiv.classList.remove('hidden');
            }, 600);
            return;
        }

        if (tries === 5) {
            setTimeout(() => {
                // Exercise 6: Display correct word on loss
                showMessage(`You lost! The word was: ${word.toUpperCase()}`, 'error');
                gameOver = true;
                guessInput.disabled = true;
                guessButton.disabled = true;
                newGameButton.classList.remove('hidden');
                
                // Exercise 9: Update statistics
                stats.gamesPlayed++;
                stats.currentStreak = 0;
                saveStats();
                updateStatsDisplay();
                statsDiv.classList.remove('hidden');
            }, 600);
            return;
        }

        tries++;
        guessInput.value = '';
        guessInput.focus();
    }

    // Exercise 9: Save and update statistics
    function saveStats() {
        localStorage.setItem('gamesPlayed', stats.gamesPlayed);
        localStorage.setItem('gamesWon', stats.gamesWon);
        localStorage.setItem('currentStreak', stats.currentStreak);
    }

    function updateStatsDisplay() {
        document.getElementById('gamesPlayed').textContent = stats.gamesPlayed;
        let winPercentage = stats.gamesPlayed > 0 
            ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
            : 0;
        document.getElementById('winPercentage').textContent = winPercentage;
        document.getElementById('currentStreak').textContent = stats.currentStreak;
    }

    // Exercise 5: Keyboard support (Enter key)
    guessInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            makeGuess();
        }
    });

    guessButton.addEventListener('click', makeGuess);

    // Exercise 4: New Game button
    newGameButton.addEventListener('click', function() {
        initGame();
        statsDiv.classList.add('hidden');
    });

    // Initialize the game
    initGame();
}