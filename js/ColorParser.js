var ColorParser = function() {

}

ColorParser.prototype = {
    constructor: ColorParser,
    parse: function(str) {
        // console.log(str);
        var lines = str.split('\n');
        var cs = [];
        for (var i = 0; i < lines.length; i++) {
			var value = parseFloat(lines[i]);
			if (!isNaN(value)) {
				cs.push(value);
			}
        }
        return cs;
    }
}
