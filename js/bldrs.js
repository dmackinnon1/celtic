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
