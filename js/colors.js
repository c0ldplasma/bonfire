function rgb2hex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function rgb2yiq(r,g,b){
  // matrix transform
	var y = ((0.299 * r) + ( 0.587 * g) + ( 0.114 * b)) / 255;
	var i = ((0.596 * r) + (-0.275 * g) + (-0.321 * b)) / 255;
	var q = ((0.212 * r) + (-0.523 * g) + ( 0.311 * b)) / 255;
  return [y,i,q];
}
function yiq2rgb(y,i,q){
  // matrix transform
	var r = (y + ( 0.956 * i) + ( 0.621 * q)) * 255;
	var g = (y + (-0.272 * i) + (-0.647 * q)) * 255;
	var b = (y + (-1.105 * i) + ( 1.702 * q)) * 255;
  // bounds-checking
	if (r < 0){ r=0; } else if (r > 255){ r = 255};
	if (g < 0){ g=0; } else if (g > 255){ g = 255};
	if (b < 0){ b=0; } else if (b > 255){ b = 255};
  return [r, g, b];
}
function rgb2hsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}
function hsl2rgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}
function colorCorrection(color) {
	//Color contrast correction
	color = hex2rgb(color);
	color = rgb2yiq(color.r, color.g, color.b);
	while ( color[0] < 0.5) {
		color = yiq2rgb(color[0], color[1], color[2]);
		color = rgb2hsl(color[0], color[1], color[2]);
		color[2] = Math.min(Math.max(0, 0.1 + 0.9 * color[2]), 1);
		color = hsl2rgb(color[0], color[1], color[2]);
		color = rgb2yiq(color[0], color[1], color[2]);
	}
	color = color = yiq2rgb(color[0], color[1], color[2]);
	color = rgb2hex(color[0], color[1], color[2]);
	return color.substring(0, 7);
}
function randomColor() {
	var color;
	var col = Math.floor(Math.random()*15);
	switch (col) {
		case 0: color = "#ff0000"; break;
		case 1: color = "#ff4500"; break;
		case 2: color = "#ff69b4"; break;
		case 3: color = "#0000ff"; break;
		case 4: color = "#2e8b57"; break;
		case 5: color = "#8a2be2"; break;
		case 6: color = "#008000"; break;
		case 7: color = "#daa520"; break;
		case 8: color = "#00ff7f"; break;
		case 9: color = "#b22222"; break;
		case 10: color = "#d2691e"; break;
		case 11: color = "#ff7f50"; break;
		case 12: color = "#5f9ea0"; break;
		case 13: color = "#9acd32"; break;
		case 14: color = "#1e90ff"; break;
		default: color = "black"; break;
	}
	return color;
};
