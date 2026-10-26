import * as monaco from "./generated/entry";

declare global {
    const baseUrl: string;
    const getCurrentCss: () => Promise<string>;
    const setCss: (css: string) => void;
    const getTheme: () => string;
}

getCurrentCss().then(css => {
    const editor = monaco.editor.create(
        document.getElementById("container")!,
        {
            value: css,
            language: "css",
            theme: getTheme(),
        }
    );
    editor.onDidChangeModelContent(() =>
        setCss(editor.getValue())
    );
    window.addEventListener("resize", () => {
        // make monaco re-layout
        editor.layout();
    });
});
