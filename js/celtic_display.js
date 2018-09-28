"use strict";

"use strict";
/*
* Builder for SVG representation of the grid pattern.
* To create an SVG of the finsihed knot
* > new KnotSVG(g,scale).init().nodes().junctions().lines().build();
*
*/
class KnotSVG {
	constructor(g, scale){
		this.g = g;
		this.scale = scale;
		this.edge = scale/8; //scale/8
		this.svgBldr = null;
		this.backgroundColor = "black";
		this.foregroundColor = "white";
		this.junctionMultiplier = 2;
	}

	chunkyStyle(){
		this.g.stylizedPolyShape();
		this.g.standardBevel();
		this.g.calc();
		this.wideGaps();
		return this;
	}

	curvyStyle(){
		this.g.stylizedPolyShape();
		this.g.slightBevel();
		this.g.calc();
		this.narrowGaps();
		return this;
	}

	blockyStyle(){
		this.g.plainPolyShape();
		this.g.calc();
		this.wideGaps();
		return this;
	}

	narrowGaps(){
		this.edge = this.scale/16;
		return this;
	}

	smoothedLines(){
		this.g.smoothedLines();
		this.g.calc();
		return this;
	}

	style2Gaps(){
		this.edge = this.scale/5; //8
		return this;
	}

	wideGaps(){
		this.edge = this.scale/8; //8
		return this;
	}

	setBackground(color){
		this.backgroundColor = color;
		return this; 
	}

	setForeground(color){
		this.foregroundColor = color;
		return this;
	}

	init(){
		let height = (this.g.ydim-1)*this.scale;
		let width = (this.g.xdim -1)*this.scale;
		this.g.calc();
		this.svgBldr = new Bldr("svg");
		this.svgBldr.att("version", "1.1").att("xmlns", "http://www.w3.org/2000/svg").att("xmlns:xlink", "http://www.w3.org/1999/xlink");
		this.svgBldr.att("align", "center").att("width", width).att("height", height);
		this.svgBldr.elem(new Bldr("rect").att("width", width).att("height",height).att("fill",this.foregroundColor));
		return this;
	}

	nodes(){
		for (let n in this.g.nodes){
			let node = this.g.nodes[n];
			let plist = "";
			for (let p in node.polygon){
				let point = node.polygon[p];
				plist += "" + (point.x*this.scale) + "," +(point.y*this.scale) +" ";
			}
			let dot = new Bldr("polygon").att("points",plist);
			dot.att("stroke-width",this.edge).att("fill",this.backgroundColor).att("stroke", this.backgroundColor);
			this.svgBldr.elem(dot);
		}
		return this;
	}

	nodeAt(x,y){
		let node = this.g.nodeAt(x,y);
		let plist = "";
			for (let p in node.polygon){
				let point = node.polygon[p];
				plist += "" + (point.x*this.scale) + "," +(point.y*this.scale) +" ";
			}
			let dot = new Bldr("polygon").att("points",plist);
			dot.att("stroke-width",this.edge).att("fill",this.backgroundColor).att("stroke", this.backgroundColor);
			this.svgBldr.elem(dot);
		return this;
	}

	junctions(){
		for (let j in this.g.junctions){
			let junction = this.g.junctions[j];
			let line = new Bldr("line").att("x1", junction.sourceNode.x*this.scale).att("y1", junction.sourceNode.y*this.scale)
				.att("x2", junction.targetNode.x*this.scale).att("y2", junction.targetNode.y*this.scale);
			line.att("stroke-width",this.edge*this.junctionMultiplier).att("stroke", this.backgroundColor)
				.att("stroke-linecap","round");
			this.svgBldr.elem(line);
		}
		return this;
	}

	lines(){
		for (let n in this.g.nodes){
			let node = this.g.nodes[n];
			for (let l in node.lines){
				let secLine = node.lines[l];		
				let line = new Bldr("line").att("x1",secLine.source.x*this.scale)
					.att("y1", secLine.source.y*this.scale)
					.att("x2", secLine.target.x*this.scale)
					.att("y2", secLine.target.y*this.scale)
					.att("stroke-width",this.edge*1.1).att("stroke", this.backgroundColor)
					.att("stroke-linecap","round");
				this.svgBldr.elem(line);
			}
			for (let l in node.additionals){
				let secLine = node.additionals[l];		
				let line = new Bldr("line").att("x1",secLine.source.x*this.scale)
					.att("y1", secLine.source.y*this.scale)
					.att("x2", secLine.target.x*this.scale)
					.att("y2", secLine.target.y*this.scale)
					.att("stroke-width",this.edge*3).att("stroke", this.backgroundColor)
					.att("stroke-linecap","round");
				this.svgBldr.elem(line);	
			}
		}
		return this;		
	}

