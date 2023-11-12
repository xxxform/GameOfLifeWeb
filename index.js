const getOverflowIndex = (i, arrLength) => (i % arrLength + arrLength) % arrLength;

let tickTime = 200;
let aliveCells = []; 
let intervalId = null;
let resized = false;
let cellWidth, cellHeight;

(() => {
    const row = field.insertRow();
    const cell = row.insertCell();
    row.style.display = 'block';
    cell.style.display = 'inline-block';
    cellWidth = cell.clientWidth;
    cellHeight = cell.clientHeight;
    field.deleteRow(0);
})();


const clear = clearButton.onclick = () => {
    for (const td of aliveCells) td.classList.remove('active');
    aliveCells.length = 0;
}

const scrollEnd = () => {
    let rowsScrolled = Math.floor(fieldWrapper.scrollTop / cellHeight);
    let cellsScrolled = Math.floor(fieldWrapper.scrollLeft / cellWidth);
    let rowsToShow = Math.ceil(fieldWrapper.clientHeight / cellHeight);
    let cellsToShow = Math.ceil(fieldWrapper.clientWidth / cellWidth);

    const oldDisplayedRows = field.querySelectorAll('tr[style]');
    for (let i = 0; i < oldDisplayedRows.length; i++) {
        const row = oldDisplayedRows[i];
        const oldDisplayedCells = row.querySelectorAll('td[style]');
        for (let i = 0; i < oldDisplayedCells.length; i++) 
            oldDisplayedCells[i].removeAttribute('style');
            
        row.removeAttribute('style');
    }

    for (let i = 0; i < rowsToShow; i++) {
        const row = field.rows[rowsScrolled + i];
        if (!row) break;

        for(let i = 0; i < cellsToShow; i++) {
            const cell = row.cells[cellsScrolled + i];
            if (!cell) break;
            cell.style.display = 'inline-block';
        }

        row.style.display = 'block'
    }

    field.style.top = fieldWrapper.scrollTop + 'px';
    field.style.left = fieldWrapper.scrollLeft + 'px';
}

fieldWrapper.onscrollend = scrollEnd;

const changeSize = () => {
    field.tBodies[0].innerHTML = `<tr>${`<td></td>`.repeat(width.value)}</tr>`.repeat(height.value);
    fieldInnerWrapper.style.width = width.value * cellWidth + 'px';
    fieldInnerWrapper.style.height = height.value * cellHeight + 'px';
}

width.oninput = height.oninput = () => {
    changeSize();
    scrollEnd();
}
    
field.onclick = event => {
    if (event.target.tagName !== 'TD') return;
    event.target.classList.toggle('active');
    if (event.target.classList.contains('active')) aliveCells.push(event.target);
    else aliveCells.splice(aliveCells.indexOf(event.target), 1);
}

randomGenerate.onclick = event => {
    clear();
    for (const td of field.getElementsByTagName('td')) {
        if (Math.random() > .5) {
            td.classList.add('active');
            aliveCells.push(td);
        }
    }
}

changeSize();
scrollEnd();

let mouseDown = false;
let resizeTimer = null;

document.onmousedown = document.ontouchstart = () => mouseDown = true;

document.onmouseup = document.ontouchend = () => {
    mouseDown = false;
    if (!resized) return;
    scrollEnd();
    resized = false;
}

new ResizeObserver(() => {
    if (!mouseDown) {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(scrollEnd, 500);
        return;
    };
    resized = true;
}).observe(fieldWrapper);

const toggleCells = cells => { 
    for (let i = 0; i < cells.length; i++) 
        cells[i].classList.toggle('active');
}

const getAliveCells = cells => {
    const result = [];
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].classList.contains('active'))
        result.push(cells[i]);
    }
    return result;
}

const checkLife = cell => {
    let countOfAlive = 0;

    for (let i = -1; i < 2; i++) { //y
        const currentRow = field.rows[getOverflowIndex(cell.parentElement.rowIndex + i, +height.value)];
        for (let i = -1; i < 2; i++)  //x
            countOfAlive += currentRow.cells[getOverflowIndex(cell.cellIndex + i, +width.value)].classList.length;
    }
    
    return cell.classList.length
        ? countOfAlive > 4 
            ? false 
            : countOfAlive > 2
                ? true 
                : countOfAlive > 0
                    ? false : false
        : countOfAlive === 3;
}

const tick = () => {
    const redrawCells = [];
    const newAliveCells = [];
    let checked = [];

    for (let i = 0; i < aliveCells.length; i++) {
        const aliveCell = aliveCells[i];
        
        for (let i = -1; i < 2; i++) { //y
            const currentRow = field.rows[getOverflowIndex(aliveCell.parentElement.rowIndex + i, +height.value)];

            for (let i = -1; i < 2; i++) { //x
                const currentCell = currentRow.cells[getOverflowIndex(aliveCell.cellIndex + i, +width.value)];
                if (checked.includes(currentCell)) continue;
                const isAlive = checkLife(currentCell);
                if (isAlive) newAliveCells.push(currentCell);
                if (isAlive ^ !!currentCell.classList.length) redrawCells.push(currentCell);
                checked.push(currentCell);
            }   
        }
    }

    aliveCells = newAliveCells;
    toggleCells(redrawCells);
}

startButton.onclick = () => {
    if (startButton.textContent === 'Stop') {
        clearInterval(intervalId);
        startButton.textContent = 'Start';
        time.disabled = false;
        return;
    }

    time.disabled = true;
    startButton.textContent = 'Stop';
    intervalId = setInterval(tick, +time.value);
}