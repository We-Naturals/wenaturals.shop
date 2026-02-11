import { Node, mergeAttributes } from "@tiptap/core";

export const VideoExtension = Node.create({
    name: "video",
    group: "block",
    selectable: true,
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "video",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "video",
            mergeAttributes(HTMLAttributes, {
                controls: true,
                class: "w-full rounded-xl border border-white/10 my-4 max-w-full h-auto shadow-2xl",
            }),
        ];
    },
});
