"use strict";

class TikZBuilder {

	constructor(){
		this.components = [];
	}

	build(){
		let s = this.buildOpen();

		for(let c in this.components) {
			s += " " + this.components[c].build();
		}

		s += this.buildClose();
		return s;
	}

	buildOpen(){
		let s = "";
		s +=  "\\begin{figure}[!h] \n";
		s += "\\centering \n";
		s+= "\\begin{tikzpicture} \n";
		return s;
	}

	buildClose(){
		let s = "";
		s += "\\end{tikzpicture} \n";
		s +=  "\\end{figure} \n";		
		return s;
	}

	addLine(x1, y1, x2, y2){
		let start = new TikZPoint(x1, y1);
		let end = new TikZPoint(x2,y2);
		this.components.push(new TikZLine(start,end));
	}
}

class TikZComponent {

	constructor(){
		this.body = "";
	}

	build(){
		return this.body;
	}
}

class TikZLine extends TikZComponent {

	constructor(s, e){
		super();
		this.start = s;
		this.end = e;
	}

	build(){
		let s = "\\draw [ultra thick] " + this.start.build() + " -- " + this.end.build() + "; \n"
		return s;
	}
}

class TikZPoint {
	constructor(x,y){
		this.x = x;
		this.y = y;
	}

	build(){
		return "(" + this.x + "," + this.y + ")";
	}

}