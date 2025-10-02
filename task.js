const readline = require("readline");

// Функція для створення матриці
function createMatrix(rows, cols, min, max) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      Math.floor(Math.random() * (max - min + 1)) + min
    )
  );
}

// Функція для виводу матриці з урахуванням початкових міток рядків/стовпців
function printMatrix(matrix, rowLabels = null, colLabels = null) {
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
    console.log("Матриця порожня");
    return;
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const rLabels = rowLabels ?? Array.from({ length: rows }, (_, i) => i + 1);
  const cLabels = colLabels ?? Array.from({ length: cols }, (_, j) => j + 1);

  // Ширина для кожної колонки 
  const colWidths = [];
  for (let j = 0; j < cols; j++) {
    let header = `стовпець ${cLabels[j]}`;
    let maxLen = header.length;
    for (let i = 0; i < rows; i++) {
      maxLen = Math.max(maxLen, String(matrix[i][j]).length);
    }
    colWidths[j] = maxLen + 2;
  }

  // Динамічна ширина підпису рядків
  const rowLabelWidth = Math.max(
    ...rLabels.map(l => (`рядок ${l}`).length),
    "рядок".length + 2
  ) + 2;

  // Заголовки
  let header = " ".repeat(rowLabelWidth);
  for (let j = 0; j < cols; j++) {
    header += (`стовпець ${cLabels[j]}`).padStart(colWidths[j]);
  }
  console.log(header);

  // Рядки
  for (let i = 0; i < rows; i++) {
    let line = (`рядок ${rLabels[i]}`).padEnd(rowLabelWidth);
    for (let j = 0; j < cols; j++) {
      let val = matrix[i][j];
      if (typeof val === "number") {
        val = Number(val.toFixed(3));
      }
      line += String(val).padStart(colWidths[j]);
    }
    console.log(line);
  }
}

// 1. Виконати циклічний зсув матриці на k позицій вправо та на k догори, порожні місця заповнити нулями
function shiftMatrix(matrix, k) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let newMatrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let newRow = i - k;   
      let newCol = j + k;   
      if (newRow >= 0 && newCol < cols) {
        newMatrix[newRow][newCol] = matrix[i][j];
      }
    }
  }
  return newMatrix;
}

// 2. Знайти суму елементів матриці, розміщених після третього елементами кожного рядка
function sumAfterThird(matrix) {
  return Number(matrix.reduce((sum, row) => {
    return sum + row.slice(3).reduce((a, b) => a + b, 0);
  }, 0).toFixed(3));
}

// 3. Відняти від елементів кожного рядка матриці середнє арифметичне рядка
function subtractRowMean(matrix) {
  return matrix.map(row => {
    const avg = row.reduce((a, b) => a + b, 0) / row.length;
    return row.map(val => Number((val - avg).toFixed(3)));
  });
}

// 4. Знайти максимальні елементи в матриці та видалити з матриці всі рядки та стовпці, що містять їх
function removeMaxRowsColsLabeled(matrix, rowLabels, colLabels) {
  const max = Math.max(...matrix.flat());
  const rowsToRemove = new Set();
  const colsToRemove = new Set();
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[i][j] === max) { rowsToRemove.add(i); colsToRemove.add(j); }
    }
  }
  const newMatrix = [];
  const newRowLabels = [];
  for (let i = 0; i < matrix.length; i++) {
    if (rowsToRemove.has(i)) continue;
    const newRow = [];
    for (let j = 0; j < matrix[0].length; j++) {
      if (colsToRemove.has(j)) continue;
      newRow.push(matrix[i][j]);
    }
    newMatrix.push(newRow);
    newRowLabels.push(rowLabels[i]); // зберігаємо початкову мітку рядка
  }
  const newColLabels = colLabels.filter((_, j) => !colsToRemove.has(j));
  return { matrix: newMatrix, rowLabels: newRowLabels, colLabels: newColLabels };
}

