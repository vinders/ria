var Debugger = function(){};
Debugger.log = function(message){
	try{
		console.log(message);
	}catch(exception){
		alert(message);
	}
};

function canvasSupport(){
	return Modernizr.canvas;
}

function canvasApp(){
	if (!canvasSupport()){
		return;
	}
	var c = document.getElementById('c'), 
		ctx = c.getContext('2d');

//---Début script Pong---

	var speedX, speedY, speed=6, pX=c.width/2, pY=c.height/2, scoreA=scoreB=start=pause=0, aY=bY=3*c.height/8;
	
	var timer=setInterval(updatePosition, 33);
	
	function updateSpeed(e){
		switch (e.keyCode) {
			case 90:  /* Z */
			if(aY>(c.height/16))
			{
				aY-=15;
			}
			if(start==0){
				timer=setInterval(updatePosition, 33);
				}
			break;
			case 83:  /* S */
			if(aY<((15*c.height/16)-c.height/4))
			{
				aY+=15;
			}
			if(start==0){
				timer=setInterval(updatePosition, 33);
				}
			break;
		
			case 38:  /* HAUT */
			if(bY>(c.height/16))
			{
				bY-=15;
			}
			if(start==0){
				timer=setInterval(updatePosition, 33);
				}
			break;
			case 40:  /* BAS */
			if(bY<((15*c.height/16)-c.height/4))
			{
				bY+=15;
			}
			if(start==0){
				timer=setInterval(updatePosition, 33);
				}
			break;
			
			case 80:  /* Touche P pause */
			if(pause==0){
				clearInterval(timer);
				pause=1;}
			else{
				timer=setInterval(updatePosition, 33);
				pause=0;}
			break;
			default: Debugger.log("Mauvaise touche"); break;
		}
	}
	
	
	function updatePosition(){
		if(start==0)
		{
			var sens=Math.round(Math.random());
			if(sens==0){
				sens=-1;
			}
			speedX=((Math.round(Math.random()*speed))*sens*0.5)+speed/2; //vitesse ne variant que de moitié
			sens=Math.round(Math.random());
			if(sens==0){
				sens=-1;
			}
			speedY=(speed-speedX)*sens-1;
			speedX=speedX+1 //forcer direction vers côtés
			start=1;
		}
		
		if(pY>aY && pY<(aY+c.height/4) && pX<(c.width/12) && pX>0){
			speedX=Math.abs(speedX)+Math.round(Math.random());
		}
		if(pY>bY && pY<(bY+c.height/4) && pX>(11*c.width/12) && pX<c.width){
			speedX=0-Math.abs(speedX)-Math.round(Math.random());
		}
	
		
		if(pY<((c.height/16)+2) || pY>(c.height-((c.height/16)+2)))
		{
			speedY=0-speedY;
			//part de hasard pour éviter rebond parfait et accélérer
			sens=Math.round(Math.random());
			if(speedX<0){
				sens=-1;
			}
			else
			{
				sens=1;
			}
			speedX=speedX+(sens*(Math.round(Math.random())+1)*Math.round(Math.random())); // +1/-1 * 1-2 * 0-1
		}
		pX+=speedX;
		pY+=speedY;
		
		
		if(pX<0)
		{
			//alert('Le joueur droit gagne !');
			start=0;
			pX=c.width/2;
			pY=c.height/2;
			aY=bY=3*c.height/8;
			clearInterval(timer);
			scoreB++;
			document.getElementById('scoreB').innerHTML=scoreB;
		}
		if(pX>c.width)
		{
			//alert('Le joueur gauche gagne !');
			start=0;
			pX=c.width/2;
			pY=c.height/2;
			aY=bY=3*c.height/8;
			clearInterval(timer);
			scoreA++;
			document.getElementById('scoreA').innerHTML=scoreA;
		}
		
		drawScreen();
	}

	function drawScreen(){
		ctx.fillStyle="#000000";
		ctx.fillRect(0,0,c.width,c.height);
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(2,2,c.width-4,c.height/32);
		ctx.fillRect(2,c.height-2-c.height/32,c.width-4,c.height/32);
		ctx.fillRect((0.5*c.width/10)-c.width/32,aY,c.width/32,c.height/4);
		ctx.fillRect(9.5*c.width/10,bY,c.width/32,c.height/4);
		ctx.fillStyle= "#AACCFF";
		ctx.beginPath();
		ctx.arc(pX,pY,15,0,Math.PI*2, true); 
		ctx.closePath();
		ctx.fill();
	}
	
	
	window.addEventListener('keyup',updateSpeed,true);
} // fin canvasApp
canvasApp();