	centerLines(){
		for (let n in this.g.nodes){
			let node = this.g.nodes[n];
			for (let l in node.centerLines){
				let secLine = node.centerLines[l];		
				let line = new Bldr("line").att("x1",secLine.source.x*this.scale)
					.att("y1", secLine.source.y*this.scale)
					.att("x2", secLine.target.x*this.scale)
					.att("y2", secLine.target.y*this.scale)
					.att("stroke-width",this.edge*2.5).att("stroke", this.backgroundColor)
					.att("stroke-linecap","butt");
				this.svgBldr.elem(line);
			}
			for (let j in node.joints){
				let joint = node.joints[j];		
				let circle = new Bldr("circle").att("cx",joint.x*this.scale)
					.att("cy", joint.y*this.scale)
					.att("r", this.edge)
					.att("fill", this.backgroundColor)
					.att("stroke-width",this.edge/3).att("stroke", this.backgroundColor);
				this.svgBldr.elem(circle);
			}
		}
		return this;		
	}
	
	
	linesAt(x,y){	
			let node = this.g.nodeAt(x,y);
			for (let l in node.lines){
				let secLine = node.lines[l];		
				let line = new Bldr("line").att("x1",secLine.source.x*this.scale)
					.att("y1", secLine.source.y*this.scale)
					.att("x2", secLine.target.x*this.scale)
					.att("y2", secLine.target.y*this.scale)
					.att("stroke-width",this.edge).att("fill","black").att("stroke", this.backgroundColor)
					.att("stroke-linecap","round");
				this.svgBldr.elem(line);
		}
		return this;		
	}


	build(){
		return this.svgBldr.build();
	}
} 

/* The EditKnotSVG class allows primary and secondary nodes
 * to be displayed and used to edit the junctions.
 */
class EditKnotSVG extends KnotSVG{
	
	constructor(g, scale){
		super(g, scale);
		this.source = null;
	}
	
	primaryDots(){
		for (let p in this.g.points){
			let point = this.g.points[p];
			let dot = new Bldr("circle").att("cx",point.x*this.scale).att("cy", point.y*this.scale);
			dot.att("onclick", "primaryClick(event)");
			dot.att("onmouseover","primaryMouseOver(event)");
      		dot.att("onmouseout","primaryMouseOut(event)");
      		dot.att("data_x",point.x);
      		dot.att("data_y", point.y);			
			dot.att("r",this.scale/8).att("stroke-width",0).att("fill","grey");
			this.svgBldr.elem(dot);
		}
		return this; 
	}

	secondaryDots(){
		for (let p in this.g.nodes){
			let point = this.g.nodes[p];
			let dot = new Bldr("circle").att("cx",point.x*this.scale).att("cy", point.y*this.scale);
			dot.att("r",this.scale/4).att("stroke-width",this.scale/8).att("fill",this.backgroundColor);
			dot.att("onclick", "secondaryClick(event)");
			dot.att("onmouseover","secondaryMouseOver(event)");
      		dot.att("onmouseout","secondaryMouseOut(event)");
      		dot.att("data_x",point.x);
      		dot.att("data_y", point.y);
			this.svgBldr.elem(dot);
		}
		return this; 
	}

	removeJunctionAt(i,j){
		this.g.removeJunctionAt(i,j);
		refreshInteractive();
	}

	setSourceOrTarget(i,j){
		let other = this.g.nodeAt(i,j);
		if (this.source == null){
			this.source = other;
		} else {
			let j = null;
			if (this.source.isWestNeighbor(other) && other.east().junctions.length == 0){
					j = new Junction(this.source, other.east(), other, "EW");
			} else if (this.source.isEastNeighbor(other) && other.west().junctions.length == 0){
				j = new Junction(this.source, other.west(), other, "EW");
			} else if (this.source.isNorthNeighbor(other) && other.south().junctions.length == 0){
				j = new Junction(this.source, other.south(), other, "NS");
			} else if(this.source.isSouthNeighbor(other)&& other.north().junctions.length == 0){
				j = new Junction(this.source, other.north(), other, "NS");
			} else{
				//this.source = other;
				this.g.boxFrame(this.source, other);
				this.source = null;
				this.g.calc();
				refreshInteractive();
			}
			if (j != null){
				this.source = null;
				this.g.junctions.push(j);
				this.g.calc();
				refreshInteractive();
			}
		}
	}

}

//functions and singleton to accompany EditableKnotSVG
let interactive = {};
interactive.mode = 'show'; // edit or show
interactive.style = angle;
interactive.format = 'negative'; // positive | negative

function block(){
	interactive.knot.blockyStyle();
}
function angle(){
	interactive.knot.chunkyStyle();
}
function curvy(){
	interactive.knot.curvyStyle();
}
interactive.style = angle;

function applyStyle(){
	interactive.style();
}

function secondaryClick(event){
	let dot = event.srcElement;
	interactive.knot.setSourceOrTarget(
		dot.getAttribute("data_x"),
		dot.getAttribute("data_y"));
};

function primaryClick(event){
	let dot = event.srcElement;
	interactive.knot.removeJunctionAt(
		dot.getAttribute("data_x"),
		dot.getAttribute("data_y"));
};

function secondaryMouseOver(event){
	event.srcElement.setAttribute('opacity', '0.5');
};

function secondaryMouseOut(event){
	event.srcElement.setAttribute('opacity', '1');
};

function primaryMouseOver(event){
	event.srcElement.setAttribute('opacity', '0.5');
};

function primaryMouseOut(event){
	event.srcElement.setAttribute('opacity', '1');
};



function refreshInteractive(){
	if (interactive.mode == 'edit'){
		interactive.display.innerHTML = 
			interactive.knot.init().junctions().primaryDots().secondaryDots().build();			
	} else {
		if (interactive.format == 'positive'){
			interactive.display.innerHTML = 
				interactive.knot.init().style2Gaps().centerLines().build();
		} else {
			interactive.display.innerHTML = 
				interactive.knot.init().junctions().nodes().lines().build();
				//interactive.knot.init().smoothedLines().junctions().nodes().lines().build();
		}
	}
}


/**
* Randomization Utilities
*/

function randomInt(lessThan){
	let r = Math.floor(Math.random()*lessThan);
	return r;
};