// 5. Поміняти стовпці, з максимальним i мінімальним елементами, місцями
function swapColsByMaxMinLabeled(matrix, rowLabels, colLabels) {
  let flat = matrix.flat();
  let maxVal = Math.max(...flat), minVal = Math.min(...flat);
  let maxIndex = flat.indexOf(maxVal), minIndex = flat.indexOf(minVal);
  let cols = matrix[0].length;
  let maxCol = maxIndex % cols, minCol = minIndex % cols;

  const newMatrix = matrix.map(row => {
    let newRow = [...row];
    [newRow[maxCol], newRow[minCol]] = [newRow[minCol], newRow[maxCol]];
    return newRow;
  });
  const newColLabels = [...colLabels];
  [newColLabels[maxCol], newColLabels[minCol]] = [newColLabels[minCol], newColLabels[maxCol]];
  return { matrix: newMatrix, rowLabels, colLabels: newColLabels };
}

// 6. Знайти максимальне значення в матриці, видалити рядок та стовпець в якому він знаходиться
function removeRowColWithMaxLabeled(matrix, rowLabels, colLabels) {
  let max = Math.max(...matrix.flat());
  let rowIndex = -1, colIndex = -1;
  outer:
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[i][j] === max) { rowIndex = i; colIndex = j; break outer; }
    }
  }
  if (rowIndex === -1) return { matrix, rowLabels, colLabels };

  const newMatrix = [];
  const newRowLabels = [];
  for (let i = 0; i < matrix.length; i++) {
    if (i === rowIndex) continue;
    const newRow = [];
    for (let j = 0; j < matrix[0].length; j++) {
      if (j === colIndex) continue;
      newRow.push(matrix[i][j]);
    }
    newMatrix.push(newRow);
    newRowLabels.push(rowLabels[i]);
  }
  const newColLabels = colLabels.filter((_, j) => j !== colIndex);
  return { matrix: newMatrix, rowLabels: newRowLabels, colLabels: newColLabels };
}

// Запуск 
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("\nВведіть кількість рядків: ", (rowsInput) => {
  const rows = parseInt(rowsInput);
  rl.question("Введіть кількість стовпців: ", (colsInput) => {
    const cols = parseInt(colsInput);

    let A = createMatrix(rows, cols, -20, 20);
    // Початкові мітки (зберігатимуться між операціями)
    let rowLabels = Array.from({ length: rows }, (_, i) => i + 1);
    let colLabels = Array.from({ length: cols }, (_, j) => j + 1);

    console.log("\nПочаткова матриця:");
    printMatrix(A, rowLabels, colLabels);

    rl.question("\nНа скільки елементів зсунути матрицю? ", (kInput) => {
      const k = parseInt(kInput);

      console.log("\nЗавдання 1. Зсув:");
      
      const A1 = shiftMatrix(A, k);
      printMatrix(A1, rowLabels, colLabels);

      console.log("\nЗавдання 2. Cуму елементів матриці, розміщених після третього елементами кожного рядка:", sumAfterThird(A));

      console.log("\nЗавдання 3. Матриця після віднімання середнього арифметичного з елементів рядків:");
      const A3 = subtractRowMean(A);
      printMatrix(A3, rowLabels, colLabels);

      console.log("\nЗавдання 4. Матриця з видаленими рядками та стовпцями, що містять максимальні елементи:");
      const R4 = removeMaxRowsColsLabeled(A, rowLabels, colLabels);
      printMatrix(R4.matrix, R4.rowLabels, R4.colLabels);

      console.log("\nЗавдання 5. Матриця після обміну стовпців з максимальним та мінімальним елементами:");
      const R5 = swapColsByMaxMinLabeled(A, rowLabels, colLabels);
      printMatrix(R5.matrix, R5.rowLabels, R5.colLabels);

      console.log("\nЗавдання 6. Матриця після видалення рядка і стовпця з максимальним елементом:");
      const R6 = removeRowColWithMaxLabeled(A, rowLabels, colLabels);
      printMatrix(R6.matrix, R6.rowLabels, R6.colLabels);

      rl.close();
    });
  });
});
