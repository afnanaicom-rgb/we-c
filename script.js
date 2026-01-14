
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let stars = [];
        let width, height;

        function init() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            stars = [];
            for (let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2,
                    opacity: Math.random(),
                    speed: Math.random() * 0.1 + 0.05,
                    blink: Math.random() * 0.01
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            stars.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
                ctx.fill();
                s.y += s.speed;
                if (s.y > height) s.y = 0;
                s.opacity += s.blink;
                if (s.opacity > 1 || s.opacity < 0.2) s.blink *= -1;
            });
            requestAnimationFrame(draw);
        }

        window.addEventListener('resize', init);
        init();
        draw();
    