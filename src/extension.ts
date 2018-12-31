import { window, commands, ExtensionContext, TextDocument } from 'vscode';

export function activate(context: ExtensionContext) {

    let classSeeker = new ClassSeeker();

    let disposableUnique = commands.registerCommand('extension.showUnique', () => {
        const classesArray = classSeeker.updateClasses(true);
        displayList(classesArray, 'unique');
        console.log('Time to get unique and classy!');
    });

    let disposableAll = commands.registerCommand('extension.showAll', () => {
        const classesArray = classSeeker.updateClasses(false);
        displayList(classesArray, 'total');
        console.log('Time to get classy!');
    });

    function displayList(classes: Array<string>, message: String) {
        let outputPanel = window.createOutputChannel("HTML classes");
        outputPanel.appendLine(`There are ${classes.length} ${message} classes present in your document:`);
        outputPanel.appendLine(classes.join('\n'));
        outputPanel.show(true);
        console.log('Time to get totally classy!');
    }

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(classSeeker);
    context.subscriptions.push(disposableUnique);
    context.subscriptions.push(disposableAll);
}

class ClassSeeker {
    public updateClasses(unique: Boolean) {
        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            console.log('no file in editor');
            return;
        }
        let doc = editor.document;
        let classNames = this.getClasses(doc, unique);
        return classNames
    }

    public getClasses(doc: TextDocument, unique: Boolean) {
        let result;
        let docContent = doc.getText();
        if (unique) {
            result = this.filterUnique(this.searchClasses(docContent));
        } else {
            result = this.searchClasses(docContent);
        }
        return result;
    }

    public searchClasses(rawText: String) {
        const patternClass = /class="([^":{}]+)"/g;
        const patternClassName = /"((?:\\.|[^"\\])*)"/g;

        let res = rawText.match(patternClass);
        let final = [];

        res.forEach(function(item) {
            let input;
            input = item.match(patternClassName)[0].replace(/"/g, "").split(" ");
            final = final.concat(input);
        });
        return final.sort();
    }

    public filterUnique(array: Any){
        return array.filter((v, i, a) => a.indexOf(v) === i);
    }

    dispose() {

    }
}