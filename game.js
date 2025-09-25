let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let board;
let turn = "x";
let gameover = false

const colors = {
  red: "#8a280f",
  blue: "#0a2f76"
}

function start() {
  adjustCanvasSize()

  board = new Board(10);

  loop();
}

function adjustCanvasSize() {
  const gameContainer = document.querySelector("#game")
  const size = Math.min(500, document.body.offsetWidth)

  gameContainer.style.width = size + "px"
  canvas.width = size
  canvas.height = size

  if (board) {
    board.width = size
  }
}

class Board {
  constructor(margin) {
    this.margin = margin;

    this.x = 0;
    this.y = 0;
    this.width = canvas.width;
    this.fields = [];

    Field.width = (this.width - 4 * margin) / 3;
    for (let row = 0; row < 3; row++) {
      this.fields.push([]);
      for (let col = 0; col < 3; col++) {
        let absX = col * Field.width + (col + 1) * margin;
        let absY = row * Field.width + (row + 1) * margin;
        let field = new Field(absX, absY);
        field.col = col;
        field.row = row;
        this.fields[row].push(field);
      }
    }
  }

  forEachField(func) {
    let rtn;
    for (let row = 0; row < this.fields.length; row++) {
      for (let col = 0; col < this.fields[row].length; col++) {
        rtn = func(this.fields[row][col], row, col);

        if (rtn !== undefined) return rtn;
      }
    }
  }

  clickOnPoint(coordX, coordY) {
    this.forEachField((field) => {
      if (
        field.x < coordX &&
        coordX < field.x + Field.width &&
        field.y < coordY &&
        coordY < field.y + Field.width
      ) {
        field.clickOnPoint(coordX, coordY);

        return null;
      }
    });
  }

  checkWin() {
    // Check vertically
    for (let col = 0; col < 3; col++) {
      if (
        this.fields[0][col].win !== null &&
        this.fields[0][col].win === this.fields[1][col].win &&
        this.fields[0][col].win === this.fields[2][col].win
      ) {
        return gameover = true
      }
    }

    // Check horizontally
    for (let row = 0; row < 3; row++) {
      if (
        this.fields[row][0].win !== null &&
        this.fields[row][0].win === this.fields[row][1].win &&
        this.fields[row][0].win === this.fields[row][2].win
      ) {
        return gameover = true
      }
    }

    // Check diagonal
    if (
      this.fields[0][0].win !== null &&
      this.fields[0][0].win === this.fields[1][1].win &&
      this.fields[0][0].win === this.fields[2][2].win
    )
      return gameover = true
    if (
      this.fields[1][1].win !== null &&
      this.fields[1][1].win === this.fields[0][2].win &&
      this.fields[1][1].win === this.fields[2][0].win
    )
      return gameover = true
  }

  reset() {
    this.forEachField((field) => {
      field.win = null
      field.forEachCell((cell) => {
        cell.content = null
      })
    })
  }
}

class Field {
  constructor(absX, absY) {
    this.x = absX;
    this.y = absY;
    this.row = 0;
    this.col = 0;
    this.shadow = false;
    this.win = null;
    this.cells = [];

    for (let row = 0; row < 3; row++) {
      this.cells.push([]);
      for (let col = 0; col < 3; col++) {
        Cell.width = Field.width / 3;
        let absX = this.x + col * Cell.width;
        let absY = this.y + row * Cell.width;
        let cell = new Cell(absX, absY);
        cell.row = row;
        cell.col = col;

        this.cells[row].push(cell);
      }
    }
  }

  static width = null;

  forEachCell(func) {
    let rtn;
    for (let row = 0; row < this.cells.length; row++) {
      for (let col = 0; col < this.cells[row].length; col++) {
        rtn = func(this.cells[row][col], row, col);

        if (rtn !== undefined) return rtn;
      }
    }
  }

