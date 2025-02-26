class LEDStrip {
    constructor() {
        this.leds = document.querySelectorAll('.led');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.currentMode = 'running'; // 預設模式
        this.speed = document.getElementById('speed');
        this.speedDisplay = document.getElementById('speedDisplay');
        this.brightness = document.getElementById('brightness');
        this.brightnessDisplay = document.getElementById('brightnessDisplay');
        this.ledColor = document.getElementById('ledColor');
        this.fadeRange = document.getElementById('fadeRange');
        this.fadeRangeDisplay = document.getElementById('fadeRangeDisplay');
        this.fadeRangeGroup = document.getElementById('fadeRangeGroup');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.animation = null;
        this.isRunning = false;
        
        this.initializeEvents();
        this.updateSpeedDisplay(); // 初始化顯示
        this.updateFadeRangeDisplay();
        this.updateBrightnessDisplay();
    }

    initializeEvents() {
        // 模式按鈕事件處理
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有按鈕的active狀態
                this.modeButtons.forEach(b => b.classList.remove('active'));
                // 設置當前按鈕為active
                btn.classList.add('active');
                // 更新當前模式
                this.currentMode = btn.dataset.mode;
                // 顯示或隱藏漸層範圍控制
                this.fadeRangeGroup.style.display = 
                    ['centerSpread', 'sidesFocus', 'meteor'].includes(this.currentMode) 
                    ? 'flex' : 'none';
                // 如果正在運行，重新啟動新模式
                if (this.isRunning) {
                    this.stop();
                    this.start();
                }
            });
        });

        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 即時更新亮度
        this.brightness.addEventListener('input', () => {
            this.updateBrightness();
            this.updateBrightnessDisplay();
        });
        
        // 即時更新顏色
        this.ledColor.addEventListener('input', () => {
            this.updateColor();
        });
        
        // 即時更新速度顯示
        this.speed.addEventListener('input', () => {
            this.updateSpeedDisplay();
        });

        // 即時更新漸層範圍顯示
        this.fadeRange.addEventListener('input', () => {
            this.updateFadeRangeDisplay();
        });
    }

    updateSpeedDisplay() {
        const seconds = (1000 - (this.speed.value * 90)) / 1000;
        this.speedDisplay.textContent = `${seconds.toFixed(2)}秒`;
    }

    updateBrightness() {
        const brightness = this.brightness.value;
        this.leds.forEach(led => {
            if (led.classList.contains('active')) {
                led.style.opacity = brightness / 100;
            }
        });
    }

    updateColor() {
        const color = this.ledColor.value;
        this.leds.forEach(led => {
            if (led.classList.contains('active')) {
                led.style.backgroundColor = color;
            }
        });
    }

    updateFadeRangeDisplay() {
        this.fadeRangeDisplay.textContent = `${this.fadeRange.value}%`;
    }

    updateBrightnessDisplay() {
        this.brightnessDisplay.textContent = `${this.brightness.value}%`;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        switch(this.currentMode) {
            case 'running':
                this.runningLightMode();
                break;
            case 'waterflow':
                this.waterflowMode();
                break;
            case 'warning':
                this.warningMode();
                break;
            case 'random':
                this.randomMode();
                break;
            case 'centerSpread':
                this.centerSpreadMode();
                break;
            case 'sidesFocus':
                this.sidesFocusMode();
                break;
            case 'idle':
                this.idleMode();
                break;
            case 'heartbeat':
                this.heartbeatMode();
                break;
            case 'meteor':
                this.meteorMode();
                break;
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animation) {
            cancelAnimationFrame(this.animation);
        }
    }

    reset() {
        this.stop();
        this.leds.forEach(led => {
            led.classList.remove('active');
            led.style.backgroundColor = '#444';
            led.style.opacity = 1;
        });
    }

    // 跑馬燈模式
    runningLightMode() {
        let currentLed = 0;
        let lastTime = 0;
        const frameInterval = () => 1000 - (this.speed.value * 90); // 速度調整範圍從100ms到1000ms
        
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            // 控制動畫更新頻率
            if (currentTime - lastTime < frameInterval()) {
                this.animation = requestAnimationFrame(animate);
                return;
            }
            
            // 重置所有LED
            this.leds.forEach(led => {
                led.classList.remove('active');
                led.style.backgroundColor = '#444';
            });
            
            // 點亮當前LED
            this.leds[currentLed].classList.add('active');
            this.leds[currentLed].style.backgroundColor = this.ledColor.value;
            this.leds[currentLed].style.opacity = this.brightness.value / 100;
            
            // 更新到下一個LED
            currentLed = (currentLed + 1) % this.leds.length;
            
            lastTime = currentTime;
            this.animation = requestAnimationFrame(animate);
        };
        
        this.animation = requestAnimationFrame(animate);
    }

    // 流水效果（支持往返）
    waterflowMode() {
        let currentLed = 0;
        let direction = 1; // 1: 向右, -1: 向左
        let lastTime = 0;
        const frameInterval = () => 1000 - (this.speed.value * 90);
        
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            if (currentTime - lastTime < frameInterval()) {
                this.animation = requestAnimationFrame(animate);
                return;
            }
            
            this.leds.forEach(led => {
                led.classList.remove('active');
                led.style.backgroundColor = '#444';
            });
            
            this.leds[currentLed].classList.add('active');
            this.leds[currentLed].style.backgroundColor = this.ledColor.value;
            this.leds[currentLed].style.opacity = this.brightness.value / 100;
            
            // 往返邏輯
            if (direction === 1 && currentLed >= this.leds.length - 1) {
                direction = -1;
            } else if (direction === -1 && currentLed <= 0) {
                direction = 1;
            }
            
            currentLed += direction;
            
            lastTime = currentTime;
            this.animation = requestAnimationFrame(animate);
        };
        
        this.animation = requestAnimationFrame(animate);
    }

    // 警告閃燈
    warningMode() {
        let isOn = true;
        let lastTime = 0;
        const frameInterval = () => 500 - (this.speed.value * 40); // 更快的閃爍頻率
        
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            if (currentTime - lastTime < frameInterval()) {
                this.animation = requestAnimationFrame(animate);
                return;
            }
            
            this.leds.forEach(led => {
                led.classList.toggle('active');
                led.style.backgroundColor = isOn ? this.ledColor.value : '#444';
                led.style.opacity = isOn ? this.brightness.value / 100 : 1;
            });
            
            isOn = !isOn;
            lastTime = currentTime;
            this.animation = requestAnimationFrame(animate);
        };
        
        this.animation = requestAnimationFrame(animate);
    }

    // 隨機效果（最多滅40%）
    randomMode() {
        let lastTime = 0;
        const frameInterval = () => 1000 - (this.speed.value * 90);
        const maxOffLeds = Math.floor(this.leds.length * 0.4); // 最多40%的燈可以關閉
        
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            if (currentTime - lastTime < frameInterval()) {
                this.animation = requestAnimationFrame(animate);
                return;
            }
            
            // 重置所有LED
            this.leds.forEach(led => {
                led.classList.add('active');
                led.style.backgroundColor = this.ledColor.value;
                led.style.opacity = this.brightness.value / 100;
            });
            
            // 隨機選擇要關閉的LED
            let offLeds = new Set();
            while (offLeds.size < maxOffLeds) {
                offLeds.add(Math.floor(Math.random() * this.leds.length));
            }
            
            // 關閉選中的LED
            offLeds.forEach(index => {
                this.leds[index].classList.remove('active');
                this.leds[index].style.backgroundColor = '#444';
            });
            
            lastTime = currentTime;
            this.animation = requestAnimationFrame(animate);
        };
        
        this.animation = requestAnimationFrame(animate);
    }

    // 中心擴散
    centerSpreadMode() {
        let step = 0;
        let lastTime = 0;
        const frameInterval = () => 1000 - (this.speed.value * 90);
        const centerLeft = Math.floor((this.leds.length - 2) / 2); // 中心左側LED
        const centerRight = centerLeft + 1; // 中心右側LED
        let expanding = true; // 控制是否在擴散階段
        const maxStep = Math.floor(this.leds.length / 2); // 最大擴散步數
        const minBrightness = (100 - this.fadeRange.value) / 100; // 最小亮度百分比
        
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            if (currentTime - lastTime < frameInterval()) {
                this.animation = requestAnimationFrame(animate);
                return;
            }
            
            // 重置所有LED到初始狀態
            this.leds.forEach(led => {
                led.classList.remove('active');
                led.style.backgroundColor = '#444';
            });
            
            // 始終點亮中心兩個LED
            this.leds[centerLeft].classList.add('active');
            this.leds[centerLeft].style.backgroundColor = this.ledColor.value;
            this.leds[centerLeft].style.opacity = this.brightness.value / 100;
            
            this.leds[centerRight].classList.add('active');
            this.leds[centerRight].style.backgroundColor = this.ledColor.value;
            this.leds[centerRight].style.opacity = this.brightness.value / 100;
            
            // 計算擴散效果的亮度衰減
            for (let i = 1; i <= step; i++) {
                const fadeRatio = 1 - ((1 - minBrightness) * i / maxStep);
                const opacity = (this.brightness.value / 100) * fadeRatio;
                
                // 向右擴散
                if (centerRight + i < this.leds.length) {
                    const rightLed = this.leds[centerRight + i];
                    rightLed.classList.add('active');
                    rightLed.style.backgroundColor = this.ledColor.value;
                    rightLed.style.opacity = opacity;
                }
                
                // 向左擴散
                if (centerLeft - i >= 0) {
                    const leftLed = this.leds[centerLeft - i];
                    leftLed.classList.add('active');
                    leftLed.style.backgroundColor = this.ledColor.value;
                    leftLed.style.opacity = opacity;
                }
            }
            
            // 控制擴散和收縮
            if (expanding) {
                step++;
                if (step >= maxStep - 1) { // 減1是因為中心已經占用了2個LED
                    expanding = false;
                }
            } else {
                step--;
                if (step <= 0) {
                    expanding = true;
                }
            }
            
            lastTime = currentTime;
            this.animation = requestAnimationFrame(animate);
        };
        
        this.animation = requestAnimationFrame(animate);
    }

    // 兩側集中
    sidesFocusMode() {
        let step = 0;
        let lastTime = 0;
        const frameInterval = () => 1000 - (this.speed.value * 90);
        const maxStep = Math.floor(this.leds.length / 2);
        let focusing = true;
        const minBrightness = (100 - this.fadeRange.value) / 100;
        
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            if (currentTime - lastTime < frameInterval()) {
                this.animation = requestAnimationFrame(animate);
                return;
            }
            
            // 重置所有LED到初始狀態
            this.leds.forEach(led => {
                led.classList.remove('active');
                led.style.backgroundColor = '#444';
            });
            
            // 計算聚焦效果
            for (let i = 0; i <= step; i++) {
                const fadeRatio = 1 - ((1 - minBrightness) * i / maxStep);
                const opacity = (this.brightness.value / 100) * fadeRatio;
                
                // 左側
                if (i < this.leds.length / 2) {
                    const leftLed = this.leds[i];
                    leftLed.classList.add('active');
                    leftLed.style.backgroundColor = this.ledColor.value;
                    leftLed.style.opacity = opacity;
                }
                
                // 右側
                const rightIndex = this.leds.length - 1 - i;
                if (rightIndex >= this.leds.length / 2) {
                    const rightLed = this.leds[rightIndex];
                    rightLed.classList.add('active');
                    rightLed.style.backgroundColor = this.ledColor.value;
                    rightLed.style.opacity = opacity;
                }
            }
            
            // 控制聚焦和擴散
            if (focusing) {
                step++;
                if (step >= maxStep) {
                    focusing = false;
                }
            } else {
                step--;
                if (step <= 0) {
                    focusing = true;
                }
            }
            
            lastTime = currentTime;
            this.animation = requestAnimationFrame(animate);
        };
        
        this.animation = requestAnimationFrame(animate);
    }

    // IDLE模式
    idleMode() {
        this.reset();
        const idleBrightness = 0.3; // 30% 亮度
        
        this.leds.forEach(led => {
            led.classList.add('active');
            led.style.backgroundColor = this.ledColor.value;
            led.style.opacity = (this.brightness.value / 100) * idleBrightness;
        });
    }

    // 心跳效果
    heartbeatMode() {
        let phase = 0;
        let lastTime = 0;
        const frameInterval = () => 50;
        let isHeartbeat = true; // 用於切換心跳和呼吸效果
        let switchTimer = null;
        
        const animate = (currentTime) => {
            if (!this.isRunning) {
                if (switchTimer) clearTimeout(switchTimer);
                return;
            }
            
            if (currentTime - lastTime < frameInterval()) {
                this.animation = requestAnimationFrame(animate);
                return;
            }
            
            let opacity;
            if (isHeartbeat) {
                // 心跳效果：使用正弦函數創建雙峰波形
                const baseOpacity = this.brightness.value / 100;
                const heartbeat = Math.sin(phase * 2) * 0.5 + 0.5;
                opacity = baseOpacity * (heartbeat * 0.7 + 0.3);
                phase += 0.1 * this.speed.value / 5;
            } else {
                // 呼吸效果：使用正弦函數創建平滑的單峰波形
                opacity = (Math.sin(phase) * 0.5 + 0.5) * (this.brightness.value / 100);
                phase += 0.05 * this.speed.value / 5;
            }
            
            this.leds.forEach(led => {
                led.classList.add('active');
                led.style.backgroundColor = this.ledColor.value;
                led.style.opacity = opacity;
            });
            
            if (phase >= Math.PI * 2) {
                phase = 0;
            }
            
            lastTime = currentTime;
            this.animation = requestAnimationFrame(animate);
        };
        
        // 每5秒切換一次效果
        const switchEffect = () => {
            if (!this.isRunning) return;
            isHeartbeat = !isHeartbeat;
            phase = 0;
            switchTimer = setTimeout(switchEffect, 5000);
        };
        
        this.animation = requestAnimationFrame(animate);
        switchTimer = setTimeout(switchEffect, 5000);
    }

    // 流星效果
    meteorMode() {
        let position = -1;
        let lastTime = 0;
        const frameInterval = () => 1000 - (this.speed.value * 90);
        const tailLength = 6; // 增加尾部長度，使效果更明顯
        const minBrightness = (100 - this.fadeRange.value) / 100;
        
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            if (currentTime - lastTime < frameInterval()) {
                this.animation = requestAnimationFrame(animate);
                return;
            }
            
            // 重置所有LED到初始狀態
            this.leds.forEach(led => {
                led.classList.remove('active');
                led.style.backgroundColor = '#444';
            });
            
            // 繪製流星及其尾部
            for (let i = 0; i < tailLength; i++) {
                const currentPos = position - i;
                if (currentPos >= 0 && currentPos < this.leds.length) {
                    // 使用二次函數使尾部衰減更自然
                    const fadeRatio = 1 - ((1 - minBrightness) * (i * i) / (tailLength * tailLength));
                    const opacity = fadeRatio * (this.brightness.value / 100);
                    
                    const led = this.leds[currentPos];
                    led.classList.add('active');
                    led.style.backgroundColor = '#ff0000'; // 固定紅色
                    led.style.opacity = opacity;
                }
            }
            
            // 控制流星移動
            position++;
            if (position > this.leds.length + tailLength) {
                // 添加隨機延遲，使連續的流星效果更自然
                position = -Math.floor(Math.random() * 3);
            }
            
            lastTime = currentTime;
            this.animation = requestAnimationFrame(animate);
        };
        
        this.animation = requestAnimationFrame(animate);
    }
}

// 初始化LED燈條
document.addEventListener('DOMContentLoaded', () => {
    const ledStrip = new LEDStrip();
}); 