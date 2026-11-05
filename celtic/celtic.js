"use strict";
/**
 * Builders to be used for HTML construction.
 *
 */
class Bldr {
    constructor(name) {
        this.name = name;
        this.attributes = [];
        this.elements = [];
    }
    att(name, value) {
        let att = new Attribute(name, value);
        this.attributes.push(att);
        return this;
    }
    // add element allows you to add a builder to a builder
    elem(bldr) {
        this.elements.push(bldr);
        return this;
    }
    text(text) {
        this.elements.push (new RawHtml(text));
        return this;
    }
    build() {
        let s = "<" + this.name;
        for(let i = 0; i< this.attributes.length; i++) {
            s += " " + this.attributes[i].toString();
        }
        s += ">";
        for(let i = 0; i< this.elements.length; i++) {
            s += " " + this.elements[i].build();
        }
        s += "</" + this.name + ">";
        return s;
    }
};

class Attribute {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    toString() {
        return "" + this.name + "='" + this.value + "'";
    }
};

class RawHtml {
    constructor(raw) {
        this.raw = raw;
    }
    build() {
        return this.raw;
    }
};


/**
 * Builders to be used for LaTeX construction.
 *
 */

class LaTeXEnv {

    constructor(l=null){
        this.label = l;
        this.b = null;
        this.content = [];
        this.parent = null;
    }

    begin(tag){
        this.b = tag;
        return this;
    }

    p(text){
        this.content.push(new LaTeXParagraph(text));
        return this;
    }

    env(label){
        let environ = new LaTeXEnv(label);
        this.content.push(environ);
        return environ;
    }

    command(c,a, nl=false){
        this.content.push(new LaTeXCommand(c,a, nl));
        return this;
    }

    build(){
        let result = "";
        if (this.label != null){
            result += "%" + this.label + " \n";
        }
        if (this.b !== null){
            result += "\\begin{" + this.b + "}\n";
        }
        for (let i in this.content){
            result += this.content[i].build();
        }
        if (this.b !== null){
            result += "\\end{" + this.b + "}\n";
        }
        return result;
    }
}

class LaTeXCommand{
    constructor(c, a=null, nl=false){
        this.command = c;
        this.argument = a;
        this.newline = nl;
    }

    build(){
        let result = "\\" + this.command;
        if (this.argument !== null){
            result += "{" + this.argument + "}";
        }
        if (this.newline){
            result +="\n";
        }
        return result;
    }

}

class LaTeXParagraph {
    constructor(t, lb=false){
        this.text = t;
        this.linebreak = lb;
        return this;
    }

    build(){
        let result = ""
        if (this.linebreak){
            result += "\n";
        }
        result += this.text;
        if (this.linebreak){
            result += "\\\\";
            result += "\n ";
        }
        return result;
    }
}

class LaTeXDoc {
    constructor(dc = "article"){
        this.content = [];
        this.packages = [];
        this.documentclass = dc;
    }
    clear(){
        this.content = [];
        this.packages = [];
    }
    env(label){
        let environ = new LaTeXEnv(label);
        this.content.push(environ);
        environ.parent = this;
        return environ;
    }
    p(content, lb=false){
        this.content.push();
        return this;
    }
    command(c,a){
        this.content.push(new LaTeXCommand(c,a));
        return this;
    }

    package(name, arg = null){
        this.packages.push(new LaTeXPackage(name,arg));
        return this;
    }

    defaultPackages(){
        this.package("inputenc","utf8");
        return this;
    }

    frontMatter(){
        let fm = ""; //\\documentclass{" + this.documentclass + "}\n";
        for (let i in this.packages){
            fm += this.packages[i].build() + "\n";
        }
        return fm;
    }

    input(fileName){
        let s = new LaTeXCommand("input", fileName, true);
        this.content.push(s);
        return this;
    }

    build(){
        let result = this.frontMatter();
        for (let i in this.content){
            result += this.content[i].build() + "\n";
        }
        return result;
    }

}
class LaTeXPackage {
    constructor(n, a = null){
        this.name = n;
        this.argument = a;
    }
    build(){
        let result = "\\usepackage";
        if (this.argument != null){
            result += "["+this.argument +"]";
        }
        result += "{" + this.name + "}";
        return result;
    }
}

