import Graphics from "./graphics"

class Ball extends Graphics{
    constructor(radius = 10, color = "#ff0000"){
        super();
        this.radius = radius;
        this.color = color;
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