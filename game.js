// 游戏配置
const config = {
    fish: {
        imageUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01c26kz51V8V8fNtRXi_!!6000000002612-2-tps-128-128.png',
        size: { width: 60, height: 40 },
        count: 2,
        speedRange: { min: 2, max: 5 }
    },
    bug: {
        imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01Ht7Piu1PtKPpk29C9_!!6000000001893-2-tps-128-128.png',
        size: { width: 30, height: 30 },
        count: 2,
        speedRange: { min: 1, max: 4 }
    }
};

// 游戏状态
let canvas, ctx, currentScene;
let gameObjects = [];

// 初始化游戏
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 设置画布大小
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 默认加载鱼塘场景
    changeScene('fish');
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 调整画布大小
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
}

// 创建游戏对象
class GameObject {
    constructor(type) {
        const conf = config[type];
        this.type = type;
        this.width = conf.size.width;
        this.height = conf.size.height;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - this.height);
        this.speedX = this.getRandomSpeed(conf.speedRange);
        this.speedY = this.getRandomSpeed(conf.speedRange);
        this.image = new Image();
        this.image.src = conf.imageUrl;
        this.rotationAngle = 0;
    }

    getRandomSpeed(range) {
        const speed = Math.random() * (range.max - range.min) + range.min;
        return Math.random() > 0.5 ? speed : -speed;
    }

    update() {
        // 更新位置
        this.x += this.speedX;
        this.y += this.speedY;

        // 计算旋转角度
        this.rotationAngle = Math.atan2(this.speedY, this.speedX);

        // 边界碰撞检测和处理
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.speedX *= -1;
            // 随机调整速度
            this.speedX += (Math.random() - 0.5);
        }
        if (this.y <= 0 || this.y + this.height >= canvas.height) {
            this.speedY *= -1;
            // 随机调整速度
            this.speedY += (Math.random() - 0.5);
        }

        // 保持速度在合理范围内
        const conf = config[this.type];
        this.speedX = Math.min(Math.max(this.speedX, -conf.speedRange.max), conf.speedRange.max);
        this.speedY = Math.min(Math.max(this.speedY, -conf.speedRange.max), conf.speedRange.max);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotationAngle);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

// 切换场景
function changeScene(type) {
    currentScene = type;
    gameObjects = [];
    
    // 创建新的游戏对象
    for (let i = 0; i < config[type].count; i++) {
        gameObjects.push(new GameObject(type));
    }
}

// 游戏主循环
function gameLoop() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 更新和绘制所有游戏对象
    gameObjects.forEach(obj => {
        obj.update();
        obj.draw();
    });
    
    requestAnimationFrame(gameLoop);
}

// 启动游戏
window.addEventListener('load', init);