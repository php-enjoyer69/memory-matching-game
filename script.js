// Emoji array containing symbols for the game
var emojiArray = ["💐", "🌹", "🍬", "🧁", "🌺", "🌈", "🌴", "🍓", "🍒", "🍎", "🍉", "🍊", "🥭", "🍍",
    "🍋", "🍏", "🍐", "🥝", "🍇", "🥥", "🍅", "🌶️", "🍄", "🧅", "🥦", "🥑", "🍔", "🍕", "🏵️", "🌻", "🎂", "🍩", "🍫", "🎈"
];

// Shuffle the emoji array once at the beginning
shuffle(emojiArray);

// Function to shuffle an array
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Global variables
var previousValue = "", // Value of last card revealed
    previousID, // ID of last card revealed
    previousPreviousID = 0, // ID of next-to-last card
    turn = 0, // Holds the state of the turn (first or second)
    timer, // Timer for the game
    gameMode, // Holds the current game mode
    remainingPairs, // Number of remaining pairs to match
    moves = 0, // Number of moves made
    minutes = 0, // Number of minutes elapsed
    seconds = 0; // Number of seconds elapsed

// Function to initialize window size
window.onresize = initializeWindowSize;

function initializeWindowSize() {
    // Adjusting body and overlay height based on window size
    var width = window.innerWidth;
    var height = window.innerHeight;
    document.body.style.height = height + "px";
    document.getElementById("overlay").style.height = height + "px";
}

// Function to show instructions window when the page loads
window.onload = function() {
    // Displaying instructions and mode selection buttons
    $("#overlay").html(`<center><div id="instructions"><h2 class="highlight">Welcome!</h2>Game instructions<br/><br/>
    <li>Make pairs of the same looking blocks by flipping them.</li>
    <li>Click on a block to flip it.</li>
    <li>If two blocks you clicked are not similar, they will be flipped back.</li>
    <br></br><p style="font-size:22px;" class="highlight">Choose one of the following modes to start the game:</p></div><button onclick="startGame(3, 4)">3 x 4</button>
    <button onclick="startGame(4, 4)">4 x 4</button>
    <button onclick="startGame(4, 5)">4 x 5</button>
    <button onclick="startGame(5, 6)">5 x 6</button>
    <button onclick="startGame(6, 6)">6 x 6</button>
    </center>`);
}

// Function to start the game with specified rows and columns
function startGame(rows, columns) {
    // Resetting global variables
    moves = 0;
    remainingPairs = rows * columns / 2;

    // Resetting timer and moves display
    minutes = 0;
    seconds = 0;
    document.getElementById("time").textContent = "Time: 00:00";
    document.getElementById("moves").textContent = "Moves: 0";
    clearInterval(timer);

    // Updating timer display every second
    timer = setInterval(function() {
        seconds++;
        if (seconds == 60) {
            minutes++;
            seconds = 0;
        }
        document.getElementById("time").textContent = "Time: " + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }, 1000);

    // Setting game mode
    gameMode = rows + "x" + columns;

    // Generating symbols array for this game and shuffling it
    var symbolsArray = emojiArray.slice(0, remainingPairs).concat(emojiArray.slice(0, remainingPairs));
    shuffle(symbolsArray);

    // Creating game table
    var tableHTML = "";
    var cellNumber = 1;
    for (var i = 1; i <= rows; i++) {
        tableHTML += "<tr>";
        for (var j = 1; j <= columns; j++) {
            tableHTML += `<td id='${cellNumber}' onclick="flipCard(${cellNumber})"><div class='inner'><div class='front'></div>
           <div class='back'><p>${symbolsArray[cellNumber-1]}</p></div></div></td>`;
            cellNumber++;
        }
        tableHTML += "</tr>";
    }
    document.querySelector("table").innerHTML = tableHTML;

    // Hiding instructions screen
    $("#overlay").fadeOut(500);
}

// Function for flipping blocks
function flipCard(cardID) {
    var currentCard = "#" + cardID + " .inner";
    var backFace = "#" + cardID + " .inner .back";

    // Checking if it's the second turn or card is already flipped
    if (turn == 2 || $(currentCard).attr("flip") == "yes" || previousPreviousID == cardID) {
        return;
    } else {
        // Flipping the card
        $(currentCard).find('.front').hide();
        $(currentCard).find('.back').show();

        if (turn == 1) {
            turn = 2;
            // Checking if cards match
            if (previousValue != $(backFace).text()) {
                // If not matching, flip back after a delay
                setTimeout(function() {
                    $(previousID).find('.front').show();
                    $(previousID).find('.back').hide();
                    $(currentCard).find('.front').show();
                    $(currentCard).find('.back').hide();
                    previousPreviousID = 0;
                }, 1000);
            } else {
                // If matching, mark as flipped and decrease remaining pairs
                remainingPairs--;
                $(currentCard).attr("flip", "yes");
                $(previousID).attr("flip", "yes");
            }

            // Resetting turn and updating moves
            setTimeout(function() {
                turn = 0;
                moves++;
                document.getElementById("moves").textContent = "Moves: " + moves;
            }, 1150);
        } else {
            // Saving current card details for comparison in the next turn
            previousValue = $(backFace).text();
            previousPreviousID = cardID;
            previousID = currentCard;
            turn = 1;
        }
    }

    // Checking if all pairs are matched, indicating the end of the game
    if (remainingPairs == 0) {
        clearInterval(timer);
        var timeTaken = minutes == 0 ? seconds + " seconds" : minutes + " minutes and " + seconds + " seconds";
        // Displaying end game message with statistics and option to play again
        setTimeout(function() {
            $("#overlay").html(`<center><div id="endOfGame"><h1 class="highlight">Congratulations!</h1>
              <p style="font-size:23px;padding:10px;">You completed the ${gameMode} mode in ${moves} moves. It took you ${timeTaken}.</p>
              <p style="font-size:20px;" class="highlight">Play Again?</p><button onclick="startGame(3, 4)">3 x 4</button> 
              <button onclick="startGame(4, 4)">4 x 4</button><button onclick="startGame(4, 5)">4 x 5</button><button onclick="startGame(5, 6)">5 x 6</button>
              <button onclick="startGame(6, 6)">6 x 6</button></div></center>`);
            $("#overlay").fadeIn(750);
        }, 1500);
    }
}
