# celtic
A generator for celtic knot patterns.

## example 1
```{javascript}
let grid = new Grid(18,10);
grid.initialize().borders().innerFrame(2).randomLines(20);
let svg = new KnotSVG(grid, 20).curvyStyle().setBackground("cyan").setForeground("darkgreen");
$(document).ready(function(){
	let knot = document.getElementById('knot');
	knot.innerHTML = svg.init().nodes().junctions().lines().build();
});
```
![example](https://raw.githubusercontent.com/dmackinnon1/celtic/master/imgs/green2.png)

## example 2

```{javascript}
let grid = new Grid(6,5);
grid.initialize().borders().innerFrame(2).randomLines(20);
let svg = new KnotSVG(grid, 40).chunkyStyle();
$(document).ready(function(){
	let knot = document.getElementById('knot');
	knot.innerHTML = svg.init().nodes().junctions().lines().build();
});
```
![example](https://raw.githubusercontent.com/dmackinnon1/celtic/master/imgs/sample.png)