//for node export
try{
    module.exports = new LaTeXDoc();
} catch(err){
    console.log("non-node execution context");
}

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
        s+= "\\begin{tikzpicture}[framed,background rectangle/.style={ultra thick,draw=black}]\n";
        return s;
    }

    buildClose(){
        let s = "";
        s += "\\end{tikzpicture} \n";
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
        let s = "\\draw [line width=3pt, line cap=round] " + this.start.build() + " -- " + this.end.build() + "; \n"
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

"use strict";
/**
 * Classes and functions in this script file are to provide
 * decorative renderings of knots - dependencies is on celtic_base.celtic and bldrs.celtic.
 *
 *
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

/*
* A helper for drawing SVG lines. Expects two points to connect.
*/
class Line {
    constructor(source, target){
        this.source = source;
        this.target = target;
        this.decorator - null;
    }
    setDecorator(d){
        this.decorator = d;
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
        //console.log(this.buildTikZ());
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

    buildTikZ() {
        this.build();//ToDo: builds unnecessary svg structures
        let tikZ = new TikZBuilder();
        let newScale = this.scale/40; //scaling factor - need to reduce size for tikZ
        for (let n in this.displayData){
            let node = this.displayData[n];
            for (let l in node.lines){
                let secLine = node.lines[l];
                tikZ.addLine(secLine.source.x*newScale,
                    secLine.source.y*newScale,
                    secLine.target.x*newScale,
                    secLine.target.y*newScale);
            }
        }
        return tikZ.build();
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

/**
 * OLD CELTIC CALC FILE
 * Classes and functions in this script file are for
 * performing calculations on knots. Only dependency should
 * be on celtic_base.celtic.
 */

function crossingCount(grid){
    let count = 0;
    for (let p in grid.points){
        let point = grid.points[p];
        if (!point.isOnSecondary() && point.junctions.length == 0){
            count++;
        }
    }
    return count;
};

function setsOverlap(setA,setB){
    let arrayA = Array.from(setA);
    for (let a in arrayA){
        let element = arrayA[a];
        if (setB.has(element)){
            return true;
        }
    }
    return false;
};

function regionCount(grid){
    let regions = [];
    for (let n in grid.nodes){
        let node = grid.nodes[n];
        let newSet = node.getFullConnected();
        let overlap = false;
        for (let r in regions){
            let existingSet = regions[r];
            if (setsOverlap(newSet, existingSet)){
                overlap = true;
                break;
            }
        }
        if (!overlap){
            regions.push(newSet);
        }
    }
    return regions.length;
}
/* Loop count calculation is more involved than crossing
* or region count, and involves a number of classes and
* functions defined below.
*/

/**
 * The function loopCount() creates a PathBuilder which
 * uses the Grid provided to build all paths and count them.
 * It does this by looking at the set of primary points of the
 * grid, and determines the individual "strands" of paths
 * that pass by each Point.
 *
 * A Strand represents a fragment of a Path that exists
 * in the neighbourhood of a primary Grid Point. Strands
 * around a primary grid point are collected in StrandGroups
 * The structure of the Strands around a primary Point is completely
 * determined by the Junctions that go through the primary Point.
 * Once all the StrandGroups are calculated, the individual Strands
 * can be collected together into closed Paths, and the
 * Paths can be counted.
 */

class Strand {
    constructor(end1, end2, group){
        this.ends = [];
        this.ends.push(end1);
        this.ends.push(end2);
        this.group = group;
    }

    toString() {
        let s = "(" + this.group.point.x + ", " + this.group.point.y +")";
        s += "[" + this.ends +"] ";
        return s;
    }

    hasEnd(end){
        for(let e in this.ends){
            if (this.ends[e] === end) {
                return true;
            }
        }
        return false;
    }

    getOtherEnd(end){
        for(let e in this.ends){
            if (this.ends[e] != end) {
                return this.ends[e];
            }
        }
    }
}

class StrandGroup {

    constructor(primaryPoint){
        this.point = primaryPoint;
        this.strands = [];
    }

    toString(){
        let s = "(" + this.point.x + ", " + this.point.y +")";
        s += " {" + this.strands + "} ";
        return s;
    }

    getStrandPair(end){
        let foundStrand = null;
        for (let s in this.strands){
            if (this.strands[s].hasEnd(end)){
                foundStrand = this.strands[s];
                break;
            }
        }
        let pair = [foundStrand, end];
        return pair;
    }

    getStrand(end1, end2){
        for (let s in this.strands){
            let strand = this.strands[s];
            if (strand.hasEnd(end1) && strand.hasEnd(end2)){
                return strand;
            }
        }
        return null;
    }

    calculateStrands(){
        if (this.point.junctions.length === 0){
            this.strands.push(new Strand(0,2, this));
            this.strands.push(new Strand(1,3, this));
        } else if (this.point.hasNSJunction()){
            if (this.point.east() != null){
                this.strands.push(new Strand(1,2, this));
            }
            if (this.point.west() != null){
                this.strands.push(new Strand(0,3, this));
            }
        } else if (this.point.hasEWJunction()){
            if (this.point.north() != null){
                this.strands.push(new Strand(0,1, this));
            }
            if (this.point.south() != null){
                this.strands.push(new Strand(2, 3, this));
            }
        }
    }
}

class PathBuilder {
    constructor(grid){
        this.grid = grid;
        this.allStrands = [];
        this.allPaths = [];
        this.strandGroups = new Map();
    }

    buildAllStrands(){
        this.strandGroups.clear();
        for (let p in this.grid.points){
            let point = this.grid.points[p];
            if (point.isOnSecondary()){
                continue;
            }
            let group = new StrandGroup(point);
            this.strandGroups.set(point,group);
            group.calculateStrands();
            this.allStrands.push.apply(this.allStrands, group.strands);
        }
    }

    isFreshStrand(strand){
        for (let p in this.allPaths){
            let path = this.allPaths[p];
            if (path.contains(strand)){
                return false;
            }
        }
        return true;
    }

    buildAllPaths(){
        let pathIndex = 0;
        for (let s in this.allStrands){
            let strand = this.allStrands[s];
            if (this.isFreshStrand(strand)){
                let p = new Path(strand, this, pathIndex);
                pathIndex ++;
                p.buildPath();
                this.allPaths.push(p);
            }
        }
    }

    getNE(strandGroup){
        return this.strandGroups.get(strandGroup.point.north().east());
    }

    getNW(strandGroup){
        return this.strandGroups.get(strandGroup.point.north().west());
    }

    getSE(strandGroup){
        return this.strandGroups.get(strandGroup.point.south().east());
    }

    getSW(strandGroup){
        return this.strandGroups.get(strandGroup.point.south().west());
    }
}

class Path {
    constructor(start, pathBuilder, i = 0){
        this.startStrand = start;
        this.strands = [this.startStrand];
        this.pathBuilder = pathBuilder;
        this.index = i;
        this.startStrand.index = this.index;
    }

    contains(strand){
        for(let s in this.strands){
            if (this.strands[s] == strand){
                return true;
            }
        }
        return false;
    }

    length(){
        return this.strands.length
    }

    findNextStrand(strand, end){
        if (!strand.hasEnd(end)){
            return null;
        }
        let nextEnd = strand.getOtherEnd(end);
        let targetEnd = 0;
        let nextGroup = null;
        if (nextEnd === 0){
            nextGroup = this.pathBuilder.getNW(strand.group);
            targetEnd = 2;
        } else if (nextEnd === 1){
            nextGroup = this.pathBuilder.getNE(strand.group);
            targetEnd = 3;
        } else if (nextEnd === 2){
            nextGroup = this.pathBuilder.getSE(strand.group);
            targetEnd = 0;
        } else if (nextEnd === 3){
            nextGroup = this.pathBuilder.getSW(strand.group);
            targetEnd = 1;
        }
        return nextGroup.getStrandPair(targetEnd);
    }

    buildPath(){
        let currentStrand = this.startStrand;
        let currentEnd = currentStrand.ends[0]; //pick one end
        while(true){
            let result = this.findNextStrand(currentStrand, currentEnd);

            currentStrand = result[0];
            currentEnd = result[1];
            if (this.contains(currentStrand)){
                break;
            }
            currentStrand.index = this.index;
            this.strands.push(currentStrand);
        }
    }

    totalPathLengths() {
        let pl = 0;
        for (let p in this.allPaths){
            pl += this.allPaths[p].length();
        }
        return pl;
    }

}

function loopCount(grid){
    let pb = new PathBuilder(grid);
    pb.buildAllStrands();
    pb.buildAllPaths();
    return pb.allPaths.length;
}

/**
 * Below is a display type that uses the path calculation.
 */

class PrimaryDisplayData extends DisplayData {
    constructor(){
        super();
        this.lines = [];
        this.circles = [];
        this.crossing = null;
        this.center = [];
        this.rounded = true;
    }

    polyCalc(strandGroup){
        let x = strandGroup.point.x;
        let y = strandGroup.point.y;
        this.center.push(new Point(x, y-(1/4)));
        this.center.push(new Point(x+(1/4), y));
        this.center.push(new Point(x, y+(1/4)));
        this.center.push(new Point(x-(1/4), y));
    }

    lineCalc(strandGroup){
        this.lines = [];
        let x = strandGroup.point.x;
        let y = strandGroup.point.y;
        let strand = strandGroup.getStrand(0,1);
        let d = null;
        if (strand != null) {
            d = new Decorator(strand.index);
            if (!this.rounded){
                this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x+(1/2), y-(1/2))).setDecorator(d));
            } else {
                this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x, y-(1/3))).setDecorator(d));
                this.lines.push(new Line(new Point(x, y-(1/3)),new Point(x+(1/2), y-(1/2))).setDecorator(d));
                this.circles.push(new Point(x,y-(1/3)).setDecorator(d));
            }
            this.circles.push(new Point(x-(1/2),y-(1/2)).setDecorator(d));
            this.circles.push(new Point(x+(1/2),y-(1/2)).setDecorator(d));
        }

        strand = strandGroup.getStrand(0,2);
        if (strand != null) {
            d = new Decorator(strand.index);
            this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x+(1/2), y+(1/2))).setDecorator(d));
            this.circles.push(new Point(x-(1/2),y-(1/2)).setDecorator(d));
            this.circles.push(new Point(x+(1/2),y+(1/2)).setDecorator(d));
            if (strandGroup.point.x % 2 == 0){
                this.crossing = new Line(new Point(x-(1/2), y-(1/2)),new Point(x+(1/2), y+(1/2)));
                this.crossing.setDecorator(d);
            }
        }

        strand = strandGroup.getStrand(1,3);
        if (strand != null) {
            d = new Decorator(strand.index);
            this.lines.push(new Line(new Point(x+(1/2), y-(1/2)),new Point(x-(1/2), y+(1/2))).setDecorator(d));
            this.circles.push(new Point(x+(1/2),y-(1/2)).setDecorator(d));
            this.circles.push(new Point(x-(1/2),y+(1/2)).setDecorator(d));
            if (strandGroup.point.x % 2 == 1){
                this.crossing = new Line(new Point(x+(1/2), y-(1/2)),new Point(x-(1/2), y+(1/2)));
                this.crossing.setDecorator(d);
            }
        }

        strand = strandGroup.getStrand(0,3);
        if (strand != null) {
            d = new Decorator(strand.index);
            if (!this.rounded){
                this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x-(1/2), y+(1/2))).setDecorator(d));
            } else {
                this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x-(1/3), y)).setDecorator(d));
                this.lines.push(new Line(new Point(x-(1/3), y), new Point(x-(1/2), y+(1/2))).setDecorator(d));
                this.circles.push(new Point(x-(1/3),y).setDecorator(d));
            }
            this.circles.push(new Point(x-(1/2),y-(1/2)).setDecorator(d));
            this.circles.push(new Point(x-(1/2),y+(1/2)).setDecorator(d));
        }

        strand = strandGroup.getStrand(1,2);
        if (strand != null) {
            d = new Decorator(strand.index);
            if (!this.rounded){
                this.lines.push(new Line(new Point(x+(1/2), y-(1/2)),new Point(x+(1/2), y+(1/2))).setDecorator(d));
            } else {
                this.lines.push(new Line(new Point(x+(1/2), y-(1/2)),new Point(x+(1/3), y)).setDecorator(d));
                this.lines.push(new Line(new Point(x+(1/3), y), new Point(x+(1/2), y+(1/2))).setDecorator(d));
                this.circles.push(new Point(x+(1/3),y).setDecorator(d));
            }
            this.circles.push(new Point(x+(1/2),y-(1/2)).setDecorator(d));
            this.circles.push(new Point(x+(1/2),y+(1/2)).setDecorator(d));
        }

        strand = strandGroup.getStrand(2,3);
        if (strand != null) {
            d = new Decorator(strand.index);
            if (!this.rounded){
                this.lines.push(new Line(new Point(x+(1/2), y+(1/2)),new Point(x-(1/2), y+(1/2))).setDecorator(d));
            } else {
                this.lines.push(new Line(new Point(x+(1/2), y+(1/2)),new Point(x, y+(1/3))).setDecorator(d));
                this.lines.push(new Line(new Point(x, y+(1/3)), new Point(x-(1/2), y+(1/2))).setDecorator(d));
                this.circles.push(new Point(x,y+(1/3)).setDecorator(d));
            }
            this.circles.push(new Point(x+(1/2),y+(1/2)).setDecorator(d));
            this.circles.push(new Point(x-(1/2),y+(1/2)).setDecorator(d));
        }

    }
}

