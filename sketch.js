let tableData;
let headers = [];
let rows = [];
let visibleParams = [];
let checkboxes = [];
let selectedPoint = null;

// Rang de l'eix Y
let yMin = 0;
let yMax = 0;

// Configuració de la barra de desplaçament
let scrollOffset = 0;
let maxVisiblePoints = 50; // Nombre màxim de punts visibles
let scrollBarHeight = 20;

function preload() {
  let input = createFileInput(handleFile);
  input.position(10, 10); // Diàleg de selecció
}

function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(240);

  if (rows.length === 0) {
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Carrega un fitxer .txt per començar", width / 2, height / 2);
    return;
  }

  // Dibuixar eixos
  drawAxes();

  // Dibuixar gràfica per a cada paràmetre visible
  for (let i = 0; i < headers.length; i++) {
    if (visibleParams[i]) {
      drawGraph(i, color(100 + i * 30, 150, 255 - i * 30));
    }
  }

  // Dibuixar llegenda
  drawLegend();

  // Dibuixar punt seleccionat
  if (selectedPoint) {
    fill(0);
    noStroke();
    text(
      `Temps: ${selectedPoint.x}, Valor: ${selectedPoint.y}`,
      selectedPoint.screenX,
      selectedPoint.screenY - 10
    );
  }

  // Dibuixar barra de desplaçament
  drawScrollBar();
}

function handleFile(file) {
  if (file.type === "text") {
    processFile(file.data);
  } else {
    alert("Només es poden carregar fitxers de text!");
  }
}

function processFile(data) {
  let lines = data.split("\n").map((line) => line.trim());
  headers = lines[0].split(/[\t,]+/);
  rows = lines.slice(1).map((line) =>
    line.split(/[\t,]+/).map((value) => parseFloat(value))
  );

  // Calcula els valors mínim i màxim de l'eix Y
  let allValues = rows.flat().filter((value) => !isNaN(value));
  yMin = 0; // Sempre començar des de 0
  yMax = Math.max(...allValues);

  // Inicialitzar visibilitat i caselles
  visibleParams = new Array(headers.length).fill(true);
  checkboxes.forEach((cb) => cb.remove()); // Esborra caselles antigues
  checkboxes = headers.map((header, i) => {
    let checkbox = createCheckbox(header, true);
    checkbox.position(width - 200, 40 + i * 20); // Caselles a la part superior dreta
    checkbox.changed(() => (visibleParams[i] = checkbox.checked()));
    return checkbox;
  });
}

function drawAxes() {
  stroke(0);
  line(50, height - 50, width - 50, height - 50); // Eix X
  line(50, 50, 50, height - 50); // Eix Y

  textSize(12);
  textAlign(CENTER);
  // Etiquetes eix X
  let start = scrollOffset;
  let end = Math.min(rows.length, scrollOffset + maxVisiblePoints);
  for (let i = start; i < end; i++) {
    let x = map(i - scrollOffset, 0, maxVisiblePoints - 1, 50, width - 50);
    text(i, x, height - 30);
  }

  // Etiquetes eix Y
  textAlign(RIGHT);
  for (let i = 0; i <= 10; i++) {
    let y = map(i, 0, 10, height - 50, 50); // Etiquetes amb 0 a baix
    let value = yMin + (yMax - yMin) * i / 10;
    text(value.toFixed(2), 40, y);
  }
}

function drawGraph(paramIndex, col) {
  stroke(col);
  noFill();

  let start = scrollOffset;
  let end = Math.min(rows.length, scrollOffset + maxVisiblePoints);

  beginShape();
  for (let i = start; i < end; i++) {
    let x = map(i - scrollOffset, 0, maxVisiblePoints - 1, 50, width - 50);
    let y = map(rows[i][paramIndex], yMin, yMax, height - 50, 50); // Valors creixen cap a dalt

    // Dibuixar punt només si és un número vàlid
    if (!isNaN(y)) {
      vertex(x, y);

      // Interacció amb ratolí
      if (dist(mouseX, mouseY, x, y) < 5) {
        fill(col);
        noStroke();
        ellipse(x, y, 10, 10);
        selectedPoint = { x: i, y: rows[i][paramIndex], screenX: x, screenY: y };
      }
    }
  }
  endShape();
}

function drawLegend() {
  fill(0);
  textSize(14);
  textAlign(LEFT);
  text("Llegenda: (Selecciona els paràmetres)", width - 200, 20); // Text sota les caselles
}

function drawScrollBar() {
  fill(200);
  rect(50, height - scrollBarHeight, width - 100, scrollBarHeight);

  let handleWidth = (maxVisiblePoints / rows.length) * (width - 100);
  let handleX = map(scrollOffset, 0, rows.length - maxVisiblePoints, 50, width - 50 - handleWidth);

  fill(150);
  rect(handleX, height - scrollBarHeight, handleWidth, scrollBarHeight);

  if (mouseIsPressed && mouseY > height - scrollBarHeight) {
    let newScrollOffset = map(mouseX - handleWidth / 2, 50, width - 50 - handleWidth, 0, rows.length - maxVisiblePoints);
    scrollOffset = constrain(Math.floor(newScrollOffset), 0, rows.length - maxVisiblePoints);
  }
}