"use strict";

/*
* KnotDisplay classes provide different ways of displaying 
* the knot defined by a Grid object. They use DisplayData objects
* to store display information about the grid before generating
* svg representations.
* 
* KnotDisplay - just shows the raw primary and secondary grid
* and any junctions between secondary grid points.
*
* BasicKnotDisplay & DisplayData - draws a primitive knot pattern using the
* 'negative space' algorithm, which makes secondary points into
* gaps between the knot bands and draws gaps where the bands
* overlap.
*
* BeveledKnotDisplay & BeveledDisplayData - follows the 
* 'negative space' algorithm but truncates the polygons drawn at 
* secondary points so that the knot bands appear to bend.
*
* PositiveKnotDisplay PositiveDisplayData- folllows the 'positive space' 
* algorithm, drawing lines and circles between the secondary points.
*
* RibbonKnotDisplay - adds multiple layers of thhe 'positive space'
* algorithm.
*/
class KnotDisplay {
	
	constructor(g, scale,foreground = "white", background = "black"){
		this.g = g;
		this.scale = scale;
		this.foregroundColor = foreground;
		this.backgroundColor = background;
		this.edge = scale/8;
		this.junctionMultiplier = 2; 	
	}

	init(){
		let height = (this.g.ydim-1)*this.scale;
		let width = (this.g.xdim -1)*this.scale;
		this.svgBldr = new Bldr("svg");
		this.svgBldr.att("version", "1.1").att("xmlns", "http://www.w3.org/2000/svg").att("xmlns:xlink", "http://www.w3.org/1999/xlink");
		this.svgBldr.att("align", "center").att("width", width).att("height", height);
		this.svgBldr.elem(new Bldr("rect").att("width", width).att("height",height).att("fill",this.foregroundColor));
		return this; 
	}

	build(){
		this.buildStructure();
		this.buildSVG();
		return this.svgBldr.build();
	}

	buildStructure(){
		//no calculation required
	}

	buildSVG(){
		this.junctions();
		this.secondaryGrid();
		this.primaryGrid();

	}
	
	primaryGrid(){
		for (let p in this.g.points){
			let point = this.g.points[p];
			let dot = new Bldr("circle").att("cx",point.x*this.scale).att("cy", point.y*this.scale);
			dot.att("r",this.scale/8).att("stroke-width",0).att("fill","grey");
			this.svgBldr.elem(dot);
		}
		return this; 
	}

	secondaryGrid(){
		for (let p in this.g.nodes){
			let point = this.g.nodes[p];
			let dot = new Bldr("circle").att("cx",point.x*this.scale).att("cy", point.y*this.scale);
			dot.att("r",this.scale/4).att("stroke-width",this.scale/8).att("fill",this.backgroundColor);
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
}

class DisplayData {
	constructor(){
		this.lines = [];
		this.polygon = [];
	}

	polyCalc(node){
		this.polygon = []; //reset polygon
		this.polygon.push(new Point(node.x+(1/2),node.y));
		this.polygon.push(new Point(node.x, node.y+(1/2)));
		this.polygon.push(new Point(node.x-(1/2), node.y));	
		this.polygon.push(new Point(node.x, node.y-(1/2)));
	}

	lineCalc(node){
		this.lines = [];
		if (node.x%2==0){			
			if (node.east() != null && node.east().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x+(1/2), node.y), 
					new Point(node.x+1, node.y-(1/2))));
			}
			if (node.south() != null && node.south().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x, node.y+(1/2)), 
					new Point(node.x+(1/2), node.y +1)));	
			}
			if (node.west() != null && node.west().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x-(1/2), node.y), 
					new Point(node.x-1, node.y +(1/2))));	
			}
			if (node.north() != null && node.north().junctions.length == 0) {
				this.lines.push(new Line(new Point(node.x, node.y-(1/2)), 
					new Point(node.x-(1/2), node.y-1)));	
			}
		} else {
			if (node.east() != null && node.east().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x+(1/2), node.y), 
					new Point(node.x+1, node.y +(1/2))));
			}
			if (node.south() != null && node.south().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x, node.y+(1/2)), 
					new Point(node.x-(1/2), node.y +1)));
			}
			if (node.west() !== null && node.west().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x-(1/2), node.y), 
					new Point(node.x-1, node.y -(1/2))));	
			}
			if (node.north() != null && node.north().junctions.length == 0) {
				this.lines.push(new Line(new Point(node.x, node.y-(1/2)), 
					new Point(node.x+(1/2), node.y-1)));	
			}
		}
	}
}

