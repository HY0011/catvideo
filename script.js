let canvas, ctx, currentScene = 'fish';
let animationFrameId;
let objects = [];
let ripples = [];
let backgrounds = {
    fish: new Image(),
    bugs: new Image(),
    birds: new Image()
};

// 加载背景图像
// 使用Unsplash的免费图片
backgrounds.fish.src = 'https://images.unsplash.com/photo-1513550363805-0237b0fb1c2d?auto=format&fit=crop&w=1920';
backgrounds.bugs.src = 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1920';
backgrounds.birds.src = 'https://images.unsplash.com/photo-1536532184021-da5392b55da1?auto=format&fit=crop&w=1920';

// 添加图片加载错误处理
Object.values(backgrounds).forEach(img => {
    img.onerror = function() {
        // 图片加载失败时使用纯色背景
        this.failed = true;
    };
});


class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.alpha = 0.5;
    }

    update() {
        this.radius += 1;
        this.alpha -= 0.005;
        return this.alpha > 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.stroke();
    }
}

class GameObject {
    constructor(x, y, size, speed, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.dx = (Math.random() - 0.5) * speed;
        this.dy = (Math.random() - 0.5) * speed;
        this.lastX = x;
        this.lastY = y;
    }

    update() {
        this.lastX = this.x;
        this.lastY = this.y;
        
        // 使用更复杂的随机运动
        this.dx += (Math.random() - 0.5) * 0.4;
        this.dy += (Math.random() - 0.5) * 0.4;
        
        // 添加周期性的运动
        this.dx += Math.sin(Date.now() / 2000) * 0.2;
        this.dy += Math.cos(Date.now() / 1800) * 0.2;
        
        // 根据场景添加特定的运动模式
        if (currentScene === 'fish') {
            // 鱼的运动更流畅
            this.dy += Math.sin(Date.now() / 1500) * 0.15;
        } else if (currentScene === 'bugs') {
            // 虫子的运动更跳跃
            if (Math.random() < 0.05) {
                this.dx += (Math.random() - 0.5) * 2;
                this.dy += (Math.random() - 0.5) * 2;
            }
        } else if (currentScene === 'birds') {
            // 鸟的运动更有方向性
            if (Math.random() < 0.02) {
                this.targetDx = (Math.random() - 0.5) * this.speed * 2;
                this.targetDy = (Math.random() - 0.5) * this.speed * 2;
            }
            this.dx += (this.targetDx - this.dx) * 0.1;
            this.dy += (this.targetDy - this.dy) * 0.1;
        
        // 限制速度
        const maxSpeed = this.speed;
        const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (currentSpeed > maxSpeed) {
            this.dx = (this.dx / currentSpeed) * maxSpeed;
            this.dy = (this.dy / currentSpeed) * maxSpeed;
        }

        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0 || this.x > canvas.width) {
            this.dx = -this.dx;
            this.x = this.x < 0 ? 0 : canvas.width;
        }
        if (this.y < 0 || this.y > canvas.height) {
            this.dy = -this.dy;
            this.y = this.y < 0 ? 0 : canvas.height;
        }

        // 随机添加水波纹
        if (Math.random() < 0.02) {
            ripples.push(new Ripple(this.x, this.y));
        }
    }
}

class Fish extends GameObject {
    constructor(x, y, size, speed, color) {
        super(x, y, size, speed, color);
        this.tailAngle = 0;
        this.finPhase = 0;
        this.targetAngle = 0;
        this.currentAngle = 0;
    }

    update() {
        super.update();
        this.targetAngle = Math.atan2(this.dy, this.dx);
        // 平滑转向
        const angleDiff = this.targetAngle - this.currentAngle;
        this.currentAngle += angleDiff * 0.1;
        this.tailAngle += 0.1;
        this.finPhase += 0.15;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.currentAngle);

        // 创建渐变色
        const gradient = ctx.createLinearGradient(0, -this.size/2, 0, this.size/2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, `rgba(${parseInt(this.color.slice(1,3),16)}, ${parseInt(this.color.slice(3,5),16)}, ${parseInt(this.color.slice(5,7),16)}, 0.6)`);

        // 鱼身
        ctx.beginPath();
        ctx.moveTo(this.size/2, 0);
        ctx.bezierCurveTo(
            this.size/2, -this.size/3,
            -this.size/2, -this.size/3,
            -this.size + Math.sin(this.tailAngle) * this.size/8, 0
        );
        ctx.bezierCurveTo(
            -this.size/2, this.size/3,
            this.size/2, this.size/3,
            this.size/2, 0
        );
        ctx.fillStyle = gradient;
        ctx.fill();

