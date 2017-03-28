class Ball{
    constructor(radius = 10, color = "#ff0000"){
        this.x = 0;
        this.y = 0;
        this.radius = radius;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.lineWidth = 1;
    }
    draw(cxt){
        cxt.save();
        cxt.translate(this.x, this.y);
        cxt.lineWidth = this.lineWidth;
        cxt.fillStyle = cxt.strokeStyle = this.color;
        cxt.beginPath();
        cxt.arc(0, 0, this.radius, 0, Math.PI * 2, true);
        cxt.closePath();
        cxt.fill();
        cxt.stroke();
        cxt.restore();
    }
}

export default Ball;