/* Based on https://github.com/lezer-parser/xml */
import { ExternalTokenizer, ContextTracker } from "@lezer/lr";
import { StartTag, StartCloseTag, MissingCloseTag, mismatchedStartCloseTag, incompleteStartCloseTag, OpenTag, Entity } from "./rich.terms.js";

function nameChar(ch) {
    return ch == 45 || ch == 46 || ch == 58 || ch >= 65 && ch <= 90 || ch == 95 || ch >= 97 && ch <= 122 || ch >= 161;
}
  
function isSpace(ch) {
    return ch == 9 || ch == 10 || ch == 13 || ch == 32;
}
  
let cachedName = null, cachedInput = null, cachedPos = 0;
function tagNameAfter(input, offset) {
    const pos = input.pos + offset;
    if (cachedInput == input && cachedPos == pos) return cachedName;
    while (isSpace(input.peek(offset))) offset++;
    let name = "";
    for(;;) {
        let next = input.peek(offset);
        if (!nameChar(next)) break;
        name += String.fromCharCode(next);
        offset++;
    }
    cachedInput = input; cachedPos = pos;
    return cachedName = name || null;
}

function EntityContext(name, parent) {
    this.name = name;
    this.parent = parent;
    this.hash = parent ? parent.hash : 0;
    for (let i = 0; i < name.length; i++) this.hash += (this.hash << 4) + name.charCodeAt(i) + (name.charCodeAt(i) << 8);
}

export const entityContext = new ContextTracker({
    start: null,
    shift(context, term, stack, input) {
        return term == StartTag ? new EntityContext(tagNameAfter(input, 1) || "", context) : context;
    },
    reduce(context, term) {
        return term == Entity && context ? context.parent : context;
    },
    reuse(context, node, _stack, input) {
        let type = node.type.id;
        return type == StartTag || type == OpenTag
            ? new EntityContext(tagNameAfter(input, 1) || "", context) : context;
    },
    hash(context) { return context ? context.hash : 0; },
    strict: false
});

export const startTag = new ExternalTokenizer((input, stack) => {
    if (input.next != 60 /* '<' */) return;
    input.advance();
    if (input.next == 47 /* '/' */) {
        input.advance();
        let name = tagNameAfter(input, 0);
        if (!name) return input.acceptToken(incompleteStartCloseTag);
        if (stack.context && name == stack.context.name) return input.acceptToken(StartCloseTag);
        for (let cx = stack.context; cx; cx = cx.parent) if (cx.name == name) return input.acceptToken(MissingCloseTag, -2);
        input.acceptToken(mismatchedStartCloseTag);
    } else {
        return input.acceptToken(StartTag);
    }
}, {contextual: true});