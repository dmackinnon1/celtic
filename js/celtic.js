'use strict'

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

//TODO: these junction methods may be used to refine the polygon
//shape - to remove or use...
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

	//TODO: refine this to draw more detailed polygons based
	// on the neighboring junctions.
	polyCalc(){
		this.polygon.push(new Point(this.x+(1/2),this.y));
		this.polygon.push(new Point(this.x, this.y+(1/2)));
		this.polygon.push(new Point(this.x-(1/2), this.y));	
		this.polygon.push(new Point(this.x, this.y-(1/2)));
	}

	lineCalc(){
		if (this.x%2==0){
			
			if (this.east() != null && this.east().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x+(1/2), this.y), new Point(this.x+(3/2), this.y +1)));
			}
			if (this.south() != null && this.south().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x, this.y+(1/2)), new Point(this.x-(1/2), this.y +1)));	
			}
			if (this.west() != null && this.west().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x-(1/2), this.y), new Point(this.x-(3/2), this.y -1)));	
			}
			if (this.north() != null && this.north().junctions.length == 0) {
				this.lines.push(new Line(new Point(this.x, this.y-(1/2)), new Point(this.x+(1/2), this.y-1)));	
			}
		} else {
			if (this.east() != null && this.east().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x+(1/2), this.y), new Point(this.x+(3/2), this.y -1)));
			}
			if (this.south() != null && this.south().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x, this.y+(1/2)), new Point(this.x+1, this.y +(3/2))));
			}
			if (this.west() !== null && this.west().junctions.length == 0){
				this.lines.push(new Line(new Point(this.x-(1/2), this.y), new Point(this.x-(3/2), this.y +1)));	
			}
			if (this.north() != null && this.north().junctions.length == 0) {
				this.lines.push(new Line(new Point(this.x, this.y-(1/2)), new Point(this.x-(1/2), this.y-1)));	
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
		this.ydim = ydim + 1;
		this.xdim = xdim + 1;
		this.primaryGrid = [];
		this.secondaryGrid = [];
		this.nodes = [];
		this.points = [];
		this.junctions = [];
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

	borders(){
		for (let i = 0; i < this.xdim -1; i++){
			
			if (i%2==0){	
				let node = this.secondaryGrid[i][0];
				if (node.east() == null || node.eastEast() == null) break;
				let junction = new Junction(node, node.east(), node.eastEast(), "EW");
				this.junctions.push(junction);
			}
		}
		for (let i = 0; i < this.xdim -1; i++){
			if (i%2==0){	
				let node = this.secondaryGrid[i][this.ydim-1];
				if (node == undefined) break
				if (node.east() == null || node.eastEast() == null) break;
				let junction = new Junction(node, node.east(), node.eastEast(), "EW");
				this.junctions.push(junction);
			}
		}
		for (let i = 0; i < this.ydim -1; i++){
			if (i%2==0){	
				let node = this.secondaryGrid[0][i];
				if (node.south() == null || node.southSouth() == null) break;
				let junction = new Junction(node, node.south(), node.southSouth(), "NS");
				this.junctions.push(junction);
			}
		}
		for (let i = 0; i < this.ydim -1; i++){
			if (i%2==0){	
				let node = this.primaryGrid[this.xdim-1][i];
				if (node == undefined) break;
				if (node.south() == null || node.southSouth() == null) break;
				let junction = new Junction(node, node.south(), node.southSouth(), "NS");
				this.junctions.push(junction);
			}
		}
		return this;
	}

	randomLines(){
		//random lines
		for (let n in this.nodes){
			let node = this.nodes[n];
			let junction = null;
 			if (randomInt(10) < 5) continue;
			let r = randomInt(4);
			if (r == 0) {
				if (node.south() != null && node.southSouth() != null && node.south().junctions.length==0) {
					junction = new Junction(node, node.south(), node.southSouth(), "NS");
					this.junctions.push(junction);
				}
			} else if (r == 1){
				if (node.east() != null && node.eastEast() != null && node.east().junctions.length==0){
					junction = new Junction(node, node.east(), node.eastEast(), "EW");
					this.junctions.push(junction);		
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
		g.calc();
		this.edge = scale/8;
		this.svgBldr = null;
	}

	init(){
		let height = (this.g.ydim-1)*this.scale;
		let width = (this.g.xdim -1)*this.scale;
		this.svgBldr = new Bldr("svg");
		this.svgBldr.att("align", "center").att("width", width).att("height", height);
		return this;
	}

	primaryDots(){
		for (let p in this.g.points){
			let point = this.g.points[p];
			let dot = new Bldr("circle").att("cx",point.x*this.scale).att("cy", point.y*this.scale);
			dot.att("r",this.edge).att("stroke-width",0).att("fill","grey");
			this.svgBldr.elem(dot);
		}
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
			dot.att("stroke-width",this.edge).att("fill","black").att("stroke", "black");
			this.svgBldr.elem(dot);
		}
		return this;
	}

	junctions(){
		for (let j in this.g.junctions){
			let junction = this.g.junctions[j];
			let line = new Bldr("line").att("x1", junction.sourceNode.x*this.scale).att("y1", junction.sourceNode.y*this.scale)
				.att("x2", junction.targetNode.x*this.scale).att("y2", junction.targetNode.y*this.scale);
			line.att().att("stroke-width",this.edge).att("stroke", "black");
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
					.att("stroke-width",this.edge).att("fill","black").att("stroke", "black");
				this.svgBldr.elem(line);
			}
		}
		return this;		
	}

	build(){
		return this.svgBldr.build();
	}
} 

/**
* Randomization Utilities
*/

function randomInt(lessThan){
	let r = Math.floor(Math.random()*lessThan);
	return r;
};
