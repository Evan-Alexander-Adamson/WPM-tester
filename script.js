const startBtn = document.getElementById('start-btn');
const textDisplay = document.getElementById('text-display');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const finalScoreDiv = document.getElementById('final-score');
const resultMessage = document.getElementById('result-message');
const finalWpm = document.getElementById('final-wpm');
const finalAccuracy = document.getElementById('final-accuracy');
const retryBtn = document.getElementById('retry-btn');
const typedLinesDiv = document.getElementById('typed-lines');
const laserZap = document.getElementById('laser-zap');
const restartBtn = document.getElementById('restart-btn');

// Initialize confetti
const confettiCanvas = document.getElementById('confetti-canvas');
const myConfetti = confetti.create(confettiCanvas, { resize: true });

// Define test texts
const easyText = `The concept of mindfulness has gained significant attention in recent years, emphasizing the importance of being present in the moment. Mindfulness practices, such as meditation and deep breathing, can reduce stress and improve overall well-being. By focusing on the present, individuals can develop a greater awareness of their thoughts and emotions, leading to better emotional regulation and mental clarity. Incorporating mindfulness into daily routines can transform ordinary activities into opportunities for calm and introspection, fostering a more balanced and fulfilling life.`;

const hardText = `The path to mastering the keyboard is paved with constant practice and familiarity with syntax. Writing JavaScript, for example, requires repetitive use of various symbols and keywords. Consider the importance of efficient typing when dealing with functions, such as function myFunction() {}, or defining variables using let, const, and var. The meticulous placement of parentheses (), curly braces {}, and semicolons ; becomes second nature with practice. To enhance muscle memory, one should also repeatedly type common coding structures like loops. For instance, for (let i = 0; i < array.length; i++) {} and while (condition) {}. Writing complex conditions within if (condition) {} statements also helps solidify these patterns in the mind. Furthermore, understanding and utilizing methods like array.map(), array.filter(), and array.reduce() efficiently can save time and keystrokes. Another key aspect is the frequent use of shortcuts, such as Ctrl+C and Ctrl+V for copying and pasting, or Ctrl+Z to undo, which are essential for a smooth coding workflow. Mastery of these elements is not just about speed but about developing an intuitive feel for the keyboard, ensuring that your fingers know where to go without a conscious effort. This kind of muscle memory allows a coder to focus more on problem-solving and creativity rather than on the mechanics of typing.`;

// Track current difficulty level
let currentLevel = 'easy';

// Initialize variables
let startTime;
let totalTyped = 0;
let correctTyped = 0;
let timer;
let timeLeft = 300; // 5 minutes in seconds
let countdown;
let currentCharIndex = 0;

// Function to wrap each character in a span
const wrapCharacters = () => {
    const text = currentLevel === 'easy' ? easyText : hardText;
    textDisplay.innerHTML = '';
    for (let char of text) {
        const span = document.createElement('span');
        span.innerText = char;
        textDisplay.appendChild(span);
    }
};

// Initialize the wrapped text
wrapCharacters();

// Helper function to format time as minutes:seconds
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Function to start the test
const startTest = () => {
    startBtn.disabled = true;
    
    // Create and show countdown elements
    const messages = ['Ready...', 'Set...', 'Type!'];
    let index = 0;
    
    const showCountdown = () => {
        const countdownEl = document.createElement('div');
        countdownEl.className = 'start-countdown';
        countdownEl.textContent = messages[index];
        document.body.appendChild(countdownEl);
        
        // Remove the element after animation
        setTimeout(() => {
            countdownEl.remove();
            index++;
            if (index < messages.length) {
                showCountdown();
            } else {
                // Start the actual test after countdown
                initializeTest();
            }
        }, 600);
    };
    
    showCountdown();
};

