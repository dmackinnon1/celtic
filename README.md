# celtic
Generator and editors for Celtic Knot patterns.
Please see the live example here: https://dmackinnon1.github.io/celtic.
See these blog posts:
- http://www.mathrecreation.com/2018/09/some-knots-and-not-knots.html
- http://www.mathrecreation.com/2018/09/generating-celtic-knot-patterns.html

The classes for doing various things with the knots are spread over a few js files:
- **celtic_base.js** Basic knot classes.
- **celtic_display.js** Classes for rendering static SVG knot representations.
- **celtic_editor.js** Classes and functions for SVG knot editor.
- **celtic_calc.js** Functions that perform some calculations on the knot (crossing counts, region counts).

Some code for generating static knots below, see index.html for example of editable knot display.

### example 1 - The Trefoil
```{javascript}
//setup the grid, height 3, width 3 (results in x ranging from 0 to 4, y from 0 to 4)
let grid = new Grid(3,3);
grid.initialize();
grid.borders();
//connect nodes on secondary grid
grid.from(1,3).to(3,3);
//use a display object to create an svg
let display =  new RibbonKnotDisplay(grid, 40, 'white', 'darkblue');
let knotDiv = document.getElementById('knot');
knotDiv.innerHTML = display.init().build();
```
![example](https://raw.githubusercontent.com/dmackinnon1/celtic/master/imgs/blue_trefoil.png)

### example 2 - The Figure Eight

```{javascript}
//setup the grid, height 3, width 4 (results in x from 0 to 6, y from 0 to 4)
let grid = new Grid(3,4);
grid.initialize();
grid.borders();
//connect nodes on secondary grid
grid.from(1,1).to(1,3);
grid.from(3,1).to(5,1);
grid.from(3,3).to(5,3);	
//use a display object to create an svg
let display =  new RibbonKnotDisplay(grid, 40, 'lightblue', 'orangered');
let knotDiv = document.getElementById('knot');
knotDiv.innerHTML = display.init().build();
```
![example](https://raw.githubusercontent.com/dmackinnon1/celtic/master/imgs/orange_figure8.png)

### example 3 - A Random Knot Pattern

```{javascript}
//setup the grid, height 10, width 10 (results in x from 0 to 18, y from 0 to 18)
let  grid = new Grid(10,10);
grid.initialize();
grid.borders();
//connect nodes on secondary grid - make a border
grid.from(1,1).to(17,17);
//connect nodes on secondary grid - generate random lines
grid.randomLines();
//use a display object to create an svg
let display =  new RibbonKnotDisplay(grid, 22, 'white', 'black');
let knotDiv = document.getElementById('knot');
knotDiv.innerHTML = display.init().build();
```
![example](https://raw.githubusercontent.com/dmackinnon1/celtic/master/imgs/bigRandom.png)

