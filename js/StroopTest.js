export class StroopTest {
	constructor(storage, container, onBack) {
		this.storage = storage;
		this.container = container;
		this.onBack = onBack;
		this.colors = [
			{ name: 'Красный', color: '#ef4444' },
			{ name: 'Зелёный', color: '#22c55e' },
			{ name: 'Синий', color: '#3b82f6' },
			{ name: 'Жёлтый', color: '#eab308' },
			{ name: 'Белый', color: '#ffffff' }
		];
		this.score = 0;
		this.correct = 0;
		this.multiplier = 1;
		this.record = this.storage.get('stroopRecord', 0);
		this.timer = null;
		this.currentAnswer = false;
		this.isLocked = false;
		this.responseTimes = [];
		this.questionStartTime = 0;
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
			<div class="container stroop-container">
				<p class="stroop-question">Совпадает ли <strong>название цвета</strong> на левой карточке с <strong style="color: var(--success)">цветом текста</strong> на правой карточке?</p>
				<div class="stroop-cards" id="cards"></div>
				<div class="stroop-buttons">
					<button class="stroop-btn" id="noBtn">НЕТ</button>
					<button class="stroop-btn" id="yesBtn">ДА</button>
				</div>
			</div>
			<div class="sidebar">
				<div class="sidebar-item"><span>Очки</span><strong id="score">${this.score}</strong></div>
				<div class="sidebar-item"><span>Верно</span><strong id="correct">${this.correct}</strong></div>
				<div class="sidebar-item"><span>Множитель</span><strong id="multiplier">X${this.multiplier}</strong></div>
				<div class="sidebar-item"><span>Рекорд</span><strong id="record">${this.record}</strong></div>
			</div>
			<div class="timer-bar" id="timerBar"></div>
		`;
		document.getElementById('backBtn').addEventListener('click', () => {
			this.gameEnded = true;
			clearTimeout(this.timer);
			this.onBack();
		});
		document.getElementById('noBtn').addEventListener('click', () => this.answer(false));
		document.getElementById('yesBtn').addEventListener('click', () => this.answer(true));
	}
	startGame() {
		this.score = 0;
		this.correct = 0;
		this.multiplier = 1;
		this.responseTimes = [];
		this.isLocked = false;
		this.gameEnded = false;
		this.generateQuestion();
		document.getElementById('timerBar').classList.add('running');
		this.timer = setTimeout(() => this.endGame(), 30000);
	}
	generateQuestion() {
		const leftColor = this.colors[Math.floor(Math.random() * this.colors.length)];
		const rightColor = this.colors[Math.floor(Math.random() * this.colors.length)];
		const rightTextColor = this.colors[Math.floor(Math.random() * this.colors.length)];
		this.currentAnswer = leftColor.name === rightTextColor.name;
		this.questionStartTime = Date.now();
		document.getElementById('cards').innerHTML = `
			<div class="stroop-card" style="color: ${leftColor.color}">${leftColor.name}</div>
			<div class="stroop-card" style="color: ${rightTextColor.color}">${rightColor.name}</div>
		`;
	}
	answer(userAnswer) {
		if (this.isLocked) return;
		const responseTime = Date.now() - this.questionStartTime;
		this.responseTimes.push(responseTime);
		if (userAnswer === this.currentAnswer) {
			this.correct++;
			this.score += 10 * this.multiplier;
			this.multiplier = Math.min(this.multiplier + 1, 5);
			this.updateStats();
			this.generateQuestion();
		} else {
			this.multiplier = 1;
			this.updateStats();
			this.isLocked = true;
			document.getElementById('cards').innerHTML = `<div style="color: var(--error); font-size: 1.5rem;">Неверно!</div>`;
			setTimeout(() => {
				if (this.gameEnded) return;
				this.isLocked = false;
				this.generateQuestion();
			}, 2000);
		}
	}
	updateStats() {
		document.getElementById('score').textContent = this.score;
		document.getElementById('correct').textContent = this.correct;
		document.getElementById('multiplier').textContent = `X${this.multiplier}`;
	}
	getAverageTime() {
		if (this.responseTimes.length === 0) return 0;
		const sum = this.responseTimes.reduce((a, b) => a + b, 0);
		return Math.round(sum / this.responseTimes.length);
	}
	endGame() {
		if (this.gameEnded) return;
		this.gameEnded = true;
		clearTimeout(this.timer);
		if (this.score > this.record) {
			this.record = this.score;
			this.storage.set('stroopRecord', this.record);
		}
		const avgTime = (this.getAverageTime() / 1000).toFixed(2);
		this.container.innerHTML = `
			<button class="back-btn" id="backBtn">&larr;</button>
			<div class="container" style="justify-content: center; align-items: center;">
				<h2>Время вышло!</h2>
				<p style="margin: 1rem 0">Очки: ${this.score}</p>
				<p>Верно: ${this.correct}</p>
				<p>Среднее время ответа: ${avgTime} с</p>
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