// Move the original startTest logic to a new function
const initializeTest = () => {
    currentCharIndex = 0;
    correctTyped = 0;
    totalTyped = 0;
    
    // Reset and wrap characters
    wrapCharacters();
    const spans = textDisplay.querySelectorAll('span');
    spans.forEach(span => {
        span.classList.remove('correct', 'incorrect', 'current');
    });
    
    // Add cursor to first character
    if (spans.length > 0) {
        spans[0].classList.add('current');
    }
    
    // Initialize timer
    startTime = new Date();
    timeLeft = 300; // 5 minutes
    timerDisplay.textContent = formatTime(timeLeft);
    
    // Start WPM and countdown timers
    timer = setInterval(calculateWPM, 1000);
    countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);

    // Show test area and controls
    finalScoreDiv.classList.add('hidden');
    document.querySelector('.test-area').style.display = 'block';
    document.querySelector('.controls').style.display = 'flex';
    typedLinesDiv.innerHTML = '';
    typedLinesDiv.classList.add('hidden');

    // Reset final score styles
    resultMessage.style.color = '#ffffff';
    resultMessage.textContent = '';

    // Make sure the correct text is displayed
    textDisplay.innerText = currentLevel === 'easy' ? easyText : hardText;
    wrapCharacters();

    // Re-add keypress listener
    document.addEventListener('keydown', handleKeyPress);
};

// Function to calculate WPM
const calculateWPM = () => {
    const currentTime = new Date();
    const timeElapsed = Math.max((currentTime - startTime) / 1000 / 60, 0.001); // in minutes
    const wordsTyped = correctTyped / 5; // standard: 5 characters = 1 word
    const wpm = Math.round(wordsTyped / timeElapsed);
    const accuracy = Math.round((correctTyped / totalTyped) * 100) || 100;
    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = accuracy;
};

// Function to end the test
const endTest = () => {
    clearInterval(countdown);
    clearInterval(timer);
    startBtn.disabled = false;

    // Calculate final scores
    const currentTime = new Date();
    const timeElapsed = Math.max((currentTime - startTime) / 1000 / 60, 0.001);
    const wordsTyped = correctTyped / 5;
    const finalWpmValue = Math.round(wordsTyped / timeElapsed);
    
    // Get total possible characters
    const totalPossibleChars = textDisplay.querySelectorAll('span').length;
    
    // Calculate accuracy based on total possible characters
    const finalAccuracyValue = Math.round((correctTyped / totalPossibleChars) * 100);
    const isCompleted = currentCharIndex === totalPossibleChars;

    // Update the final score display
    finalWpm.textContent = finalWpmValue;
    finalAccuracy.textContent = finalAccuracyValue;
    
    // Set message based on accuracy and completion
    if (currentLevel === 'easy') {
        if (isCompleted && finalAccuracyValue >= 70) {
            resultMessage.textContent = '🏆 Great job! Ready for the challenge?';
            currentLevel = 'hard';
            retryBtn.textContent = 'Next Challenge';
        } else if (finalAccuracyValue >= 90) {
            resultMessage.textContent = '✨ Great job, but finish the whole text next time!';
        } else if (finalAccuracyValue >= 80) {
            resultMessage.textContent = '🌟 Nice typing! Getting closer to excellence!';
        } else if (finalAccuracyValue >= 70) {
            resultMessage.textContent = '💪 Good progress! Keep pushing forward!';
        } else if (finalAccuracyValue >= 60) {
            resultMessage.textContent = '📈 You\'re improving! Stay focused!';
        } else {
            resultMessage.textContent = '🎯 Keep practicing, you\'ll get it next time!';
        }
    } else {
        // Hard level completion messages
        if (isCompleted && finalAccuracyValue === 100) {
            resultMessage.textContent = '🏆 FLAWLESS VICTORY! 🏆';
            myConfetti({
                particleCount: 200,
                spread: 70,
                origin: { y: 0.6 }
            });
            triggerLaserZap();
        } else if (finalAccuracyValue >= 90) {
            resultMessage.textContent = '✨ Great job, go for perfect next time!';
            myConfetti({
                particleCount: 100,
                spread: 60,
                origin: { y: 0.6 }
            });
            triggerLaserZap();
        } else if (finalAccuracyValue >= 80) {
            resultMessage.textContent = '🌟 Nice typing! Getting closer to excellence!';
        } else if (finalAccuracyValue >= 70) {
            resultMessage.textContent = '💪 Good progress! Keep pushing forward!';
        } else if (finalAccuracyValue >= 60) {
            resultMessage.textContent = '📈 You\'re improving! Stay focused!';
        } else {
            resultMessage.textContent = '🎯 Keep practicing, you\'ll get it next time!';
        }
        retryBtn.textContent = 'Try Again';
    }

    // Make sure these elements are hidden
    document.querySelector('.test-area').style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
    
    // Show the final score dialog
    finalScoreDiv.style.display = 'block';
    finalScoreDiv.classList.remove('hidden');

    // Remove keypress listener
    document.removeEventListener('keydown', handleKeyPress);
};

