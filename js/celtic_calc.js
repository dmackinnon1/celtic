"use strict";
/**
* Classes and functions in this script file are for
* performing calculations on knots. Only dependency should
* be on celtic_base.js.
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
