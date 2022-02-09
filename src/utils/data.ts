/**
 * Data utility
 * Used for converting between datatypes
 *
 * export functions
 *
 * ab2T
 * ab2ascii
 * ascii2ab
 * ascii2hex
 * hex2ascii
 * T2ab
 * T2hex
 */

/**
 * ab2T
 * Convert an arraybuffer that contains JSON encoded data in to a T object 
 * @param {ArrayBuffer} - the binary array buffer
 * @returns {T} - the result object
 */
export function ab2T<T>(data: ArrayBuffer): T {
	return JSON.parse(ab2ascii(data));
}

/**
 * ab2ascii
 * Convert an array buffer to an ascii string
 * @param {ArrayBuffer} data - the byte data
 * @returns {string}
 */
export function ab2ascii(data: ArrayBuffer): string {
	return String.fromCharCode.apply(null, new Uint8Array(data));		
}

/** ascii2ab
 * Convert an ascii string into an array buffer
 * @param {string} ascii - the ascii string
 * @returns {ArrayBuffer} - the byte string
 */
export function ascii2ab(ascii: string): ArrayBuffer {
	let result: ArrayBuffer = new ArrayBuffer(ascii.length);
	let bufView: Uint8Array = new Uint8Array(result);
	ascii.split('').forEach((e,i)=>{bufView[i]=ascii.charCodeAt(i);});
	return result;
}

/**
 * ascii2hex
 * Convert a string into hexidecimal
 * @param {string} str - the string to convert into hexidecimal
 * @returns {string} - the returned value
 */
export function ascii2hex(ascii: string): string {
	let arrayBuffer: ArrayBuffer = ascii2ab(ascii);
	let result: string = Array.prototype.map.call(new Uint8Array(arrayBuffer), x => ('0x'+x.toString(16)).slice(-4)).join(',');
	return result;
}

/**
 * hex2ascii
 * Decodes a hexidecimal string into an ascii string
 * @param {string} hex - The input hexidecmial string
 * @returns {string} - the ascii string
 */
export function hex2ascii(hex: string): string {
	let result: string = hex.split(",").map(e=>String.fromCharCode(parseInt(e))).join("");
	return result;
}

/**
 * T2ab
 * convert a generic object to a byte array buffer
 * @param {T} value - some object
 * @returns {ArrayBuffer} - A buffer of data of JSON encoded data
 */
export function T2ab<T>(value: T): ArrayBuffer {
	return ascii2ab(JSON.stringify(value));
}

/**
 * T2hex
 * convert a value to a hex string
 * @param {T} value - Some datatype
 * @returns {string} - The hexidecimal data type
 */
export function T2hex<T>(value: T): string {
	let jsonString: string = JSON.stringify(value);
	return ascii2hex(jsonString);
}
