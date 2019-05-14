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
		this.decorator = null;
	}
	
	setDecorator(d){
		this.decorator = d;
		return this;
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
	isEven(){
		return this.x%2==0;
	}

	isOdd(){
		return !this.isEven();
	}

	isOnSecondary(){
		return (this.x%2==0 && this.y%2 ==0)||(this.x%2==1 && this.y%2 ==1);
	}
}


/*
* Points on the secondary grid play a different role, they 
* have polygons drawn on them and are the connectors for the secondary lines.
*/
class Node extends Point {
	constructor(x,y,grid){
		super(x,y,grid);
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
	
	hasJunction(){
		return this.hasNSJunction() || this.hasEWJunction();
	}

	getOneStepConnected(){
		let connected = [this];
		if (this.north() !== null && this.north().hasNSJunction()){
			connected.push(this.northNorth());
		}
		if (this.south() !== null && this.south().hasNSJunction()){
			connected.push(this.southSouth());
		}
		if (this.east() !== null && this.east().hasEWJunction()){
			connected.push(this.eastEast());
		}
		if (this.west() !== null && this.west().hasEWJunction()){
			connected.push(this.westWest());
		}
		return connected;		
	}

	getFullConnected(){
		let connectedSet = new Set(this.getOneStepConnected());
		let currentSize = connectedSet.size;
		let nextSet = new Set(connectedSet);
		do {
			connectedSet = new Set(nextSet);
			connectedSet.forEach(function(value1, value2, set){
				let others = value2.getOneStepConnected();
				for (let x in others){
					nextSet.add(others[x]);
				}
			});
		} while (nextSet.size != connectedSet.size);
		return nextSet;
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
* A helper class used to draw junctions in scripts.
*/
class JunctionEnd {
	constructor(grid, x, y){
		this.grid = grid;
		this.x = x;
		this.y = y;
	}

	to(otherX, otherY){
		let p1 = new Point(this.x, this.y);
		let p2 = new Point(otherX, otherY);
		this.grid.boxFrame(p1,p2);
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

	//used to draw junctions in scripts
	from(x, y){
		return new JunctionEnd(this, x, y);
	}

	boxFrame(p1, p2){
		let xMax = Math.max(p1.x,p2.x);
		let xMin = Math.min(p1.x,p2.x);
		let yMin = Math.min(p1.y,p2.y);
		let yMax = Math.max(p1.y,p2.y);

		//only form a frame if both frames are same mod 2
		if ((p1.isEven() && p2.isOdd())||(p1.isOdd()&&p2.isEven())){
			return;
		}
		
		for (let i = xMin; i < xMax; i = i+2){			
				let node = this.secondaryGrid[i][yMin];
				if (node == undefined) break;
				if (node.east() == null || node.eastEast() == null) break;
				if (node.east().junctions.length!=0) continue;
				let junction = new Junction(node, node.east(), node.eastEast(), "EW");
				this.junctions.push(junction);
		}
		for (let i = xMin; i < xMax; i = i+2){
				let node = this.secondaryGrid[i][yMax];
				if (node == undefined) break;
				if (node.east() == null || node.eastEast() == null) break;
				if (node.east().junctions.length!=0) continue;			
				let junction = new Junction(node, node.east(), node.eastEast(), "EW");
				this.junctions.push(junction);	
		}
		for (let i = yMin; i < yMax; i = i+2){
				let node = this.secondaryGrid[xMin][i];
				if (node == undefined) break;
				if (node.south() == null || node.southSouth() == null) break;
				if (node.south().junctions.length!=0) continue;		
				let junction = new Junction(node, node.south(), node.southSouth(), "NS");
				this.junctions.push(junction);
		}
		for (let i = yMin; i < yMax ; i = i+2){
				let node = this.secondaryGrid[xMax][i];
				if (node == undefined) break;
				if (node.south() == null || node.southSouth() == null) break;
				if (node.south().junctions.length!=0) continue;	
				let junction = new Junction(node, node.south(), node.southSouth(), "NS");
				this.junctions.push(junction);
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

//randomization utility
function randomInt(lessThan){
	let r = Math.floor(Math.random()*lessThan);
	return r;
};

