import { parser } from "./rich.js";
import { LRLanguage, LanguageSupport, foldInside, foldNodeProp, indentNodeProp } from "@codemirror/language";
import { styleTags, tags as t } from "@codemirror/highlight";
window.testings = parser;

export const richLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                AttributeValue: t.string,
                Text: t.content,
                "StartTag StartCloseTag EndTag": t.angleBracket,
                TagName: t.tagName,
                "MismatchedCloseTag/TagName": [t.tagName, t.invalid],
                Is: t.definitionOperator
            }),
            indentNodeProp.add({
                Document: () => 0
            }),
            foldNodeProp.add({
                Entity: foldInside
            })
        ]
    })
});

export function rich() {
    return new LanguageSupport(richLanguage);
}