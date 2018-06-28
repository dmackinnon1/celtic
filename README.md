# celtic
A generator for celtic knot patterns.

```{javascript}
let grid = new Grid(4,10);
grid.initialize().borders().randomLines();
let svg = new KnotSVG(grid, 40);
$(document).ready(function(){
	let knot = document.getElementById('knot');
	knot.innerHTML = svg.init().nodes().junctions().lines().build();
});
```
![example](https://raw.githubusercontent.com/dmackinnon1/celtic/master/imgs/sample.png)


