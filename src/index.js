import { rich } from "./language.js";
import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";
import { Compartment } from "@codemirror/state";


const theme = new Compartment();

const supportedColors = ["black", "blue", "green", "orange", "purple", "red", "white", "yellow"];

window.onload = () => {
    /**
     * @type {HTMLDivElement}
     */
    const input = document.getElementById("textinput");
    /**
     * @type {HTMLButtonElement}
     */
    const lintButton = document.getElementById("lint-button");
    const output = document.getElementById("output");

    const darkmode = matchMedia("(prefers-color-scheme: dark)");

    const view = new EditorView({
        state: EditorState.create({ extensions: [basicSetup, rich(), theme.of(EditorView.theme({
            "&": {
                height: "40vh",
                backgroundColor: darkmode.matches ? "#24292e" : "inherit"
            },
            ".cm-scroller": {overflow: "auto"}
        }, { dark: darkmode.matches })), EditorView.lineWrapping] }),
        parent: input
    });

    const updateDarkMode = ev => {
        view.dispatch({
            effects: theme.reconfigure(theme.of(EditorView.theme({
                "&": {
                    height: "40vh",
                    backgroundColor: ev.matches ? "#24292e" : "inherit"
                },
                ".cm-scroller": {overflow: "auto"}
            }, { dark: ev.matches })))
        });
    };
    if(darkmode.addEventListener) {
        darkmode.addEventListener("change", updateDarkMode);
    } else {
        darkmode.addListener(updateDarkMode);
    }
    //https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/onchange vs https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener

    lintButton.addEventListener("click", () => {
        console.log([...view.state.doc]);
        const lines = [...view.state.doc].join("").replaceAll(/<noparse>(.+)<\/noparse>/g, (match, name) => {
            return escapeHTML(name);
        }).replace(/&/g, "&amp;").replaceAll(/<([\w-]+)(?:=(?:"|')?([\w#%-]+)(?:"|')?)?>/g, (match, name, attr) => {
            switch(name) {
            case "color": {
                const num = parseInt(attr.substring(1), 16);
                if(!(supportedColors.includes(attr) 
                || ((attr.length === 7 || attr.length === 9) && attr.startsWith("#") && !isNaN(num)))
                ) { //ugly
                    return escapeHTML(match);
                }
                return `<span style="color: ${attr}">`;
            }
            case "alpha": {
                const num = parseInt(attr.substring(1), 16);
                if(attr.length !== 3 || !attr.startsWith("#") || isNaN(num)) return escapeHTML(match);
                return `<span style="opacity: ${(1/255) * num}">`;
            }
            case "uppercase":
            case "lowercase":
                return `<span style="text-transform: ${name}">` + addIf(attr);
            case "smallcaps":
                return "<span style=\"font-variant: small-caps\">" + addIf(attr);
            case "align":
                if(!["right", "left", "center", "justify"].includes(attr)) return escapeHTML(match);
                return `<span style="text-align: ${attr}">`;
            case "cspace":
                if(checkUnits(["px", "em"], attr)) {
                    return `<span style="letter-spacing: ${attr}">`;
                }
                return escapeHTML(match);
            case "indent":
                if(checkUnits(["px", "em", "%"], attr)) {
                    return `<div style="margin-left: ${attr}">`;
                }
                return escapeHTML(match);
            case "u":
            case "b":
            case "i":
            case "s":
            case "sub":
            case "sup":
                return `<${name}>` + addIf(attr);
            default:
                return escapeHTML(match);
            }
        }).replaceAll(/<\/([\w-]+)>/g, (match, name) => {
            switch(name) {
            case "color":
            case "alpha":
            case "lowercase":
            case "uppercase":
            case "smallcaps":
            case "align":
            case "cspace":
                return  "</span>";
            case "indent":
                return "</div>";
            case "b":
            case "i":
            case "s":
            case "u":
            case "sub":
            case "sup":
                return `</${name}>`;
            default:
                return escapeHTML(match);
            }
        }).replace(/\n/g, "<br>");

        output.innerHTML = lines;
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

function checkUnits(units, value) {
    for(const unit of units) {
        if(value.endsWith(unit) && !isNaN(value.slice(0, unit.length * -1))) return true;
    }
    return false;
}

function addIf(attr) {
    return attr ? `${attr}&gt;` : "";
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
