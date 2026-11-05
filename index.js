#!/usr/bin/env node
const fs = require('fs');

var celtic = require('./celtic/celtic.js');

/**
 * General utilities
 */

function getTimestamp () {
    const pad = (n,s=2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
    const d = new Date();
    return `${pad(d.getFullYear(),4)}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Utility functions for generating celtic cell signatures
 */

function same(list1, list2) {
    return (list1.sort().join(',')=== list2.sort().join(','));
}

function signature(list){
    let string = "";
    for (let i = 0; i < list.length; i++) {
        string += list[i];;
    }
    return string;
}

function printListOfLists(lists){
    let string = " | ";
    for (let i = 0; i < lists.length; i++) {
        string += lists[i] + " | ";
    }
    return string;
}

function listInListOfLists(list, listOfLists){
    for (let i = 0; i < listOfLists.length; i++){
        let listFromList = listOfLists[i];
        if (same(listFromList, list)){
            return true;
        }
    }
    return false;
}

function coerce(list){
    let numberList=[];
    for (let i = 0; i < list.length; i++){
       numberList.push(parseInt(list[i]));
    }
    return numberList;
}
// shifts a list so that the head is after the tail
function shift(list){
    let toShift = list.slice();
    let popped = toShift.pop();
    toShift.unshift(popped);
    return toShift;
}
// flips all horizontals (1) to verticals (2)
function flip(list){
    let flipped = [];
    for (var i of list){
        if (i===0){
            flipped.push(0)
        } else if (i === 1){
            flipped.push(2);
        } else {
            flipped.push(1);
        }
    }
    return flipped;
}
// rotates a celtic cell signature by shift and flip
function rotate(list){
    return flip(shift(list));
}
// generates all other rotations of a given signature
function allRotations(list){
    let rotations = [];
    let lastRotation = list.slice();
    for (let i = 0; i < 4; i++){
      lastRotation = rotate(lastRotation);
     if (same(lastRotation,list)){
         continue;
     }
        rotations.push(lastRotation);
    }
    return rotations;
}

/**
 * Chapter 1 -- the 15 celtic 2x2 cells
 */

let keep = []; // the signatures to keep
let exclude = []; // the rotated variants

// generate all signatures excluding rotated versions
for (var a in [0,1,2]) {
    for (var b in [0,1,2]) {
        for (var c in [0,1,2]) {
            for (var d in [0,1,2]) {
                let candidate = [a,b,c,d];
                console.log("testing " + candidate);
                let rotations = allRotations(coerce(candidate));
                console.log(" - for " + candidate +" rotations are: " + printListOfLists(rotations));
                let duplicateFound = false;
                for (let i = 0; i < rotations.length; i++){
                    let r = rotations[i];
                    if (listInListOfLists(r, keep)){
                        console.log(" -- for " + candidate + ", found rotation: " + r);
                        duplicateFound=true;
                    }
                }
                if (!duplicateFound && !listInListOfLists(candidate, keep)){
                    keep.push(coerce(candidate));
                }
                /*if (listInListOfLists(candidate, keep)) {
                    continue;
                } else {
                    keep.push(coerce(candidate));
                }
                    for (let i = 0; i < rotations.length; i++){
                    exclude.push(rotations[i]);
                }*/
            }
        }
    }
}

console.log(keep.length)

// generate 2x2 cell from its signature
function twoXtwoLaTeX(fourTuple){
    let grid = new celtic.Grid(3,3);
    grid.initialize();
    grid.borders();
    //connect nodes on secondary grid
    let first = fourTuple[0];
    if (first === 1){
        grid.from(1,1).to(3,1);
    } else if (first === 2){
        grid.from(2,0).to(2,2);
    }
    let second = fourTuple[1];
    if (second === 1){
        grid.from(2,2).to(4,2);
    } else if (second === 2){
        grid.from(3,1).to(3,3);
    }
    let third = fourTuple[2];
    if (third === 1){
        grid.from(1,3).to(3,3);
    } else if (third === 2){
        grid.from(2,2).to(2,4);
    }
    let fourth = fourTuple[3];
    if (fourth === 1){
        grid.from(0,2).to(2,2);
    } else if (fourth === 2){
        grid.from(1,1).to(1,3);
    }
    let knotDisplay = new celtic.PositiveKnotDisplay(grid, 20, 'white', 'darkblue');
    knotDisplay.init();
    return knotDisplay.buildTikZ();
}

console.log("---------------------------");
console.log("Chapter 1: celtic 2x2 cells");
console.log("---------------------------");

//set up folder for files
let folderName = 'ch1_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
}	catch (err) {
    console.error(err);
}

let mainDoc = new celtic.LaTeXDoc();
let mainFile = 'ch1_list.tex';


for( let i = 0; i < keep.length; i++){
    let sig = keep[i];
    let knot = twoXtwoLaTeX(sig);
    let childFile = folderName+"/"+signature(sig)+".tex";
    mainDoc.input(childFile);

    fs.writeFile(childFile, knot, function(err) {
        if(err) {
            return console.log("There was an error" + err);
            console.log("exiting");
            process.exit(1);
        }
    });
}

fs.writeFile(mainFile, mainDoc.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
        process.exit(1);
    }
});

let test =  [1,2,2,2];
console.log("for test: " + test + " rotation: " + rotate(test));