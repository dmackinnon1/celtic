"use strict";

/*
* A point on the primary grid.
*/
class Point{
	constructor(x,y,grid){
		this.x = x;
		this.y = y;
		this.grid = grid;
		this.junctions=[];
	}
	distance(point){
		return Math.sqrt(Math.pow((this.x - point.x),2) + Math.pow((this.y - point.y), 2));
	}
	west(){
		if (this.x == 0) return null;
		return this.grid.primaryGrid[this.x-1][this.y]
	}
	east(){
		if (this.x == this.grid.xdim-1) return null;
		return this.grid.primaryGrid[this.x+1][this.y]
	}
	north(){
		if (this.y == 0) return null;
		return this.grid.primaryGrid[this.x][this.y-1]
	}
	south(){
		if (this.y == this.grid.ydim-1) return null;
		return this.grid.primaryGrid[this.x][this.y+1]
	}
	junction(junction){
		this.junctions.push(junction);
	}

	hasNSJunction(){
		if (this.junctions.length == 0) return false;
		for (let j in this.junctions){
			if (this.junctions[j].dir =="NS") return true;
		}
		return false;
	}
	
	hasEWJunction(){
		if (this.junctions.length == 0) return false;
		for (let j in this.junctions){
			if (this.junctions[j].dir =="EW") return true;
		}
		return false;
	}
}

/*
* A helper for drawing SVG lines. Expects two points to connect.
*/
class Line {
	constructor(source, target){
		this.source = source;
		this.target = target;
	}
}

/*
* Points on the secondary grid play a different role, they 
* have polygons drawn on them and are the connectors for the secondary lines.
*/
class Node extends Point {
	constructor(x,y,grid){
		super(x,y,grid);
		this.polygon = [];
		this.lines = [];
		this.polyShape = "plain";
		this.bevel = 1/4;
	}

	plainPolyShape(){
		this.polyShape = "plain";
	}

	stylizedPolyShape(){
		this.polyShape = "stylized";
	}

	standardBevel(){
		this.bevel = 1/4;
	}

	slightBevel(){
		this.bevel = 1/6;
	}

	directionalRelationship(other){
		if (this.x == other.x){
			return "NS";
		}
		if (this.y == other.y){
			return "EW";
		}
		return null;
	}

	isNodeNeighbor(node){
		if (this.distance(node) == 2){
			return true;
		}
		return false;
	}

	isNorthNeighbor(node){
		return (this.isNodeNeighbor(node) && this.y == (node.y+2));
	}

	isSouthNeighbor(node){
		return (this.isNodeNeighbor(node) && this.y == (node.y-2));	
	}

	isEastNeighbor(node){
		return (this.isNodeNeighbor(node) && this.x == (node.x-2));	
	}

	isWestNeighbor(node){
		return (this.isNodeNeighbor(node) && this.x == (node.x+2));	
	}

	northNorth(){
		if (this.north()!= null){
			return this.north().north();
		}
		return null;
	}

	southSouth(){
		if (this.south()!= null){
			return this.south().south();
		}
		return null;
	}
	
	westWest(){
		if (this.west()!= null){
			return this.west().west();
		}
		return null;
	}

	eastEast(){
		if (this.east()!= null){
			return this.east().east();
		}
		return null;
	}

	hasNSJunction(){
		if (this.north() !== null && this.north().hasNSJunction()){
			return true;
		}
		if (this.south() !== null && this.south().hasNSJunction()){
			return true;
		}
		return false;
	}
	
	hasEWJunction(){
		if (this.east() !== null && this.east().hasEWJunction()){
			return true;
		}
		if (this.west() !== null && this.west().hasEWJunction()){
			return true;
		}
		return false;
	}

	polyCalc(){
		if (this.polyShape == "plain"){
			this.plainPolyCalc();
		} else {
			this.stylizedPolyCalc();
		}
	}

	plainPolyCalc(){
		this.polygon = []; //reset polygon
		this.polygon.push(new Point(this.x+(1/2),this.y));
		this.polygon.push(new Point(this.x, this.y+(1/2)));
		this.polygon.push(new Point(this.x-(1/2), this.y));	
		this.polygon.push(new Point(this.x, this.y-(1/2)));
	}