class BasicKnotDisplay extends KnotDisplay {
	constructor(g, scale,foreground = "white", background = "black"){
		super(g, scale, foreground, background);
		this.displayData = [];
	}

	newDisplayData(){
		return new DisplayData();
	}

	buildStructure(){
		for(let n in this.g.nodes){
			let node = this.g.nodes[n];
			let d = this.newDisplayData();
			d.polyCalc(node);
			d.lineCalc(node);
			this.displayData.push(d);	
		}
	}
	
	buildSVG(){
		this.nodes();
		this.junctions();
		this.lines();
	}
	
	nodes(){
		for (let n in this.displayData){
			let node = this.displayData[n];
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
		for (let n in this.displayData){
			let node = this.displayData[n];
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
		}
		return this;		
	}	
}

class BeveledDisplayData extends DisplayData {

	constructor(){
		super();
		this.bevel = 1/4;
	}

	polyCalc(node){		
		this.polygon = []; //reset polygon
		let sideCount = 0;
		//north
		if (node.north() != null && !node.north().hasEWJunction()){
			this.polygon.push(new Point(node.x, node.y - (1/2)));				
		} else {
			sideCount ++;
			this.polygon.push(new Point(node.x - this.bevel, node.y - this.bevel ));
			this.polygon.push(new Point(node.x + this.bevel, node.y - this.bevel ));
		}
		//corner
		if(node.north() != null && node.north().hasNSJunction()
			&& node.east() != null && node.east().hasEWJunction()){
			this.polygon.push(new Point(node.x, node.y));
		}
		//east
		if (node.east() != null && !node.east().hasNSJunction()){
			this.polygon.push(new Point(node.x + (1/2), node.y));
		} else {
			sideCount ++;	
			this.polygon.push(new Point(node.x + this.bevel, node.y - this.bevel ));
			this.polygon.push(new Point(node.x + this.bevel, node.y + this.bevel ));
		}
		//corner
		if(node.east() != null && node.east().hasEWJunction()
			&& node.south() != null && node.south().hasNSJunction()){
			this.polygon.push(new Point(node.x, node.y));
		}
		//south
		if (node.south() != null && !node.south().hasEWJunction()){
			this.polygon.push(new Point(node.x, node.y+(1/2)));
		} else {
			sideCount ++;
			this.polygon.push(new Point(node.x + this.bevel, node.y + this.bevel));
			this.polygon.push(new Point(node.x - this.bevel, node.y + this.bevel));
		}
		//corner	
		if(node.south() != null && node.south().hasNSJunction()
			&& node.west() != null && node.west().hasEWJunction()){
			this.polygon.push(new Point(node.x, node.y));
		}
		//west
		if (node.west() != null && !node.west().hasNSJunction()){
			this.polygon.push(new Point(node.x - (1/2), node.y));
		} else {
			sideCount ++;
			this.polygon.push(new Point(node.x - this.bevel, node.y + this.bevel));
			this.polygon.push(new Point(node.x - this.bevel, node.y - this.bevel));			
		}
		//corner
		if(node.west() != null && node.west().hasEWJunction()
			&& node.north() != null && node.north().hasNSJunction()){
			this.polygon.push(new Point(node.x, node.y));
		}		
		if (sideCount == 4){
			this.polygon = [];
			this.polygon.push(new Point(node.x-1,node.y-1));
			this.polygon.push(new Point(node.x-1,node.y+1));
			this.polygon.push(new Point(node.x+1,node.y+1));
			this.polygon.push(new Point(node.x+1,node.y-1));		
		} 
	}


}

class BeveledKnotDisplay extends BasicKnotDisplay {

	newDisplayData(){
		return new BeveledDisplayData();
	}
}
	
class PositiveDisplayData extends DisplayData {
	constructor(){
		super();
		this.circles = [];
	}

	polyCalc(node){
		//do nothing
	}

