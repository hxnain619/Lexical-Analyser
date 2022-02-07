"use strict";

class Lexer {
	constructor() {
		this.pos = 0;
		this.code = null;
		this.code_length = 0;

		// Operator table, mapping operator -> token name
		this.opt_table = {
			"+": "PLUS",
			"-": "MINUS",
			"*": "MULTIPLY",
			".": "PERIOD",
			"\\": "BACKSLASH",
			":": "COLON",
			"%": "PERCENT",
			"|": "PIPE",
			"!": "EXCLAMATION",
			"?": "QUESTION",
			"#": "POUND",
			"&": "AMPERSAND",
			";": "SEMI",
			",": "COMMA",
			"(": "L_PAREN",
			")": "R_PAREN",
			"<": "L_ANG",
			">": "R_ANG",
			"{": "L_BRACE",
			"}": "R_BRACE",
			"[": "L_BRACKET",
			"]": "R_BRACKET",
			"=": "EQUALS",
		};
	}
	// Initialize the Lexer's codefer. This resets the lexer's internal
	// state and subsequent tokens will be returned starting with the
	// beginning of the new codefer.
	input(code) {
		this.pos = 0;
		this.code = code;
		this.code_length = code.length;
	}
	// Get the next token from the current codefer. A token is an object with
	// the following properties:
	// - name: name of the pattern that this token matched (taken from rules).
	// - value: actual string value of the token.
	// - pos: offset in the current codefer where the token starts.
	//
	// If there are no more tokens in the codefer, returns null. In case of
	// an error throws Error.
	token() {
		this._skipnontokens();
		if (this.pos >= this.code_length) {
			return null;
		}

		// The char at this.pos is part of a real token. Figure out which.
		const c = this.code.charAt(this.pos);

		// '/' is treated specially, because it starts a comment if followed by
		// another '/'. If not followed by another '/', it's the DIVIDE
		// operator.
		if (c === "/") {
			const next_c = this.code.charAt(this.pos + 1);
			return next_c === "/"
				? this._process_comment()
				: { name: "DIVIDE", value: "/", pos: this.pos++ };
		}
		// Look it up in the table of operators
		const operator = this.opt_table[c];
		if (operator !== undefined) {
			return { name: operator, value: c, pos: this.pos++ };
		}
		// Not an operator - so it's the beginning of another token.
		if (Lexer._isAlphabet(c)) {
			return this._process_identifier();
		}
		if (Lexer._isDigit(c)) {
			return this._process_number();
		}
		if (c === '"') {
			return this._process_quote();
		}
		throw Error(`Token error at ${this.pos}`);
	}
	_process_number() {
		let endpos = this.pos + 1;
		while (
			endpos < this.code_length &&
			Lexer._isDigit(this.code.charAt(endpos))
		) {
			endpos++;
		}

		const tok = {
			name: "NUMBER",
			value: this.code.substring(this.pos, endpos),
			pos: this.pos,
		};
		this.pos = endpos;
		return tok;
	}
	_process_comment() {
		let endpos = this.pos + 2;
		// Skip until the end of the line
		const c = this.code.charAt(this.pos + 2);
		while (
			endpos < this.code_length &&
			!Lexer._isnewline(this.code.charAt(c))
		) {
			endpos++;
		}

		const tok = {
			name: "COMMENT",
			value: this.code.substring(this.pos, endpos),
			pos: this.pos,
		};
		this.pos = endpos + 1;
		return tok;
	}
	_process_identifier() {
		let endpos = this.pos + 1;
		while (
			endpos < this.code_length &&
			Lexer._isAlphaNum(this.code.charAt(endpos))
		) {
			endpos++;
		}

		const tok = {
			name: "IDENTIFIER",
			value: this.code.substring(this.pos, endpos),
			pos: this.pos,
		};
		this.pos = endpos;
		return tok;
	}
	_process_quote() {
		// this.pos points at the opening quote. Find the ending quote.
		const end_index = this.code.indexOf('"', this.pos + 1);

		if (end_index === -1) {
			throw Error(`Unterminated quote at ${this.pos}`);
		} else {
			const tok = {
				name: "QUOTE",
				value: this.code.substring(this.pos, end_index + 1),
				pos: this.pos,
			};
			this.pos = end_index + 1;
			return tok;
		}
	}
	_skipnontokens() {
		while (this.pos < this.code_length) {
			const c = this.code.charAt(this.pos);
			if (c == " " || c == "\t" || Lexer._isnewline(c)) {
				this.pos++;
			} else {
				break;
			}
		}
	}
	static _isnewline(c) {
		return c === "\r" || c === "\n";
	}
	static _isDigit(c) {
		return c >= "0" && c <= "9";
	}
	static _isAlphabet(c) {
		return (
			(c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_" || c === "$"
		);
	}
	static _isAlphaNum(c) {
		return (
			(c >= "a" && c <= "z") ||
			(c >= "A" && c <= "Z") ||
			(c >= "0" && c <= "9") ||
			c === "_" ||
			c === "$"
		);
	}
}

const newLex = new Lexer();
const code = `
    let i = 0;
    for(let i < 10; i++){
        console.log(i)
    }
`;

newLex.input(code);

while (newLex.token() !== null) {
	console.log(newLex.token());
}