class Decorator {
    constructor(i){
        this.index = i;
    }
    decorate(){
        //let colors = ['blue','red','pink','lightgreen','green'];
        let colors = ['#a2b9bc', '#b2ad7f','#878f99','#6b5b95','#d6cbd3','#eca1a6','#bdcebe','#82b74b','#405d27'];
        if (interactive.colorPallette != undefined){
            colors = interactive.colorPallette;
        }
        return colors[this.index%colors.length];
    }
}

class PrimaryKnotDisplay extends BasicKnotDisplay {

    buildSVG(){
        this.edge = this.scale/2;
        this.lines();
    }

    newDisplayData(){
        return new PrimaryDisplayData();
    }

    buildStructure(){
        let pb = new PathBuilder(this.g);
        pb.buildAllStrands();
        pb.buildAllPaths();
        let v = pb.strandGroups.values()
        let val = v.next().value;
        while(val !== undefined) {
            let d = this.newDisplayData();
            d.lineCalc(val);
            d.polyCalc(val);
            this.displayData.push(d);
            val = v.next().value;
        }

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
                    .att("stroke-linecap","butt");
                if (secLine.decorator != null){
                    line.att("stroke-width",this.edge).att("stroke", secLine.decorator.decorate());
                } else {
                    line.att("stroke-width",this.edge).att("stroke", this.backgroundColor);
                }
                this.svgBldr.elem(line);
            }
            for (let j in node.circles){
                let joint = node.circles[j];
                let circle = new Bldr("circle").att("cx",joint.x*this.scale)
                    .att("cy", joint.y*this.scale)
                    .att("r", (this.edge/2)*(0.96));
                if (joint.decorator != null){
                    circle.att("fill",joint.decorator.decorate());
                } else {
                    circle.att("fill", this.backgroundColor);
                    //.att("stroke-width",this.edge/3).att("stroke", this.backgroundColor);
                }
                this.svgBldr.elem(circle);
            }
            let xline = node.crossing;
            if (xline != null) {
                let plist = "";
                for (let p in node.center){
                    let point = node.center[p];
                    plist += "" + (point.x*this.scale) + "," +(point.y*this.scale) +" ";
                }

                let crossing1 = new Bldr("polygon").att("points",plist);
                crossing1.att("stroke-width",this.edge/2).att("fill",this.foregroundColor).att("stroke", this.foregroundColor);

                this.svgBldr.elem(crossing1);

                let crossing2 = new Bldr("line").att("x1",xline.source.x*this.scale)
                    .att("y1", xline.source.y*this.scale)
                    .att("x2", xline.target.x*this.scale)
                    .att("y2", xline.target.y*this.scale)
                    .att("stroke-linecap","butt");
                if (xline.decorator != null){
                    let d = xline.decorator;
                    crossing2.att("stroke-width",this.edge).att("fill", d.decorate()).att("stroke", d.decorate());
                } else {
                    crossing2.att("stroke-width",this.edge/2).att("fill",this.foregroundColor).att("stroke", this.foregroundColor);
                }
                this.svgBldr.elem(crossing2);
            }
        }
        return this;
    }
}

