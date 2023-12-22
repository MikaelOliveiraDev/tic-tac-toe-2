"user strict";

let randomMode = false;

let board = [];

// Create the board[] structure
let boardElement = $(".board")
for (let i = 0; i < 9; i++) {
  /* <board>
      <board-1>
        <field>
  */
  let board1 = $(`<div class="board-1" data-index="${i}" data-mark=""></div>`)
  boardElement.append(board1)
  
  board.push([])
  board[i].mark = null
  board.element = board1
  for (let ii = 0; ii < 9; ii++) {
    let field = $(`<div class="field" data-index="${ii}"></div>`)
    board1.append(field)
    
    board[i].push({
			mark: null,
			element: field
    });
  }
}

function detachBoard1(boardIndex) {
  // Every board gets dark...
  $(".board-1").addClass("dark");

  if (randomMode) boardIndex = Math.floor(Math.random() * 9) + 1;
  
  // ... except that one
  $(`.board-1[data-index="${boardIndex}"]`).removeClass("dark");
}
function checkWinOnFields(boardIndex, fieldIndex, turn) {
	let match = 0
	
	// Check row
	let indexBase
	if(fieldIndex < 3) indexBase = 0
	else if(fieldIndex < 6) indexBase = 3
	else indexBase = 6
	
	for(let i = 0; i < 3; i++) {
		if(board[boardIndex][i + indexBase].mark == turn)
			match++
		else 
			break
	}
	if(match == 3)
		return win()
	
	// Check column
	match = 0
	indexBase = fieldIndex%3
	for(let i = 0; i < 9; i +=3) {
		if(board[boardIndex][i + indexBase].mark == turn)
			match++
		else
			break
	}
	if(match == 3) 
		return win()
	
	
	// Check diagonal
	let tl = board[boardIndex][0].mark == turn // top-left
	let tr = board[boardIndex][2].mark == turn // top-right
	let md = board[boardIndex][4].mark == turn // middle
	let bl = board[boardIndex][6].mark == turn // bottom-left
	let br = board[boardIndex][8].mark == turn // bottom-right
	if((tl && md && br) || (bl && md && tr))
		return win()
	
	function win() {
		let boardElement = $(`.board-1[data-index="${boardIndex}"]`)
		boardElement[0].dataset.mark = turn
		$(`body > .${turn}`).clone().css("display", "block").appendTo(boardElement)
	}
}

// The click listener
let section = $("section#game")
$(".field").on("click", function (ev) {
  let field = ev.target;
  let board1 = field.parentElement
  
  // Check if clicked on a valid field
  if (field.children.length) return;
  if (board1.classList.contains("dark")) return
  
  // Put the svg mark
  turn = section.data("turn")
  let marker = $(`body > .${turn}`)
  
  marker.clone().css("display", "block").appendTo(field);
  // Refresh board[]
  let boardIndex = board1.dataset.index
  let fieldIndex = field.dataset.index
  board[boardIndex][fieldIndex].mark = turn
  
  checkWinOnFields(boardIndex, fieldIndex, turn)
  
  turn == "x" ? section.data("turn", "o") : section.data("turn", "x")
  
  
  // Find out the position of the field in the small-board
  let siblings = field.parentElement.children;
  let position = Array.from(siblings).indexOf(field) + 1;
  detachBoard1(fieldIndex);
});

// Choose the first player
turn = ["x", "o"][Math.floor(Math.random() * 2)];

section[0].dataset.turn = turn