	lineCalc(node){
		this.lines = [];
		if (node.x%2==0){						
			if (node.east() != null && node.east().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x+1, node.y), 
					new Point(node.x+(1/2), node.y+(1/2))));
			} else if (node.east() != null && node.east().junctions.length != 0 && node.east().hasNSJunction()){				
				this.lines.push(new Line(new Point(node.x+(1/2), node.y -(1/2)), 
					new Point(node.x+(1/2), node.y+(1/2))));
				this.circles.push(new Point(node.x+(1/2), node.y -(1/2)));
				this.circles.push(new Point(node.x+(1/2), node.y+(1/2)));
				if(node.south() != null && node.south().junctions.length == 0){
					this.lines.push(new Line(new Point(node.x+(1/2), node.y+(1/2)), 
						new Point(node.x+(1/4), node.y+(3/4))));
					}					
			}
			if (node.south() != null && node.south().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x, node.y+1), 
					new Point(node.x-(1/2), node.y +(1/2))));	
			} else if (node.south() != null && node.south().junctions.length != 0 && node.south().hasEWJunction()){
				this.lines.push(new Line(new Point(node.x +(1/2), node.y+(1/2)), 
					new Point(node.x-(1/2), node.y +(1/2))));
				this.circles.push(new Point(node.x +(1/2), node.y+(1/2)));
				this.circles.push(new Point(node.x-(1/2), node.y +(1/2)));					
				if (node.west() != null && node.west().junctions.length ==0){
					this.lines.push(new Line( new Point(node.x-(1/2), node.y +(1/2)),
						new Point(node.x -(3/4), node.y+(1/4))));
				}
			}
			if (node.west() != null && node.west().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x-1, node.y), 
					new Point(node.x-(1/2), node.y - (1/2))));	
			} else if (node.west() != null && node.west().junctions.length != 0 && node.west().hasNSJunction()) {
				this.lines.push(new Line(new Point(node.x-(1/2), node.y +(1/2)), 
					new Point(node.x-(1/2), node.y - (1/2))));
				this.circles.push(new Point(node.x-(1/2), node.y +(1/2)));
				this.circles.push(new Point(node.x-(1/2), node.y - (1/2)));
				if (node.north!=null && node.north().junctions.length == 0){
					this.lines.push(new Line(new Point(node.x-(1/2), node.y - (1/2)), 
						new Point(node.x-(1/4), node.y - (3/4))));					
				}
			}
			if (node.north() != null && node.north().junctions.length == 0) {
				this.lines.push(new Line(new Point(node.x, node.y-1), 
					new Point(node.x+(1/2), node.y-(1/2))));	
			} else if (node.north() != null && node.north().junctions.length != 0 && node.north().hasEWJunction()){
				this.lines.push(new Line(new Point(node.x-(1/2), node.y-(1/2)), 
					new Point(node.x+(1/2), node.y-(1/2))));
				this.circles.push(new Point(node.x-(1/2), node.y -(1/2)));
				this.circles.push(new Point(node.x+(1/2), node.y - (1/2)));				
				if (node.east()!=null && node.east().junctions.length==0){
					this.lines.push(new Line(new Point(node.x+(1/2), node.y-(1/2)), 
						new Point(node.x+(3/4), node.y-(1/4))));
				}
			}			
		} else { 
			if (node.east() != null && node.east().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x+1, node.y), 
					new Point(node.x+(1/2), node.y-(1/2))));
				this.circles.push(new Point(node.x+(1/2), node.y -(1/2)));			
				if (node.north()!=null && node.north().junctions.length == 0){
					this.lines.push(new Line(new Point(node.x+(1/2), node.y -(1/2)), 
						new Point(node.x+(1/4), node.y-(3/4))));
				}
			} else if (node.east() != null && node.east().junctions.length != 0 && node.east().hasNSJunction()){				
				this.lines.push(new Line(new Point(node.x+(1/2), node.y -(1/2)), 
					new Point(node.x+(1/2), node.y+(1/2))));
				this.circles.push(new Point(node.x+(1/2), node.y -(1/2)));
				this.circles.push(new Point(node.x+(1/2), node.y +(1/2)));							
				if (node.north() != null && node.north().junctions.length == 0){
					this.lines.push(new Line(new Point(node.x+(1/2), node.y -(1/2)), 
						new Point(node.x+(1/4), node.y-(3/4))));					
				}	
			}
			if (node.south() != null && node.south().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x, node.y+1), 
					new Point(node.x+(1/2), node.y +(1/2))));
				this.circles.push(new Point(node.x+(1/2), node.y +(1/2)));				
				if (node.east()!= null && node.east().junctions.length == 0){
					this.lines.push(new Line(new Point(node.x+(1/2), node.y +(1/2)), 
						new Point(node.x+(3/4), node.y +(1/4))));
				}
			} else if (node.south() != null && node.south().junctions.length != 0 && node.south().hasEWJunction()){
				this.lines.push(new Line(new Point(node.x +(1/2), node.y+(1/2)), 
					new Point(node.x-(1/2), node.y +(1/2))));
				this.circles.push(new Point(node.x+(1/2), node.y +(1/2)));
				this.circles.push(new Point(node.x-(1/2), node.y +(1/2)));
				if (node.east() != null && node.east().junctions.length ==0){
					this.lines.push(new Line(new Point(node.x +(1/2), node.y+(1/2)), 
						new Point(node.x+(3/4), node.y +(1/4))));
				}
			}
			if (node.west() != null && node.west().junctions.length == 0){
				this.lines.push(new Line(new Point(node.x-1, node.y), 
					new Point(node.x-(1/2), node.y + (1/2))));	
				this.circles.push(new Point(node.x-(1/2), node.y +(1/2)));		
				if (node.south()!=null && node.south().junctions.length ==0){
					this.lines.push(new Line(new Point(node.x-(1/2), node.y+(1/2)), 
						new Point(node.x-(1/4), node.y +(3/4))));
				}
			} else if (node.west() != null && node.west().junctions.length != 0 && node.west().hasNSJunction()) {
				this.lines.push(new Line(new Point(node.x-(1/2), node.y +(1/2)), 
					new Point(node.x-(1/2), node.y - (1/2))));
				this.circles.push(new Point(node.x-(1/2), node.y+(1/2)));
				this.circles.push(new Point(node.x-(1/2), node.y-(1/2)));
				if(node.south() !=null && node.south().junctions.length == 0){
					this.lines.push(new Line(new Point(node.x-(1/2), node.y +(1/2)), 
						new Point(node.x-(1/4), node.y + (3/4))));							
				}
			}
			if (node.north() != null && node.north().junctions.length == 0) {
				this.lines.push(new Line(new Point(node.x, node.y-1), 
					new Point(node.x-(1/2), node.y-(1/2))));
				this.circles.push(new Point(node.x-(1/2), node.y -(1/2)));			
				if (node.west()!=null && node.west().junctions.length == 0){
					this.lines.push(new Line(new Point(node.x-(1/2), node.y-(1/2)), 
						new Point(node.x-(3/4), node.y-(1/4))));				
				}	
			} else if (node.north() != null && node.north().junctions.length != 0 && node.north().hasEWJunction()){
				this.lines.push(new Line(new Point(node.x-(1/2), node.y-(1/2)), 
					new Point(node.x+(1/2), node.y-(1/2))));
				this.circles.push(new Point(node.x-(1/2), node.y -(1/2)));
				this.circles.push(new Point(node.x+(1/2), node.y -(1/2)));				
				if (node.west()!= null && node.west().junctions.length ==0){
					this.lines.push(new Line(new Point(node.x-(1/2), node.y-(1/2)), 
						new Point(node.x-(3/4), node.y-(1/4))));								
				}
			}
		}
	}
}