// Function to trigger Laser Zap Animation
const triggerLaserZap = () => {
    laserZap.style.animation = 'laser-zap 0.5s forwards';
    // Remove the animation after it completes to allow re-triggering
    laserZap.addEventListener('animationend', () => {
        laserZap.style.animation = '';
    }, { once: true });
};

// Function to handle key presses
const handleKeyPress = (e) => {
    // Prevent spacebar from scrolling or triggering buttons
    if (e.code === 'Space') {
        e.preventDefault();
    }

    // Always check for Enter key first
    if (e.key === 'Enter') {
        e.preventDefault();
        endTest();
        return;
    }

    // Ignore key presses if the test hasn't started
    if (timeLeft <= 0 || startBtn.disabled === false) return;

    const spans = textDisplay.querySelectorAll('span');
    if (currentCharIndex >= spans.length) return;

    // Remove current cursor from previous position
    spans.forEach(span => span.classList.remove('current'));
    
    // Handle backspace
    if (e.key === 'Backspace' && currentCharIndex > 0) {
        e.preventDefault();
        currentCharIndex--;
        const currentSpan = spans[currentCharIndex];
        
        if (currentSpan.classList.contains('correct')) {
            correctTyped--;
        }
        
        currentSpan.classList.remove('correct', 'incorrect');
        // Add cursor to new position
        currentSpan.classList.add('current');
        totalTyped--;
        return;
    }

    const currentSpan = spans[currentCharIndex];
    const key = e.key;

    if (key.length !== 1) return;

    totalTyped++;

    const container = document.querySelector('.container');
    
    if (key === currentSpan.innerText) {
        currentSpan.classList.add('correct');
        correctTyped++;
    } else {
        currentSpan.classList.add('incorrect');
        container.classList.add('shake');
        container.addEventListener('animationend', () => {
            container.classList.remove('shake');
        }, { once: true });
    }

    currentCharIndex++;
    
    // Add cursor to next position if not at the end
    if (currentCharIndex < spans.length) {
        spans[currentCharIndex].classList.add('current');
    }

    // Check if we've reached the end of the text
    if (currentCharIndex === spans.length) {
        endTest();
    }
};

// Retry Button Listener
retryBtn.addEventListener('click', () => {
    finalScoreDiv.classList.add('hidden');
    startBtn.disabled = false;
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100';
    timerDisplay.textContent = formatTime(300);
    typedLinesDiv.innerHTML = '';
    typedLinesDiv.classList.add('hidden');
    
    // Update the display text based on current level
    textDisplay.innerText = currentLevel === 'easy' ? easyText : hardText;
    wrapCharacters();
});

// Start Test Button Listener
startBtn.addEventListener('click', () => {
    startTest();
});

// Restart Test Button Listener
restartBtn.addEventListener('click', () => {
    // Clear intervals if they exist
    if (countdown) clearInterval(countdown);
    if (timer) clearInterval(timer);
    
    // Reset everything except the currentLevel
    finalScoreDiv.classList.add('hidden');
    startBtn.disabled = false;
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100';
    timerDisplay.textContent = formatTime(300);
    typedLinesDiv.innerHTML = '';
    typedLinesDiv.classList.add('hidden');
    currentCharIndex = 0;
    correctTyped = 0;
    totalTyped = 0;
    
    // Keep the current level's text
    textDisplay.innerText = currentLevel === 'easy' ? easyText : hardText;
    wrapCharacters();
    
    // Show test area and controls
    document.querySelector('.test-area').style.display = 'block';
    document.querySelector('.controls').style.display = 'flex';
    
    // Start a new test
    startTest();
});

// Listen for key presses on the document
document.addEventListener('keydown', handleKeyPress);