  clickOnPoint(coordX, coordY) {
    this.forEachCell((cell, row, col) => {
      if (this.shadow) return;

      // Check which cell had been clicked
      if (
        cell.x < coordX &&
        coordX < cell.x + Cell.width &&
        cell.y < coordY &&
        coordY < cell.y + Cell.width
      ) {
        if (!cell.content) {
          cell.content = turn;
          
          if (this.checkWin()) board.checkWin();

          focus(row, col);

          turn = turn == "x" ? "o" : "x";
          switchMessage()
        }

        return null;
      }
    });
  }

  drawShadow() {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "black";
    let x = this.x - board.margin / 2;
    let y = this.y - board.margin / 2;
    let width = Field.width + board.margin;
    ctx.fillRect(x, y, width, width);
    ctx.globalAlpha = 1;
  }

  drawWin() {
    let mar = board.margin * 2;

    ctx.beginPath();
    ctx.lineWidth = 15;
    if (this.win === "x") {
      let x1 = this.x + mar;
      let y1 = this.y + mar;
      let x2 = this.x + Field.width - mar;
      let y2 = this.y + Field.width - mar;

      ctx.strokeStyle = colors.red;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x1, y2);
      ctx.lineTo(x2, y1);
    } else {
      let x = this.x + Field.width / 2;
      let y = this.y + Field.width / 2;
      let radius = Field.width / 2 - mar;

      ctx.strokeStyle = colors.blue;
      ctx.arc(x, y, radius, 0, (360 * Math.PI) / 180);
    }
    ctx.stroke();
    ctx.closePath();
  }

  checkWin() {
    // Check vertically
    for (let col = 0; col < 3; col++) {
      if (
        this.cells[0][col].content !== null &&
        this.cells[0][col].content === this.cells[1][col].content &&
        this.cells[0][col].content === this.cells[2][col].content
      ) {
        return (this.win = this.cells[0][col].content);
      }
    }

    // Check horizontally
    for (let row = 0; row < 3; row++) {
      if (
        this.cells[row][0].content !== null &&
        this.cells[row][0].content === this.cells[row][1].content &&
        this.cells[row][0].content === this.cells[row][2].content
      ) {
        return (this.win = this.cells[row][0].content);
      }
    }

    // Check diagonal
    if (
      this.cells[0][0].content !== null &&
      this.cells[0][0].content === this.cells[1][1].content &&
      this.cells[0][0].content === this.cells[2][2].content
    )
      return (this.win = this.cells[1][1].content);
    if (
      this.cells[1][1].content !== null &&
      this.cells[1][1].content === this.cells[0][2].content &&
      this.cells[1][1].content === this.cells[2][0].content
    )
      return (this.win = this.cells[1][1].content);
  }
}

class Cell {
  constructor(absX, absY) {
    this.x = absX;
    this.y = absY;
    this.content = null;
  }

  drawX() {
    let margin = 10;
    let x1 = this.x + margin;
    let y1 = this.y + margin;
    let x2 = this.x + Cell.width - margin;
    let y2 = this.y + Cell.width - margin;

    ctx.strokeStyle = colors.red;
    ctx.lineWidth = 7;
    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.moveTo(x2, y1);
    ctx.lineTo(x1, y2);

    ctx.stroke();
    ctx.closePath();
  }
  drawO() {
    let radius = Cell.width / 2 - 8;
    let cx = this.x + Cell.width / 2;
    let cy = this.y + Cell.width / 2;

    ctx.strokeStyle = colors.blue;
    ctx.lineWidth = 7;
    ctx.beginPath();

    ctx.arc(cx, cy, radius, 0, (360 * Math.PI) / 180);

    ctx.stroke();
    ctx.closePath();
  }

  drawContent() {
    if (this.content === "x") this.drawX();
    else if (this.content === "o") this.drawO();
  }
}

function restart() {
  if (turn === "o") {
    switchMessage()
    turn = "x"
  } else {
    turn = "o"
  }
  gameover = false
  board.reset()
  loop()
}

