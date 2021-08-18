window.onload = () => {
    /**
     * @type {HTMLDivElement}
     */
    const input = document.getElementById("textinput");
    /**
     * @type {HTMLButtonElement}
     */
    const lintButton = document.getElementById("lint-button");

    input.addEventListener("keydown", ev => {
        if(ev.ctrlKey || ev.altKey || ev.metaKey) return;
        if(ev.key === "Tab") {
            ev.preventDefault();
            const sel = window.getSelection();
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const text = document.createTextNode("\u00A0\u00A0\u00A0\u00A0");
            range.insertNode(text);

            range.setStart(text, text.length);
            range.setEnd(text, text.length);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });

    lintButton.addEventListener("click", () => {
        const tags = [...input.innerText.matchAll(/<(\w+)(?:(=)?("|')?(\w+)?("|')?)?>/g)];
        const end = [...input.innerText.matchAll(/<\/(\w+)>/g)];
        for(const tag of tags) {
            if(tag[4] === undefined) continue;
            if(tag[3] && !tag[5]) throw "No group 5";
            if(tag[5] && !tag[3]) throw "No group 3";
            if(!tag[2]) throw "No assignment";  
        }
    });
};
