import { rich } from "./language.js";
import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";

const theme = EditorView.theme({
    "&": {height: "40vh"},
    ".cm-scroller": {overflow: "auto"}
});

window.onload = () => {
    /**
     * @type {HTMLDivElement}
     */
    const input = document.getElementById("textinput");
    /**
     * @type {HTMLButtonElement}
     */
    const lintButton = document.getElementById("lint-button");

    const view = new EditorView({
        state: EditorState.create({ extensions: [basicSetup, rich(), theme, EditorView.lineWrapping] }),
        parent: input
    });

    lintButton.addEventListener("click", () => {
        const innerText = [...view.state.doc].join("\n");
        /*
        const tags = [...innerText.matchAll(/<(\w+)(?:(=)?("|')?(\w+)?("|')?)?>/g)];
        const end = [...innerText.matchAll(/<\/(\w+)>/g)];
        for(const tag of tags) {
            if(tag[4] === undefined) continue;
            if(tag[3] && !tag[5]) return; //insertClass(input, innerText, tag[0], tag.index, "text-error", "Missing ending quote");
            if(tag[5] && !tag[3]) return; //insertClass(input, innerText, tag[0], tag.index, "text-error", "Missing starting quote");
            //no detection if using " or ' and regex stops capturing after either of those
            if(!tag[2]) return; //insertClass(input, innerText, tag[0], tag.index, "text-error", "Missing assignment");
        }
        if(tags.length !== end.length) {
            if(tags.length > end.length) {
                const copy = end.slice();
                for(const tag of tags) {
                    const index = copy.findIndex(endTag => endTag[1] === tag[1]);
                    if(index === -1) {
                        return; //insertClass(input, innerText, tag[0], tag.index, "text-warning", `${tag[1]} is missing closing tag`);
                    }
                    copy.splice(index, 1);
                }
            } else {
                const copy = tags.slice();
                for(const tag of end) {
                    const index = copy.findIndex(startTag => startTag[1] === tag[1]);
                    if(index === -1) {
                        return; //insertClass(input, innerText, tag[0], tag.index, "text-warning", `${tag[1]} is missing starting tag`);
                    }
                    copy.splice(index, 1);
                }
            }
        }*/
    });
};

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