function click(ev) {
  let x = ev.clientX;
  let y = ev.clientY;

  let rect = ev.target.getBoundingClientRect()

  x -= rect.x
  y -= rect.y

  board.clickOnPoint(x, y);
}

function switchMessage() {
  let messageX = document.querySelector(".turn-message.x")
  let messageY = document.querySelector(".turn-message.o")

  if (messageX.classList.contains("appear")) {
    messageX.classList.replace("appear", "disappear")
    messageY.classList.replace("disappear", "appear")
  } else {
    messageX.classList.replace("disappear", "appear")
    messageY.classList.replace("appear", "disappear")
  }
}

function drawGrid(x, y, size) {
  ctx.save();

  // Desenha linhas horizontais
  ctx.beginPath();
  for (let i = 1; i < 3; i++) {
    ctx.moveTo(x, y + i * (size / 3));
    ctx.lineTo(x + size, y + i * (size / 3));
  }
  ctx.stroke();

  // Desenha linhas verticais
  ctx.beginPath();
  for (let i = 1; i < 3; i++) {
    ctx.moveTo(x + i * (size / 3), y);
    ctx.lineTo(x + i * (size / 3), y + size);
  }
  ctx.stroke();

  ctx.restore();
}

function focus(row, col) {
  if (board.fields[row][col].win) {
    board.forEachField((field) => {
      if (field.win) field.shadow = true;
      else field.shadow = false;
    });
    return;
  }
  board.forEachField((field) => {
    if (field.col != col || field.row != row) {
      field.shadow = true;
    } else {
      field.shadow = false;
    }
  });
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineCap = "round";
  ctx.strokeStyle = "rgb(71, 72, 87)";

  function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }

  let x1, y1, x2, y2;
  ctx.lineWidth = 2;
  board.forEachField((field) => {
    // Draw SMALL vertical lines
    x1 = field.x + Cell.width;
    y1 = field.y + board.margin / 2;
    x2 = field.x + Cell.width;
    y2 = field.y + Field.width - board.margin / 2;
    for (let i = 0; i < 2; i++) {
      drawLine(x1, y1, x2, y2);
      x1 += Cell.width;
      x2 += Cell.width;
    }

    // Draw SMALL horizontal lines
    x1 = field.y + board.margin / 2;
    y1 = field.x + Cell.width;
    x2 = field.y + Field.width - board.margin / 2;
    y2 = field.x + Cell.width;
    for (let i = 0; i < 2; i++) {
      drawLine(x1, y1, x2, y2);
      y1 += Cell.width;
      y2 += Cell.width;
    }

    // Draw shadow
    if (field.shadow) field.drawShadow();
  });

  // Draw BIG vertical lines
  ctx.lineWidth = 7;
  x1 = Field.width + board.margin * 1.5;
  y1 = board.margin;
  x2 = Field.width + board.margin * 1.5;
  y2 = board.width - board.margin;
  for (let i = 0; i < 2; i++) {
    drawLine(x1, y1, x2, y2);

    x1 += Field.width + board.margin;
    x2 += Field.width + board.margin;
  }
  // Draw BIG horizontal lines
  x1 = board.margin;
  y1 = Field.width + board.margin * 1.5;
  x2 = board.width - board.margin;
  y2 = Field.width + board.margin * 1.5;
  for (let i = 0; i < 2; i++) {
    drawLine(x1, y1, x2, y2);

    y1 += Field.width + board.margin;
    y2 += Field.width + board.margin;
  }

  // Draw cells content
  board.forEachField((field) => {
    if (field.win) return field.drawWin();

    field.forEachCell((cell) => {
      cell.drawContent();
      /* 
      ctx.fillStyle = "rgba(255, 0, 0, 0)";
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.strokeRect(cell.x, cell.y, Cell.width, Cell.width);
      ctx.globalAlpha = 1; */
    });
  });

  if (!gameover)
    requestAnimationFrame(loop);
  else 
    console.log("GAMEOVER")
}

canvas.addEventListener("pointerdown", click);
document.querySelector("#restart").addEventListener("click", restart)

start();
