import { window, commands, ExtensionContext, TextDocument } from 'vscode';

export function activate(context: ExtensionContext) {

    let classSeeker = new ClassSeeker();

    let showAllClasses = commands.registerCommand('extension.showAll', () => {
        const classesArray = classSeeker.getAllClasses();
        displayList(classesArray, 'total');
    });

    let showAllClassesSorted = commands.registerCommand('extension.showAllSorted', () => {
        const classesArray = classSeeker.getAllClassesSorted();
        displayList(classesArray, 'total (sorted)');
    })

    let showUniqueClasses = commands.registerCommand('extension.showUnique', () => {
        let classesFrequency = classSeeker.getUniqueClasses();
        displayFrequency(classesFrequency, 'unique');
    });

    function displayList(classes: Array<string>, message: String) {
        let outputPanel = window.createOutputChannel("HTML classes");
        const output = `>>> There are ${classes.length} classes in ${message} present in your document`
        outputPanel.appendLine(output);
        outputPanel.appendLine(classes.join('\n'));
        outputPanel.appendLine(output);
        outputPanel.show(true);
    }

    function displayFrequency(pairArray: String[][], message: String) {
        let outputPanel = window.createOutputChannel("HTML classes");
        const output = `>>> There are ${pairArray.length} ${message} classes present in your document`
        outputPanel.appendLine(output);
        pairArray.forEach(element => {
            outputPanel.appendLine(element.join(' '))
        })
        outputPanel.appendLine(output);
        outputPanel.show(true);
    }

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(classSeeker);
    context.subscriptions.push(showAllClasses);
    context.subscriptions.push(showAllClassesSorted);
    context.subscriptions.push(showUniqueClasses);
}

class ClassSeeker {

    public getAllClasses() {
        return this.searchClassesInText(this.getTextDocument());
    }

    public getAllClassesSorted() {
        return this.getAllClasses().sort();
    }

    public getUniqueClasses() {
        return this.arrayFrequency(this.getAllClassesSorted());
    }

    private arrayFrequency(array: any[]) {
        const reducedArray = array.reduce(function (acc, curr) {
            if (typeof acc[curr] == 'undefined') {
              acc[curr] = 1;
            } else {
              acc[curr] += 1;
            }
            return acc;
          }, {});
        return this.frequencyToArray(reducedArray);
    }

    private frequencyToArray(obj: Object) {
        return Object.keys(obj).map(function(key) {
            return [key, `[${String(obj[key])}]`];
        });
    }

    private getTextDocument() {
        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            console.log('no file in editor');
        } else {
            return editor.document.getText();
        }
    }

    private searchClassesInText(rawText: String) {
        const patternClass = /class="([^":{}]+)"/g;
        const patternClassName = /"((?:\\.|[^"\\])*)"/g;

        let classTags = rawText.match(patternClass);
        let allClassesArray = [];

        classTags.forEach( item => {
            let input;
            input = item.match(patternClassName)[0].replace(/"/g, "").split(" ");
            allClassesArray = allClassesArray.concat(input);
        });
        return allClassesArray;
    }

    dispose() {

    }
}