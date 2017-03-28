import Ball from './module/graphics/ball'
require("./resource/style/main.css")

var canvas = document.getElementById("mycanvas"),
    cxt = canvas.getContext("2d"),
    ball = new Ball(50);

ball.vx = Math.random() * 10 - 5;
ball.vy = Math.random() * 10 - 5;

function move(ball) {
    if(ball.x + ball.radius > canvas.width){
        ball.x = canvas.width - ball.radius;
        ball.vx *= -1;
    }else if(ball.x - ball.radius < 0){
        ball.x = ball.radius;
        ball.vx *= -1;
    }
    if(ball.y + ball.radius > canvas.height){
        ball.y = canvas.height - ball.radius;
        ball.vy *= -1;
    }else if(ball.y - ball.radius < 0){
        ball.y = ball.radius;
        ball.vy *= -1;
    }
}

(function drawFram() {
  window.requestAnimationFrame(drawFram, canvas);
  cxt.clearRect(0, 0, canvas.width, canvas.height);

  ball.x += ball.vx;
  ball.y += ball.vy;
  move(ball);

  ball.draw(cxt);

}())