        // 鱼鳍
        ctx.beginPath();
        ctx.moveTo(-this.size/4, 0);
        const finOffset = Math.sin(this.finPhase) * this.size/6;
        ctx.quadraticCurveTo(
            -this.size/2, finOffset,
            -this.size/3, this.size/2
        );
        ctx.quadraticCurveTo(
            -this.size/2, -finOffset,
            -this.size/4, -this.size/2
        );
        ctx.fillStyle = `rgba(${parseInt(this.color.slice(1,3),16)}, ${parseInt(this.color.slice(3,5),16)}, ${parseInt(this.color.slice(5,7),16)}, 0.7)`;
        ctx.fill();

        // 鱼尾
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.8, 0);
        ctx.quadraticCurveTo(
            -this.size * 1.2, -this.size/3,
            -this.size * 1.4, Math.sin(this.tailAngle) * this.size/3
        );
        ctx.quadraticCurveTo(
            -this.size * 1.2, this.size/3,
            -this.size * 0.8, 0
        );
        ctx.fill();

        // 鱼眼
        ctx.beginPath();
        ctx.arc(this.size/3, -this.size/6, this.size/10, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.size/3, -this.size/6, this.size/20, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();

        ctx.restore();
    }
}

class Bug extends GameObject {
    constructor(x, y, size, speed, color) {
        super(x, y, size, speed, color);
        this.wigglePhase = 0;
        this.wingPhase = 0;
    }

    update() {
        super.update();
        this.wigglePhase += 0.2;
        this.wingPhase += 0.3;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.dy, this.dx));

        // 创建渐变色
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, `rgba(${parseInt(this.color.slice(1,3),16)}, ${parseInt(this.color.slice(3,5),16)}, ${parseInt(this.color.slice(5,7),16)}, 0.5)`);

        // 身体
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size/2, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 翅膀
        const wingSpread = Math.sin(this.wingPhase) * this.size/2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
            this.size/2, -wingSpread,
            this.size, 0
        );
        ctx.quadraticCurveTo(
            this.size/2, wingSpread,
            0, 0
        );
        ctx.fillStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.fill();

        // 触角
        ctx.beginPath();
        ctx.moveTo(this.size/2, -this.size/4);
        ctx.quadraticCurveTo(
            this.size, -this.size/2 + Math.sin(this.wigglePhase) * this.size/8,
            this.size * 1.2, -this.size/3
        );
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}

class Bird extends GameObject {
    constructor(x, y, size, speed, color) {
        super(x, y, size, speed, color);
        this.wingAngle = 0;
        this.bodyPhase = 0;
    }

    update() {
        super.update();
        this.wingAngle += 0.2;
        this.bodyPhase += 0.1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.dy, this.dx));

        // 创建渐变色
        const gradient = ctx.createLinearGradient(0, -this.size, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, `rgba(${parseInt(this.color.slice(1,3),16)}, ${parseInt(this.color.slice(3,5),16)}, ${parseInt(this.color.slice(5,7),16)}, 0.7)`);

        // 身体
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.quadraticCurveTo(
            0, -this.size/3 + Math.sin(this.bodyPhase) * this.size/8,
            -this.size, 0
        );
        ctx.quadraticCurveTo(
            0, this.size/3 + Math.sin(this.bodyPhase) * this.size/8,
            this.size, 0
        );
        ctx.fillStyle = gradient;
        ctx.fill();

        // 翅膀
        const wingSpread = Math.sin(this.wingAngle) * this.size/2;
        ['left', 'right'].forEach(side => {
            ctx.beginPath();
            const sign = side === 'left' ? 1 : -1;
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                this.size/2, sign * wingSpread,
                this.size * 1.2, sign * this.size/4
            );
            ctx.quadraticCurveTo(
                this.size/2, sign * (wingSpread + this.size/4),
                -this.size/4, sign * this.size/8
            );
            ctx.fillStyle = `rgba(${parseInt(this.color.slice(1,3),16)}, ${parseInt(this.color.slice(3,5),16)}, ${parseInt(this.color.slice(5,7),16)}, 0.6)`;
            ctx.fill();
        });

        ctx.restore();
    }
}

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    changeScene('fish');
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function changeScene(scene) {
    currentScene = scene;
    objects = [];
    ripples = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];

    // 只创建两个对象
    for (let i = 0; i < 2; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 30 + 30; // 增大尺寸
        const speed = Math.random() * 2 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];

        switch(scene) {
            case 'fish':
                objects.push(new Fish(x, y, size, speed, color));
                break;
            case 'bugs':
                objects.push(new Bug(x, y, size/2, speed, color));
                break;
            case 'birds':
                objects.push(new Bird(x, y, size, speed, color));
                break;
        }
    }

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animate();
}

function animate() {
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 如果背景图像已加载，则绘制背景
    if (backgrounds[currentScene].complete) {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(backgrounds[currentScene], 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }

    // 更新和绘制水波纹
    ripples = ripples.filter(ripple => ripple.update());
    ripples.forEach(ripple => ripple.draw());

    objects.forEach(obj => {
        obj.update();
        obj.draw();
    });

    animationFrameId = requestAnimationFrame(animate);
}

window.onload = init;