	stylizedPolyCalc(){		
		this.polygon = []; //reset polygon
		let sideCount = 0;
		//north
		if (this.north() != null && !this.north().hasEWJunction()){
			this.polygon.push(new Point(this.x, this.y-(1/2)));				
		} else {
			sideCount ++;
			this.polygon.push(new Point(this.x-this.bevel, this.y -this.bevel ));
			this.polygon.push(new Point(this.x+this.bevel, this.y -this.bevel ));
		}
		//corner
		if(this.north() != null && this.north().hasNSJunction()
			&& this.east() != null && this.east().hasEWJunction()){
			this.polygon.push(new Point(this.x, this.y));
		}
		//east
		if (this.east() != null && !this.east().hasNSJunction()){
			this.polygon.push(new Point(this.x+(1/2), this.y));
		} else {
			sideCount ++;	
			this.polygon.push(new Point(this.x+this.bevel, this.y -this.bevel ));
			this.polygon.push(new Point(this.x+this.bevel, this.y +this.bevel ));
		}
		//corner
		if(this.east() != null && this.east().hasEWJunction()
			&& this.south() != null && this.south().hasNSJunction()){
			this.polygon.push(new Point(this.x, this.y));
		}
		//south
		if (this.south() != null && !this.south().hasEWJunction()){
			this.polygon.push(new Point(this.x, this.y+(1/2)));
		} else {
			sideCount ++;
			this.polygon.push(new Point(this.x+this.bevel, this.y +this.bevel));
			this.polygon.push(new Point(this.x-this.bevel, this.y +this.bevel));	
		}
		//corner	
		if(this.south() != null && this.south().hasNSJunction()
			&& this.west() != null && this.west().hasEWJunction()){
			this.polygon.push(new Point(this.x, this.y));
		}
		//west
		if (this.west() != null && !this.west().hasNSJunction()){
			this.polygon.push(new Point(this.x-(1/2),this.y));
		} else {
			sideCount ++;
			this.polygon.push(new Point(this.x-this.bevel, this.y +this.bevel));
			this.polygon.push(new Point(this.x-this.bevel, this.y -this.bevel));	
		}
		//corner
		if(this.west() != null && this.west().hasEWJunction()
			&& this.north() != null && this.north().hasNSJunction()){
			this.polygon.push(new Point(this.x, this.y));
		}		
		if (sideCount == 4){
			this.polygon = [];
			this.polygon.push(new Point(this.x-1,this.y-1));
			this.polygon.push(new Point(this.x-1,this.y+1));
			this.polygon.push(new Point(this.x+1,this.y+1));
			this.polygon.push(new Point(this.x+1,this.y-1));		
		}
	}

	lineCalc(){
		this.lines = [];
		if (this.x%2==0){			
			if (this.east() != null && this.east().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x+(1/2), this.y), 
					new Point(this.x+1, this.y-(1/2))));
			}
			if (this.south() != null && this.south().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x, this.y+(1/2)), 
					new Point(this.x+(1/2), this.y +1)));	
			}
			if (this.west() != null && this.west().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x-(1/2), this.y), 
					new Point(this.x-1, this.y +(1/2))));	
			}
			if (this.north() != null && this.north().junctions.length == 0) {
				this.lines.push(new Line(new Point(this.x, this.y-(1/2)), 
					new Point(this.x-(1/2), this.y-1)));	
			}
		} else {
			if (this.east() != null && this.east().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x+(1/2), this.y), 
					new Point(this.x+1, this.y +(1/2))));
			}
			if (this.south() != null && this.south().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x, this.y+(1/2)), 
					new Point(this.x-(1/2), this.y +1)));
			}
			if (this.west() !== null && this.west().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x-(1/2), this.y), 
					new Point(this.x-1, this.y -(1/2))));	
			}
			if (this.north() != null && this.north().junctions.length == 0) {
				this.lines.push(new Line(new Point(this.x, this.y-(1/2)), 
					new Point(this.x+(1/2), this.y-1)));	
			}
		}
	}
}

/*
* A connector between two secondary nodes, passes through
* a primary node.
*/
class Junction {
	constructor(sourceNode, medianPoint, targetNode, dir){
		this.sourceNode = sourceNode;
		this.targetNode = targetNode;
		this.medianPoint = medianPoint;	
		this.dir = dir;
		medianPoint.junction(this);
	}
}

/*
* The main class for the knot - consists of 
* primary and secondary grids of points and knots, and junctions
* between them.
*/
class Grid {
	constructor(ydim, xdim){
		this.ydim = 2*ydim - 1;
		this.xdim = 2*xdim - 1;
		this.primaryGrid = [];
		this.secondaryGrid = [];
		this.nodes = [];
		this.points = [];
		this.junctions = [];
	}

	plainPolyShape(){
		for (let n in this.nodes){
			this.nodes[n].plainPolyShape();
		}
		return this;
	}

	stylizedPolyShape(){
		for (let n in this.nodes){
			this.nodes[n].stylizedPolyShape();
		}
		return this;
	}

	randomPolyShape(){
		for(let n in this.nodes){
			let r = randomInt(2);
			let node = this.nodes[n];
			if (r == 0){
				node.stylizedPolyShape();
			} else {
				node.plainPolyShape();
			}
		}
		return this;
	}

	slightBevel(){
		for (let n in this.nodes){
			this.nodes[n].slightBevel();
		}
		return this;	
	}

	standardBevel(){
		for (let n in this.nodes){
			this.nodes[n].standardBevel();
		}
		return this;	
	}

	calc(){
		for (let n in this.nodes){
			this.nodes[n].polyCalc();
			this.nodes[n].lineCalc();
		}
	}
	