class PositiveKnotDisplay extends BasicKnotDisplay {

	buildSVG(){
		this.edge = this.scale/2;
		this.lines();
	}

	newDisplayData(){
		return new PositiveDisplayData();
	}

	lines(){
		for (let n in this.displayData){
			let node = this.displayData[n];
			for (let l in node.lines){
				let secLine = node.lines[l];		
				let line = new Bldr("line").att("x1",secLine.source.x*this.scale)
					.att("y1", secLine.source.y*this.scale)
					.att("x2", secLine.target.x*this.scale)
					.att("y2", secLine.target.y*this.scale)
					.att("stroke-width",this.edge).att("stroke", this.backgroundColor)
					.att("stroke-linecap","butt");
				this.svgBldr.elem(line);
			}
			for (let j in node.circles){
				let joint = node.circles[j];		
				let circle = new Bldr("circle").att("cx",joint.x*this.scale)
					.att("cy", joint.y*this.scale)
					.att("r", (this.edge/2)*(0.95))
					.att("fill", this.backgroundColor);
					//.att("stroke-width",this.edge/3).att("stroke", this.backgroundColor);
				this.svgBldr.elem(circle);
			}
		}
		return this;		
	}	
}

class RibbonKnotDisplay extends PositiveKnotDisplay {

	buildSVG(){
		super.buildSVG();
		this.stripeLines(this.edge/3, this.foregroundColor);

	}

	stripeLines(width, color){
		for (let n in this.displayData){
			let node = this.displayData[n];
			for (let l in node.lines){
				let secLine = node.lines[l];		
				let line = new Bldr("line").att("x1",secLine.source.x*this.scale)
					.att("y1", secLine.source.y*this.scale)
					.att("x2", secLine.target.x*this.scale)
					.att("y2", secLine.target.y*this.scale)
					.att("stroke-width",width).att("stroke", color)
					.att("stroke-linecap","butt");
				this.svgBldr.elem(line);
			}
			for (let j in node.circles){
				let joint = node.circles[j];		
				let circle = new Bldr("circle").att("cx",joint.x*this.scale)
					.att("cy", joint.y*this.scale)
					.att("r", width/2)
					.att("fill", color);
				this.svgBldr.elem(circle);
			}
		}
		return this;		
	}
}
