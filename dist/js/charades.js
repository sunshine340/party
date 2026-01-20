/**
 * 你画我猜 / 比划猜词 游戏模块
 */
const charades = {
    // 游戏配置
    config: {
        timeLimit: 60,      // 倒计时秒数
        difficulty: 'easy'  // 难度
    },

    // 游戏状态
    state: {
        words: [],          // 当前词语列表
        currentIndex: 0,    // 当前词语索引
        score: 0,           // 得分
        skipped: 0,         // 跳过次数
        timeLeft: 60,       // 剩余时间
        timer: null,        // 计时器
        isPlaying: false,
        isWordVisible: false
    },

    /**
     * 初始化设置页
     */
    init() {
        this.config.timeLimit = 60;
        this.config.difficulty = 'easy';
        this.updateDifficultyUI();
        this.updateUI();
    },

    /**
     * 调整时间
     */
    adjustTime(delta) {
        const newTime = this.config.timeLimit + delta;
        if (newTime >= 30 && newTime <= 180) {
            this.config.timeLimit = newTime;
            this.updateUI();
        }
    },

    /**
     * 设置难度
     */
    setDifficulty(level) {
        this.config.difficulty = level;
        this.updateDifficultyUI();
    },

    /**
     * 更新难度按钮UI
     */
    updateDifficultyUI() {
        ['easy', 'medium', 'hard', 'all'].forEach(d => {
            const btn = document.getElementById(`diff-${d}`);
            if (btn) {
                btn.classList.toggle('active', d === this.config.difficulty);
            }
        });
    },

    /**
     * 更新界面
     */
    updateUI() {
        document.getElementById('charades-time').textContent = this.config.timeLimit;
    },

    /**
     * 开始游戏
     */
    startGame() {
        // 获取词语列表并打乱
        const wordList = GameData.getCharadesWords(this.config.difficulty);
        this.state.words = GameData.shuffle(wordList);
        this.state.currentIndex = 0;
        this.state.score = 0;
        this.state.skipped = 0;
        this.state.timeLeft = this.config.timeLimit;
        this.state.isPlaying = true;
        this.state.isWordVisible = false;

        // 更新显示
        this.updateGameUI();

        // 显示游戏页
        app.showPage('charades-game');

        // 重置词语卡状态
        document.getElementById('word-card').classList.remove('flipped');

        // 开始计时
        this.startTimer();
    },

    /**
     * 开始计时器
     */
    startTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }

        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            this.updateTimerUI();

            if (this.state.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    },

    /**
     * 更新计时器UI
     */
    updateTimerUI() {
        const timerEl = document.getElementById('charades-timer');
        timerEl.textContent = this.state.timeLeft;

        // 时间少于10秒时警告
        if (this.state.timeLeft <= 10) {
            timerEl.classList.add('warning');
        } else {
            timerEl.classList.remove('warning');
        }
    },

    /**
     * 更新游戏UI
     */
    updateGameUI() {
        document.getElementById('charades-score').textContent = this.state.score;
        document.getElementById('current-word').textContent = this.getCurrentWord();
    },

    /**
     * 获取当前词语
     */
    getCurrentWord() {
        if (this.state.currentIndex >= this.state.words.length) {
            // 词语用完，重新打乱
            this.state.words = GameData.shuffle(this.state.words);
            this.state.currentIndex = 0;
        }
        return this.state.words[this.state.currentIndex];
    },

    /**
     * 显示词语（翻牌）
     */
    showWord() {
        const card = document.getElementById('word-card');
        if (!card.classList.contains('flipped')) {
            card.classList.add('flipped');
            this.state.isWordVisible = true;
        }
    },

    /**
     * 隐藏词语
     */
    hideWord() {
        const card = document.getElementById('word-card');
        card.classList.remove('flipped');
        this.state.isWordVisible = false;
    },

    /**
     * 跳过词语
     */
    skipWord() {
        this.state.skipped++;
        this.nextWord();
    },

    /**
     * 猜对了
     */
    correctWord() {
        this.state.score++;
        this.nextWord();
    },

    /**
     * 下一个词语
     */
    nextWord() {
        this.state.currentIndex++;
        this.hideWord();

        // 短暂延迟后更新词语（让翻牌动画完成）
        setTimeout(() => {
            this.updateGameUI();
        }, 200);
    },

    /**
     * 结束游戏
     */
    endGame() {
        // 停止计时器
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }

        this.state.isPlaying = false;

        // 显示结果
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const resultStats = document.getElementById('result-stats');

        // 根据得分给出不同评价
        let praise = '';
        if (this.state.score >= 15) {
            praise = '太厉害了！默契满分！';
            resultIcon.textContent = '🏆';
        } else if (this.state.score >= 10) {
            praise = '表现很棒！';
            resultIcon.textContent = '🎉';
        } else if (this.state.score >= 5) {
            praise = '还不错，继续加油！';
            resultIcon.textContent = '😊';
        } else {
            praise = '革命尚未成功，同志仍需努力！';
            resultIcon.textContent = '💪';
        }

        resultTitle.textContent = `得分: ${this.state.score}`;
        resultMessage.textContent = praise;

        const difficultyName = {
            easy: '简单',
            medium: '中等',
            hard: '困难',
            all: '全部',
            funny: '趣味'
        };

        resultStats.innerHTML = `
            <p><span>答对</span><strong>${this.state.score} 个</strong></p>
            <p><span>跳过</span><strong>${this.state.skipped} 个</strong></p>
            <p><span>难度</span><strong>${difficultyName[this.config.difficulty]}</strong></p>
            <p><span>用时</span><strong>${this.config.timeLimit - this.state.timeLeft} 秒</strong></p>
        `;

        app.currentGame = 'charades';
        app.showPage('game-over');
    },

    /**
     * 重新开始
     */
    restart() {
        this.init();
        app.showPage('charades-setup');
    },

    /**
     * 清理（页面切换时调用）
     */
    cleanup() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
        this.state.isPlaying = false;
    }
};

// 初始化
window.charades = charades;