	initialize(){
		//set up points
		for (let i = 0; i < this.xdim; i++){
			this.primaryGrid[i] = []
			this.secondaryGrid[i] = [];
			for (let j= 0; j < this.ydim; j++){
				let p = new Point(i,j, this);
				this.primaryGrid[i][j] = p;
				this.points.push(p)
				if ((i%2==0 && j%2 ==0)||(i%2==1 && j%2 ==1)){
					let n = new Node(i,j, this);
					this.nodes.push(n);
					this.secondaryGrid[i][j] = n;
					this.primaryGrid[i][j] = n
				}
			}
		}
		return this;
	}

	boxFrame(p1, p2){
		let xMax = Math.max(p1.x,p2.x);
		let xMin = Math.min(p1.x,p2.x);
		let yMin = Math.min(p1.y,p2.y);
		let yMax = Math.max(p1.y,p2.y);

		for (let i = xMin; i < xMax; i++){
			
			if (i%2==0){	
				let node = this.secondaryGrid[i][yMin];
				if (node.east() == null || node.eastEast() == null) break;
				if (node.east().junctions.length!=0) continue;
				let junction = new Junction(node, node.east(), node.eastEast(), "EW");
				this.junctions.push(junction);
			}
		}
		for (let i = xMin; i < xMax; i++){
			if (i%2==0){	
				let node = this.secondaryGrid[i][yMax];
				if (node.east() == null || node.eastEast() == null) break;
				if (node.east().junctions.length!=0) continue;			
				let junction = new Junction(node, node.east(), node.eastEast(), "EW");
				this.junctions.push(junction);
			}
		}
		for (let i = yMin; i < yMax; i++){
			if (i%2==0){	
				let node = this.secondaryGrid[xMin][i];
				if (node.south() == null || node.southSouth() == null) break;
				if (node.south().junctions.length!=0) continue;		
				let junction = new Junction(node, node.south(), node.southSouth(), "NS");
				this.junctions.push(junction);
			}
		}
		for (let i = yMin; i < yMax ; i++){
			if (i%2==0){	
				let node = this.primaryGrid[xMax][i];
				if (node == undefined) break;
				if (node.south() == null || node.southSouth() == null) break;
				if (node.south().junctions.length!=0) continue;	
				let junction = new Junction(node, node.south(), node.southSouth(), "NS");
				this.junctions.push(junction);
			}
		}
		return this;
	}

	borders(){
		return this.boxFrame(new Point(0,0), new Point(this.xdim-1, this.ydim-1));
	}
	
	innerFrame(step){
		return this.boxFrame(new Point(2*step,2*step), new Point(this.xdim-(2*step +1), this.ydim-(2*step + 1)));
	}

	nodeAt(x,y){
		return this.secondaryGrid[x][y];
	}

	pointAt(x,y){
		return this.primaryGrid[x][y];
	}

	removeJunctionAt(i,j){
		let selected = this.pointAt(i,j);
		if (i == this.xdim -1 || j == this.ydim -1 || i == 0 || j == 0){
			return;
		}
		if (selected.junctions.length == 0){
			return;
		}
		for (let k in selected.junctions){
			let jr = selected.junctions[k];
			this.junctions.splice(this.junctions.indexOf(jr),1);
		}
		selected.junctions = [];
		this.calc();
	}

	randomLines(probability = 50){
		//random lines
		for (let n in this.nodes){
			let node = this.nodes[n];
			let junction = null;
 			if (randomInt(100) > probability) continue;
			let r = randomInt(4);
			if (r == 0) {
				if (node.south() != null && node.southSouth() != null) {
					if (node.south().junctions.length==0){
						junction = new Junction(node, node.south(), node.southSouth(), "NS");
						this.junctions.push(junction);
					} else {
						this.removeJunctionAt(node.south().x, node.south().y);
					}
				}
			} else if (r == 1){
				if (node.east() != null && node.eastEast() != null){
					if (node.east().junctions.length==0){
						junction = new Junction(node, node.east(), node.eastEast(), "EW");
						this.junctions.push(junction);	
					} else {
						this.removeJunctionAt(node.east().x, node.east().y);		
					}	
				}		
			} else if (r == 2){
				if (node.north() != null && node.northNorth() != null && node.north().junctions.length==0){
					junction = new Junction(node, node.north(), node.northNorth(),"NS");
					this.junctions.push(junction);
				}				
			} else {
				if (node.west() != null && node.westWest() != null && node.west().junctions.length==0){
					junction = new Junction(node, node.west(), node.westWest(),"EW");
					this.junctions.push(junction);
				}
			}								
		}
		return this;
	}
}

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
		this.edge = scale/8;
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

	wideGaps(){
		this.edge = this.scale/8;
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
					.att("stroke-width",this.edge).att("fill","black").att("stroke", this.backgroundColor)
					.att("stroke-linecap","round");
				this.svgBldr.elem(line);
			}
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
				this.source = other;
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
interactive.style = curvy;

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
		interactive.display.innerHTML = 
			interactive.knot.init().junctions().nodes().lines().build();
	}
}


/**
* Randomization Utilities
*/

function randomInt(lessThan){
	let r = Math.floor(Math.random()*lessThan);
	return r;
};
