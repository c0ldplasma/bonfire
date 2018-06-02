'use strict';

/**
 * Manages the name color for chatters who never set their name color
 */
class NameColorManager {
    /**
     * @constructor
     */
    constructor() {
        this.userColors_ = {};
    }

    /**
     * @return {Object.<string, string>}
     */
    getUserColors() {
        return this.userColors_;
    }

    /**
     * @param {string} username
     * @param {string} color hex #xxxxxx
     */
    addUserColor(username, color) {
        this.userColors_[username] = color;
    }

    /**
     * Returns a random color of the Twitch standard name colors
     * @return {string} Random color as hex #xxxxxx
     */
    static randomColor() {
        let colorChoices = [
            '#ff0000', '#ff4500',
            '#ff69b4', '#0000ff',
            '#2e8b57', '#8a2be2',
            '#008000', '#daa520',
            '#00ff7f', '#b22222',
            '#d2691e', '#ff7f50',
            '#5f9ea0', '#9acd32',
            '#1e90ff',
        ];
        let randomNumber = Math.floor(Math.random() * colorChoices.length);
        return colorChoices[randomNumber];
    }

    /**
     * Does correct the name color for dark backgrounds, so they are better readable
     * @param {string} hexColor to be corrected as #xxxxxx hex value
     * @return {string} corrected color as #xxxxxx hex value
     */
    static colorCorrection(hexColor) {
        // Color contrast correction
        let rgbColor = NameColorManager.hex2rgb_(hexColor);
        let yiqColor = NameColorManager.rgb2yiq_(rgbColor.r, rgbColor.g, rgbColor.b);
        while (hexColor[0] < 0.5) {
            rgbColor = NameColorManager.yiq2rgb_(yiqColor.y, yiqColor.i, yiqColor.q);
            let hslColor = NameColorManager.rgb2hsl_(rgbColor.r, rgbColor.g, rgbColor.b);
            hslColor.l = Math.min(Math.max(0, 0.1 + 0.9 * hslColor.l), 1);
            rgbColor = NameColorManager.hsl2rgb_(hslColor.h, hslColor.s, hslColor.l);
            yiqColor = NameColorManager.rgb2yiq_(rgbColor.r, rgbColor.g, rgbColor.b);
        }
        rgbColor = NameColorManager.yiq2rgb_(yiqColor.y, yiqColor.i, yiqColor.q);
        hexColor = NameColorManager.rgb2hex_(rgbColor.r, rgbColor.g, rgbColor.b);
        return hexColor.substring(0, 7);
    }

    /**
     * Converts (r,g,b) to #xxxxxx hex color
     * @param {number} r red 0-255
     * @param {number} g green 0-255
     * @param {number} b blue 0-255
     * @return {string} color as #xxxxxx hex value
     * @private
     */
    static rgb2hex_(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Converts a #xxxxxx hex color to a rgb color
     * @param {string} hex color as #xxxxxx hex value
     * @return {{r: number, g: number, b: number}} r, g, b: 0-255
     * @private
     */
    static hex2rgb_(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    }

    /**
     * Converts a rgb color to a yiq color
     * @param {number} r red 0-255
     * @param {number} g green 0-255
     * @param {number} b blue 0-255
     * @return {{y: number, i: number, q: number}} y, i and q between 0.0 and 1.0
     * @private
     */
    static rgb2yiq_(r, g, b) {
        // matrix transform
        let y = ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;
        let i = ((0.596 * r) + (-0.275 * g) + (-0.321 * b)) / 255;
        let q = ((0.212 * r) + (-0.523 * g) + (0.311 * b)) / 255;
        return {
            y: y,
            i: i,
            q: q,
        };
    }

    /**
     * Converts a yiq color to a rgb color
     * @param {number} y luma 0.0-1.0
     * @param {number} i first chrominance 0.0-1.0
     * @param {number} q second chrominance 0.0-1.0
     * @return {{r: number, g: number, b: number}} r, g, b: 0-255
     * @private
     */
    static yiq2rgb_(y, i, q) {
        // matrix transform
        let r = (y + (0.956 * i) + (0.621 * q)) * 255;
        let g = (y + (-0.272 * i) + (-0.647 * q)) * 255;
        let b = (y + (-1.105 * i) + (1.702 * q)) * 255;
        // bounds-checking
        if (r < 0) {
            r = 0;
        } else if (r > 255) {
            r = 255;
        }
        if (g < 0) {
            g = 0;
        } else if (g > 255) {
            g = 255;
        }
        if (b < 0) {
            b = 0;
        } else if (b > 255) {
            b = 255;
        }
        return {
            r: r,
            g: g,
            b: b,
        };
    }

    /**
     * Converts a rgb color to a hsl color
     * @param {number} r red 0-255
     * @param {number} g green 0-255
     * @param {number} b blue 0-255
     * @return {{h: number, s: number, l: number}} h: 0-360, s: 0.0-1.0, l: 0.0-1.0
     * @private
     */
    static rgb2hsl_(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h = (max + min) / 2;
        let s = (max + min) / 2;
        let l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return {
            h: h*360,
            s: s,
            l: l,
        };
    }

    /**
     * Converts an hsl color to a rgb color
     * @param {number} h hue 0-360
     * @param {number} s saturation 0.0-1.0
     * @param {number} l lightness 0.0-1.0
     * @return {{r: number, g: number, b: number}} r, g, b: 0-255
     * @private
     */
    static hsl2rgb_(h, s, l) {
        // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
        if ( h === undefined ) {
            return {
                r: 0,
                g: 0,
                b: 0,
            };
        }

        let chroma = (1 - Math.abs((2 * l) - 1)) * s;
        let huePrime = h / 60;
        let secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

        huePrime = Math.floor(huePrime);
        let red;
        let green;
        let blue;

        if ( huePrime === 0 ) {
            red = chroma;
            green = secondComponent;
            blue = 0;
        } else if ( huePrime === 1 ) {
            red = secondComponent;
            green = chroma;
            blue = 0;
        } else if ( huePrime === 2 ) {
            red = 0;
            green = chroma;
            blue = secondComponent;
        } else if ( huePrime === 3 ) {
            red = 0;
            green = secondComponent;
            blue = chroma;
        } else if ( huePrime === 4 ) {
            red = secondComponent;
            green = 0;
            blue = chroma;
        } else if ( huePrime === 5 ) {
            red = chroma;
            green = 0;
            blue = secondComponent;
        }

        let lightnessAdjustment = l - (chroma / 2);
        red += lightnessAdjustment;
        green += lightnessAdjustment;
        blue += lightnessAdjustment;

        return {
            r: Math.round(red * 255),
            g: Math.round(green * 255),
            b: Math.round(blue * 255),
        };
    }
}
export default NameColorManager;
