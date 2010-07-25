function keys(ob) {
  var ret=[];

  for(var i in ob) {
    ret.push(i);
  }

  return ret;
}

function split_semicolon(str) {
  var x=str.split(/;/);
  var ret=new Array();

  for(var i=0; i<x.length; i++) {
    if(x[i].substr(0, 1)=="\"") {
      var j=i;
      while(x[j].substr(-1)!="\"")
	j++;
      var y=x.slice(i, j+1).join(";");
      ret.push(y.substr(1, y.length-2));
      i=j;
    }
    else
      ret.push(x[i]);
  }

  return ret;
}

// array_delete removes an element from the array at the pos position
// example:
//   array_remove([ 1, 2, 3, 4, 5 ], 2)
//   -> [ 1, 2, 4, 5 ]
function array_remove(arr, pos) {
  var part1=arr.concat([]);
  var part2=part1.splice(pos+1);
  return part1.splice(0, pos).concat(part2);
}

// source: phpjs.org
function array_merge () {
    // http://kevin.vanzonneveld.net
    // +   original by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Nate
    // +   input by: josh
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: arr1 = {"color": "red", 0: 2, 1: 4}
    // *     example 1: arr2 = {0: "a", 1: "b", "color": "green", "shape": "trapezoid", 2: 4}
    // *     example 1: array_merge(arr1, arr2)
    // *     returns 1: {"color": "green", 0: 2, 1: 4, 2: "a", 3: "b", "shape": "trapezoid", 4: 4}
    // *     example 2: arr1 = []
    // *     example 2: arr2 = {1: "data"}
    // *     example 2: array_merge(arr1, arr2)
    // *     returns 2: {0: "data"}
    
    var args = Array.prototype.slice.call(arguments),
                            retObj = {}, k, j = 0, i = 0, retArr = true;
    
    for (i=0; i < args.length; i++) {
        if (!(args[i] instanceof Array)) {
            retArr=false;
            break;
        }
    }
    
    if (retArr) {
        retArr = [];
        for (i=0; i < args.length; i++) {
            retArr = retArr.concat(args[i]);
        }
        return retArr;
    }
    var ct = 0;
    
    for (i=0, ct=0; i < args.length; i++) {
        if (args[i] instanceof Array) {
            for (j=0; j < args[i].length; j++) {
                retObj[ct++] = args[i][j];
            }
        } else {
            for (k in args[i]) {
                if (args[i].hasOwnProperty(k)) {
                    if (parseInt(k, 10)+'' === k) {
                        retObj[ct++] = args[i][k];
                    } else {
                        retObj[k] = args[i][k];
                    }
                }
            }
        }
    }
    return retObj;
}

function dom_create_append(parent, type, xml) {
  if(!xml)
    xml=document;

  var x=xml.createElement(type);
  parent.appendChild(x);
  return x;
}

function dom_create_append_text(parent, text, xml) {
  if(!xml)
    xml=document;

  var x=xml.createTextNode(text);
  parent.appendChild(x);
  return x;
}