let pallettes = {
    'blues':['#011f4b','#03396c','#005b96','#6497b1','#b3cde0'],
    'gryffindor': ['#740001','#ae0001','#eeba30','#d3a625','#000000'],
    'greys':['#999999','#777777','#555555','#333333','#111111'],
    'pinks':['#ff00a9','#fb9f9f','#ff0065','#ffbfd3','#fb5858'],
    'metro':['#d11141','#00b159','#00aedb',	'#f37735','#ffc425'],
    'pastel':['#ffb3ba','#ffdfba','#ffffba','#baffc9','#bae1ff'],
    'ravenclaw': ['#0e1a40','#222f5b','#5d5d5d','#946b2d','#000000'],
    'slytherin':['#1a472a','#2a623d','#5d5d5d','#aaaaaa','#000000'],
    'hufflepuff':['#ecb939','#f0c75e','#726255','#372e29','#000000'],
    'neon' : ['#fe0000','#fdfe02','#0bff01','#011efe','#fe00f6'],
    'seafoam' :['#a3c1ad','#a0d6b4','#5f9ea0','#317873','#49796b']
}

//for node export
try{
    module.exports.Grid = Grid;
    module.exports.PositiveKnotDisplay = PositiveKnotDisplay;
    module.exports.LaTeXDoc = LaTeXDoc;
} catch(err){
    console.log("non-node execution context");
}
