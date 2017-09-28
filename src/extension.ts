import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

export function activate(context: ExtensionContext) {

    let classSeeker = new ClassSeeker();

    let disposable = commands.registerCommand('extension.classMate', () => {
        const classesArray = classSeeker.updateClasses();
        let outputPanel = window.createOutputChannel("CSS classes");
        outputPanel.appendLine(`There are ${classesArray.length} classes present in your document:`);
        outputPanel.appendLine(classesArray.join('\n'));
        outputPanel.show(true);
        console.log('Time to get classy!');
    });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(classSeeker);
    context.subscriptions.push(disposable);
}

class ClassSeeker {
    public updateClasses() {
        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            console.log('no file in editor');
            return;
        }
        let doc = editor.document;
        let classNames = this.getClasses(doc);
        return classNames
    }

    public getClasses(doc: TextDocument) {
        let docContent = doc.getText();
        let result = this.searchClasses(docContent);
        return result;
    }

    public searchClasses(rawText: string) {
        const patternClass = /class="([^":{}]+)"/g;
        const patternClassName = /"((?:\\.|[^"\\])*)"/g;

        let res = rawText.match(patternClass);
        let final = [];

        res.forEach(function(item) {
            let input;
            input = item.match(patternClassName)[0].replace(/"/g, "").split(" ");
            final = final.concat(input);
        });
        // make array unique
        const unique = final.filter((v, i, a) => a.indexOf(v) === i).sort();

        return unique;
    }

    dispose() {

    }
}