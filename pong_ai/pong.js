//Le script fonctionne parfaitement sous Firefox 15, Opera 12, IE9, et SRWare-Iron(équivalent Chrome)
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
	if(son==true){
		var monSon= new Audio();
		monSon.src="start."+formatSon;
		monSon.play();
	}
	if(difficulte==0){
		var diffTaille=6;
	}else{
		var diffTaille=4;
	}
	var speedX, speedY, speed=5+difficulte, pX=c.width/2, pY=c.height/2, scoreA=scoreB=start=pause=0, aY=(diffTaille-1)*c.height/(diffTaille*2), bY=3*c.height/8;
	var timer=setInterval(updatePosition, 33);
	
	function updateSpeed(e){
		switch (e.keyCode) {
			case 38:  /* HAUT */
			if(bY>(c.height/16) && start==1 && pause==0){
				bY-=15;
			}
			break;
			case 40:  /* BAS */
			if(bY<((15*c.height/16)-c.height/4) && start==1 && pause==0){
				bY+=15;
			}
			break;
			
			case 80:  /* Touche P pause */
				clearInterval(timer);
			break;
			default: Debugger.log("Mauvaise touche"); break;
		}
	}
	
	function restartSpeed(e){
		switch (e.keyCode) {
			case 38:  /* HAUT */
			if(bY>(c.height/16) && (start==0 || pause==1)){
				bY-=15;
				timer=setInterval(updatePosition, 33);
				pause=0;
			}
			break;
			case 40:  /* BAS */
			if(bY<((15*c.height/16)-c.height/4) && (start==0 || pause==1)){
				bY+=15;
				timer=setInterval(updatePosition, 33);
				pause=0;
			}
			break;
			case 80:  /* Touche P pause */
			if(pause==1 || start==0){
				timer=setInterval(updatePosition, 33);
				pause=0;
			}else{
				if(pause==0 && start==1){
					//clearInterval(timer);
					pause=1;
				}
			}
			break;
			default: break;
		}
	}
	
	function updatePosition(){
		if(start==0)
		{
			start=1;
			var sens=Math.round(Math.random());
			if(sens==0){
				sens=0-1;
			}
			speedX=((Math.round(Math.random()*speed))*sens*0.5)+speed/2; //vitesse ne variant que de moitié
			sens=Math.round(Math.random());
			if(sens==0){
				sens=0-1;
			}
			speedY=(speed-speedX)*sens-1;
			speedX=speedX+1 //forcer direction vers côtés
		}
		//rebonds gauche et droite
		if(pY>aY && pY<(aY+c.height/diffTaille) && pX<(c.width/25) && pX>0){
			speedX=Math.abs(speedX)+Math.round(Math.random());
			//rectification si trop horizontal
			if(speedY==1 || speedY==(0-1)){
				speedY=speedY+Math.ceil((Math.random()*10)+10)/10;
			}
			if(speedY==0){
				speedY=Math.ceil(Math.random()*3);
			}
			if(son==true){
				monSon.src="rebond."+formatSon;
				monSon.play();
			}
		}
		if(pY>bY && pY<(bY+c.height/4) && pX>(24*c.width/25) && pX<c.width){
			speedX=0-Math.abs(speedX)-Math.round(Math.random());
			//rectification si trop horizontal
			if(speedY==1 || speedY==(0-1) || Math.abs(speedY)<Math.abs(speedX/6)){
				speedY=speedY*Math.ceil(Math.random()*3);
			}
			if(speedY==0){
				speedY=Math.ceil(Math.random()*3);
			}
			if(son==true){
				monSon.src="rebond."+formatSon;
				monSon.play();
			}
		}
		//rebonds haut et bas
		if(pY<((c.height/18)+2) || pY>(c.height-((c.height/18)+2)))
		{
			speedY=0-speedY;
			//part de hasard pour éviter rebond parfait et accélérer
			var sens2=Math.round(Math.random());
			if(speedX<0){
				sens2=0-1;
			}
			else
			{
				sens2=1;
			}
			speedX=speedX+(sens2*(Math.round(Math.random())+1)*Math.round(Math.random()));
			//rectification si trop vertical au rebond
			if(Math.abs(speedX)<Math.abs(speedY/4)){
				speedX=(speedX/Math.abs(speedX))*(speedY/4);
			}
			if(son==true){
				monSon.src="rebond."+formatSon;
				monSon.play();
			}
		}
		//rectification si parfaitement vertical
		if(speedX==0 && start!=0)
		{
			var secours=Math.round(Math.random());
			if(secours==0){
				secours=0-1;
			}
			speedX=secours*Math.ceil(Math.random()*3);
		}
		pX+=speedX;
		pY+=speedY;
		
		//Intelligence artificielle
		if(speedX<0){
			if(speedX<-1 || pX<250){
			//--calcul position future en fonction de la distance et la vitesse
				if(speedY<5){
					if(speedX>3){
						var coef=Math.abs(Math.round((10*(pX-10)*(pX-10))/(2*c.height*speedX))/10);
					}else{
						var coef=(Math.round((0-speedX)*pX/12))/10;
					}
				}else{
					var coef=Math.abs(Math.round((10*pX*pX)/(4*c.height*speedX))/10);
				}
				var futurY=(coef*speedY)+pY;
				if(Math.abs(Math.floor(futurY/380))>3){
					futurY=Math.round(futurY%380);
				}
				if(nb%2!=0){
					var decal=380;
				}else{
					var decal=0;
				}
				if(futurY<10){
					var nb=Math.floor((futurY-10)/380);
					futurY=Math.abs(20-futurY%380-decal);
				}
				if(futurY>390){
					var nb=Math.floor((futurY-389)/380);
					futurY=10+Math.abs(decal-380-futurY%380);
				}
			//--déplacement
				if(futurY>(aY+(200/diffTaille)+(pX/4)) && aY<((17*c.height/18)-c.height/diffTaille)){
					aY+=4+(difficulte*difficulte);
				}
				if(futurY<(aY+(200/diffTaille)-(pX/4)) && aY>(c.height/18)){
					aY-=4+(difficulte*difficulte);
				}
			}
		}
		//--retour position initiale
		if(speedX>=0 && aY!=Math.ceil((diffTaille-1)*400/(2*diffTaille))){
			if(aY>Math.ceil((diffTaille-1)*400/(2*diffTaille))){
				aY-=4+(difficulte*difficulte);
			}
			if(aY<Math.ceil((diffTaille-1)*400/(2*diffTaille))){
				aY+=4+(difficulte*difficulte);
			}
		}
		
		//Score
		if(pX<0)
		{
			//alert('Le joueur droit gagne !');
			start=0;
			pX=c.width/2;
			pY=c.height/2;
			aY=(diffTaille-1)*c.height/(diffTaille*2);
			bY=3*c.height/8;
			clearInterval(timer);
			scoreB++;
			document.getElementById('scoreB').innerHTML=scoreB;
			if(son==true){
				monSon.src="victoire."+formatSon;
				monSon.play();
			}
		}
		if(pX>c.width)
		{
			//alert('L'ordinateur gagne !');
			start=0;
			pX=c.width/2;
			pY=c.height/2;
			aY=(diffTaille-1)*c.height/(diffTaille*2);
			bY=3*c.height/8;
			clearInterval(timer);
			scoreA++;
			document.getElementById('scoreA').innerHTML=scoreA;
			if(son==true){
				monSon.src="fail."+formatSon;
				monSon.play();
			}
		}
		drawScreen();
	}
	function drawScreen(){
		ctx.fillStyle="#000000";
		ctx.fillRect(0,0,c.width,c.height);
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(2,2,c.width-4,c.height/32);
		ctx.fillRect(2,c.height-2-c.height/32,c.width-4,c.height/32);
		ctx.fillRect((0.25*c.width/10)-c.width/48,aY,c.width/48,c.height/diffTaille);
		ctx.fillRect(9.75*c.width/10,bY,c.width/48,c.height/4);
		ctx.fillStyle= "#AACCFF";
		ctx.beginPath();
		ctx.arc(pX,pY,10,0,Math.PI*2, true); 
		ctx.closePath();
		ctx.fill();
	}
	
	window.addEventListener('keydown',updateSpeed,true); //le keydown permet de rester appuyé sur la touche pour se déplacer plus facilement
	window.addEventListener('keyup',restartSpeed,true); //éviter que des répétitions soient prises en compte
} // fin canvasApp

var difficulte=1, son=true, formatSon='wav';
function choisirSon(e){
	son=!son;
}
function setLevel(e){
	if(e.target.id=="easy"){
		difficulte=0;
	}
	if(e.target.id=="medium"){
		difficulte=1;
	}
	if(e.target.id=="hard"){
		difficulte=2;
	}
	if(navigator.appName=='Microsoft Internet Explorer' && son==true){
		formatSon='mp3';
	}
	document.getElementById("easy").removeEventListener('click',setLevel,false);
	document.getElementById("medium").removeEventListener('click',setLevel,false);
	document.getElementById("hard").removeEventListener('click',setLevel,false);
	document.getElementById("sound").removeEventListener('click',choisirSon,false);
	document.body.removeChild(document.getElementById("dial"));
	var lienRetour=document.createElement("a");
	lienRetour.setAttribute("href","index.html");
	lienRetour.innerHTML="x";
	document.getElementsByTagName("h1")[0].appendChild(lienRetour);
	canvasApp();
}
document.getElementById("easy").addEventListener('click',setLevel,false);
document.getElementById("medium").addEventListener('click',setLevel,false);
document.getElementById("hard").addEventListener('click',setLevel,false);
document.getElementById("sound").addEventListener('click',choisirSon,false);