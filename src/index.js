import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";

window.onload = () => {
    /**
     * @type {HTMLDivElement}
     */
    const input = document.getElementById("textinput");
    /**
     * @type {HTMLButtonElement}
     */
    const lintButton = document.getElementById("lint-button");

    input.addEventListener("paste", ev => {
        const paste = (ev.clipboardData || window.clipboardData).getData("text");
        insertNode(escapeHTML(paste).replace(/\n(.+)?/g, "<div>$1</div>"));
        ev.preventDefault();
    });

    input.addEventListener("focus", () => {
        if(input.querySelector(".text-error, .text-warning")) {
            input.innerHTML = escapeHTML(input.innerText).replace(/\n(.+)?/g, "<div>$1</div>");
            const range = document.caretPositionFromPoint()
        }
    });
    input.addEventListener("keydown", ev => {
        if(ev.ctrlKey || ev.altKey || ev.metaKey) return;
        if(ev.key === "Tab") {
            ev.preventDefault();
            insertText("\u00A0\u00A0\u00A0\u00A0");
        }
    });

    lintButton.addEventListener("click", () => {
        const innerText = input.innerText;
        const tags = [...innerText.matchAll(/<(\w+)(?:(=)?("|')?(\w+)?("|')?)?>/g)];
        const end = [...innerText.matchAll(/<\/(\w+)>/g)];
        for(const tag of tags) {
            if(tag[4] === undefined) continue;
            if(tag[3] && !tag[5]) return insertClass(input, innerText, tag[0], tag.index, "text-error", "Missing ending quote");
            if(tag[5] && !tag[3]) return insertClass(input, innerText, tag[0], tag.index, "text-error", "Missing starting quote");
            //no detection if using " or ' and regex stops capturing after either of those
            if(!tag[2]) return insertClass(input, innerText, tag[0], tag.index, "text-error", "Missing assignment");
        }
        if(tags.length !== end.length) {
            if(tags.length > end.length) {
                const copy = end.slice();
                for(const tag of tags) {
                    const index = copy.findIndex(endTag => endTag[1] === tag[1]);
                    if(index === -1) {
                        return insertClass(input, innerText, tag[0], tag.index, "text-warning", `${tag[1]} is missing closing tag`);
                    }
                    copy.splice(index, 1);
                }
            } else {
                const copy = tags.slice();
                for(const tag of end) {
                    const index = copy.findIndex(startTag => startTag[1] === tag[1]);
                    if(index === -1) {
                        return insertClass(input, innerText, tag[0], tag.index, "text-warning", `${tag[1]} is missing starting tag`);
                    }
                    copy.splice(index, 1);
                }
            }
        }
    });
};

/**
 * Insert text into class
 * @param {Element} el
 * @param {string} orStr
 * @param {string} substr
 * @param {number} index
 * @param {string} cssClass
 * @param {string} title
 */
function insertClass(el, orStr, substr, index, cssClass, title) {
    const span = document.createElement("span");
    span.classList.add(cssClass);
    span.title = title;
    span.textContent = substr;
    const replaced = escapeHTML(orStr.substring(0, index)) + span.outerHTML + escapeHTML(orStr.substring(index + substr.length));
    el.innerHTML = replaced.replace(/\n(.+)?/g, "<div>$1</div>");
}//q bien

function insertText(input) {
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const text = document.createTextNode(input);
    range.insertNode(text);

    range.setStart(text, text.length);
    range.setEnd(text, text.length);
    sel.removeAllRanges();
    sel.addRange(range);
}

function insertNode(html) {
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const frag = range.createContextualFragment(html);
    range.insertNode(frag);
    range.collapse(false);
}

function escapeHTML(unsafe) {
    return unsafe.replace(/[&<"']/g, function(m) {
        switch (m) {
        case "&":
            return "&amp;";
        case "<":
            return "&lt;";
        case "\"":
            return "&quot;";
        default:
            return "&#039;";
        }
    });
}
  
