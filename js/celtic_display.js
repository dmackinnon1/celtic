"use strict";

/*
* KnotDisplay classes provide different ways of displaying 
* the knot defined by a Grid object.
* 
* KnotDisplay - just shows the raw primary and secondary grid
* and any junctions between secondary grid points.
*
* BasicKnotDisplay - draws a primitive knot pattern using the
* 'negative space' algorithm, which makes secondary points into
* gaps between the knot bands and draws gaps where the bands
* overlap.
*
* BeveledKnotDisplay - follows the 'negative space' algorithm
* but truncates the polygons drawn at secondary points so that
* the knot bands appear to bend.
*
* PositiveKnotDisplay - folllows the 'positive space' algorithm,
* drawing lines and joints between the secondary points.
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
		this.g.calc();
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

class BasicKnotDisplay extends KnotDisplay {
	constructor(g, scale,foreground = "white", background = "black"){
		super(g, scale, foreground, background);
	}

	buildSVG(){
		this.nodes();
		this.junctions();
		this.lines();
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
					.att("stroke-width",this.edge*1.1).att("stroke", this.backgroundColor)
					.att("stroke-linecap","round");
				this.svgBldr.elem(line);
			}
		}
		return this;		
	}	
}

class BeveledKnotDisplay extends BasicKnotDisplay {

	buildStructure(){
		this.g.standardBevel();
		this.g.stylizedPolyShape();
		this.g.calc();
	}
}
	
class PositiveKnotDisplay extends BasicKnotDisplay {

	buildSVG(){
		this.edge = this.scale/2;
		this.centerLines();
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
					.att("stroke-width",this.edge).att("stroke", this.backgroundColor)
					.att("stroke-linecap","butt");
				this.svgBldr.elem(line);
			}
			for (let j in node.joints){
				let joint = node.joints[j];		
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
		//this.stripeLines(this.edge*(2/3), this.foregroundColor);
		this.stripeLines(this.edge/3, this.foregroundColor);

	}

	stripeLines(width, color){
		for (let n in this.g.nodes){
			let node = this.g.nodes[n];
			for (let l in node.centerLines){
				let secLine = node.centerLines[l];		
				let line = new Bldr("line").att("x1",secLine.source.x*this.scale)
					.att("y1", secLine.source.y*this.scale)
					.att("x2", secLine.target.x*this.scale)
					.att("y2", secLine.target.y*this.scale)
					.att("stroke-width",width).att("stroke", color)
					.att("stroke-linecap","butt");
				this.svgBldr.elem(line);
			}
			for (let j in node.joints){
				let joint = node.joints[j];		
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
