export class AngleSumGame {
	constructor(storage, container, onBack) {
		this.storage = storage;
		this.container = container;
		this.onBack = onBack;
		this.shapes = [
			{ name: 'triangle', corners: 3 },
			{ name: 'square', corners: 4 },
			{ name: 'pentagon', corners: 5 },
			{ name: 'hexagon', corners: 6 },
			{ name: 'heptagon', corners: 7 },
			{ name: 'octagon', corners: 8 },
			{ name: 'nonagon', corners: 9 }
		];
		this.score = 0;
		this.round = 1;
		this.totalRounds = 10;
		this.timeLeft = 60;
		this.correctAnswer = 0;
		this.canAnswer = true;
		this.record = this.storage.get('angleSumRecord', 0);
		this.timerInterval = null;
		this.gameEnded = false;
		this.init();
	}
	init() {
		this.render();
		this.startGame();
	}
	render() {
		this.container.innerHTML = `
			<button class="back-btn" id="backBtn">&larr;</button>
			<div class="container anglesum-container">
				<div class="header">
					<div class="header-item"><span>Очки</span><strong id="score">${this.score}</strong></div>
					<div class="header-item"><span>Раунд</span><strong id="round">${this.round}/${this.totalRounds}</strong></div>
					<div class="header-item"><span>Время</span><strong id="timer">${this.timeLeft}</strong></div>
				</div>
				<p class="anglesum-task">Найдите сумму углов фигур</p>
				<div class="anglesum-field" id="field"></div>
				<div class="anglesum-answers" id="answers"></div>
			</div>
		`;
		document.getElementById('backBtn').addEventListener('click', () => {
			this.gameEnded = true;
			clearInterval(this.timerInterval);
			window.removeEventListener('resize', this.resizeHandler);
			this.onBack();
		});
		this.resizeHandler = () => this.repositionShapes();
		window.addEventListener('resize', this.resizeHandler);
	}
	repositionShapes() {
		const field = document.getElementById('field');
		if (!field) return;
		const shapes = field.querySelectorAll('.anglesum-shape');
		const w = field.clientWidth;
		const h = field.clientHeight;
		const size = 70;
		const padding = 15;
		shapes.forEach(el => {
			let x = parseInt(el.style.left);
			let y = parseInt(el.style.top);
			if (x + size > w - padding) x = w - size - padding;
			if (y + size > h - padding) y = h - size - padding;
			if (x < padding) x = padding;
			if (y < padding) y = padding;
			el.style.left = x + 'px';
			el.style.top = y + 'px';
		});
	}
	startGame() {
		this.score = 0;
		this.round = 1;
		this.timeLeft = 60;
		this.canAnswer = true;
		this.gameEnded = false;
		document.getElementById('score').textContent = this.score;
		document.getElementById('round').textContent = `${this.round}/${this.totalRounds}`;
		document.getElementById('timer').textContent = this.timeLeft;
		this.nextRound();
		this.startTimer();
	}
	startTimer() {
		this.timerInterval = setInterval(() => {
			this.timeLeft--;
			document.getElementById('timer').textContent = this.timeLeft;
			if (this.timeLeft <= 0) this.endGame();
		}, 1000);
	}
	rand(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = this.rand(0, i);
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}
	generateShapes() {
		const field = document.getElementById('field');
		field.innerHTML = '';
		const count = this.rand(1, 4);
		let total = 0;
		const placed = [];
		const w = field.clientWidth;
		const h = field.clientHeight;
		const size = 70;
		const gap = 85;
		const padding = 10;
		for (let i = 0; i < count; i++) {
			const shape = this.shapes[this.rand(0, this.shapes.length - 1)];
			total += shape.corners;
			const el = document.createElement('div');
			el.className = `anglesum-shape ${shape.name}`;
			let x, y, attempts = 0;
			let valid = false;
			do {
				x = this.rand(padding, Math.max(padding, w - size - padding));
				y = this.rand(padding, Math.max(padding, h - size - padding));
				attempts++;
				valid = !placed.some(p => Math.abs(p.x - x) < gap && Math.abs(p.y - y) < gap);
			} while (attempts < 100 && !valid);
			placed.push({ x, y });
			el.style.left = x + 'px';
			el.style.top = y + 'px';
			field.appendChild(el);
		}
		return total;
	}
	generateAnswers(correct) {
		const answersDiv = document.getElementById('answers');
		answersDiv.innerHTML = '';
		const answers = [correct];
		while (answers.length < 4) {
			const fake = correct + this.rand(-8, 8);
			if (fake > 0 && !answers.includes(fake)) answers.push(fake);
		}
		this.shuffle(answers);
		answers.forEach(ans => {
			const btn = document.createElement('button');
			btn.className = 'anglesum-btn';
			btn.textContent = ans;
			btn.addEventListener('click', () => this.checkAnswer(ans, btn));
			answersDiv.appendChild(btn);
		});
	}
	checkAnswer(ans, btn) {
		if (!this.canAnswer || this.gameEnded) return;
		this.canAnswer = false;
		const btns = document.querySelectorAll('.anglesum-btn');
		const isCorrect = ans === this.correctAnswer;
		if (isCorrect) {
			btn.classList.add('correct');
			this.score++;
			this.updateStats();
		} else {
			btn.classList.add('wrong');
			btns.forEach(b => {
				if (parseInt(b.textContent) === this.correctAnswer) b.classList.add('correct');
			});
		}
		setTimeout(() => {
			if (this.gameEnded) return;
			if (isCorrect) {
				if (this.round < this.totalRounds) {
					this.round++;
					document.getElementById('round').textContent = `${this.round}/${this.totalRounds}`;
					this.nextRound();
				} else {
					this.endGame();
				}
			} else {
				this.nextRound();
			}
		}, 800);
	}
	nextRound() {
		this.canAnswer = true;
		this.correctAnswer = this.generateShapes();
		this.generateAnswers(this.correctAnswer);
	}
	updateStats() {
		document.getElementById('score').textContent = this.score;
	}
	endGame() {
		if (this.gameEnded) return;
		this.gameEnded = true;
		clearInterval(this.timerInterval);
		window.removeEventListener('resize', this.resizeHandler);
		if (this.score > this.record) {
			this.record = this.score;
			this.storage.set('angleSumRecord', this.record);
		}
		this.container.innerHTML = `
			<button class="back-btn" id="backBtn">&larr;</button>
			<div class="container" style="justify-content: center; align-items: center;">
				<h2>${this.timeLeft <= 0 ? 'Время вышло!' : 'Игра окончена!'}</h2>
				<p style="margin: 1rem 0">Очки: ${this.score} / ${this.totalRounds}</p>
				<p>Рекорд: ${this.record}</p>
				<button id="restartBtn" style="margin-top: 2rem">Играть снова</button>
			</div>
		`;
		document.getElementById('backBtn').addEventListener('click', () => this.onBack());
		document.getElementById('restartBtn').addEventListener('click', () => {
			this.render();
			this.startGame();
		});
	}
}
