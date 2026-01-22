export class SchulteTable {
	constructor(storage, container, onBack) {
		this.storage = storage;
		this.container = container;
		this.onBack = onBack;
		this.maxNumber = 25;
		this.currentNumber = 1;
		this.startTime = 0;
		this.record = this.storage.get('schulteRecord', 0);
		this.isRunning = false;
		this.init();
	}
	init() {
		this.render();
	}
	render() {
		this.container.innerHTML = `
			<button class="back-btn" id="backBtn">&larr;</button>
			<div class="container">
				<div class="header">
					<div class="header-item"><span>Найди</span><strong id="current">${this.currentNumber}</strong></div>
					<div class="header-item"><span>Время</span><strong id="time">0.00</strong></div>
					<div class="header-item"><span>Рекорд</span><strong id="record">${this.record ? (this.record / 1000).toFixed(2) : '-'}</strong></div>
				</div>
				<p class="message" id="message" style="min-height:1.5em">Нажмите на 1 чтобы начать</p>
				<div class="schulte-grid" id="grid"></div>
			</div>
		`;
		this.grid = document.getElementById('grid');
		this.generateGrid();
		document.getElementById('backBtn').addEventListener('click', () => {
			this.stopTimer();
			this.onBack();
		});
	}
	generateGrid() {
		const numbers = [];
		for (let i = 1; i <= this.maxNumber; i++) {
			numbers.push(i);
		}
		this.shuffle(numbers);
		this.grid.innerHTML = '';
		numbers.forEach(num => {
			const cell = document.createElement('div');
			cell.className = 'schulte-cell';
			cell.textContent = num;
			cell.dataset.number = num;
			cell.addEventListener('click', () => this.handleClick(num, cell));
			this.grid.appendChild(cell);
		});
	}
	shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
	}
	handleClick(num, cell) {
		if (num === this.currentNumber) {
			if (this.currentNumber === 1) {
				this.startTimer();
			}
			this.currentNumber++;
			document.getElementById('current').textContent = this.currentNumber <= this.maxNumber ? this.currentNumber : '-';
			if (this.currentNumber > this.maxNumber) {
				this.finish();
			} else {
				this.generateGrid();
			}
		}
	}
	startTimer() {
		this.isRunning = true;
		this.startTime = Date.now();
		this.updateMessage('\u00A0');
		this.timerInterval = setInterval(() => {
			const elapsed = (Date.now() - this.startTime) / 1000;
			document.getElementById('time').textContent = elapsed.toFixed(2);
		}, 50);
	}
	stopTimer() {
		this.isRunning = false;
		clearInterval(this.timerInterval);
	}
	finish() {
		this.stopTimer();
		const time = Date.now() - this.startTime;
		const timeStr = (time / 1000).toFixed(2);
		let msg = `Время: ${timeStr} сек`;
		if (!this.record || time < this.record) {
			this.record = time;
			this.storage.set('schulteRecord', this.record);
			document.getElementById('record').textContent = timeStr;
			msg += ' - Новый рекорд!';
		}
		this.updateMessage(msg);
		setTimeout(() => this.showRestart(), 1000);
	}
	showRestart() {
		const msg = document.getElementById('message');
		msg.innerHTML = `${msg.textContent}<br><button id="restartBtn" style="margin-top:1rem">Играть снова</button>`;
		document.getElementById('restartBtn').addEventListener('click', () => this.restart());
	}
	restart() {
		this.currentNumber = 1;
		this.startTime = 0;
		this.isRunning = false;
		this.render();
	}
	updateMessage(text) {
		document.getElementById('message').textContent = text;
	}
}
