
import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoOptions {
    width: number;
    height: number;
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        video: {
            /**
             * Set a video node
             */
            setVideo: (options: { src: string }) => ReturnType;
        };
    }
}

export const VideoExtension = Node.create<VideoOptions>({
    name: 'video',

    addOptions() {
        return {
            width: 640,
            height: 480,
            HTMLAttributes: {
                controls: true,
                class: 'w-full aspect-video rounded-xl shadow-xl bg-black',
            },
        };
    },

    group: 'block',

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            width: {
                default: this.options.width,
            },
            height: {
                default: this.options.height,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'video',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addCommands() {
        return {
            setVideo:
                (options) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        });
                    },
        };
    },
});
