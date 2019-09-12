"use strict";
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
		let fm = "\\documentclass{" + this.documentclass + "}\n";
		for (let i in this.packages){
			fm += this.packages[i].build() + "\n";
		}
		return fm;
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