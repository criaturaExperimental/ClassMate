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
        const output = `There are ${classes.length} ${message} classes present in your document:`
        outputPanel.appendLine(output);
        outputPanel.appendLine(classes.join('\n'));
        outputPanel.appendLine(output);
        outputPanel.show(true);
    }

    function displayFrequency(pairArray: String[][], message: String) {
        let outputPanel = window.createOutputChannel("HTML classes");
        const output = `There are ${pairArray.length} ${message} classes present in your document:`
        outputPanel.appendLine(output);
        pairArray.forEach(element => {
            outputPanel.appendLine(element.join(' '))
        })
        outputPanel.appendLine(output);
        outputPanel.show(true);
    }

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(classSeeker);
    context.subscriptions.push(showUniqueClasses);
    context.subscriptions.push(showAllClasses);
    context.subscriptions.push(showAllClassesSorted);
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
        const output = array.reduce(function (acc, curr) {
            if (typeof acc[curr] == 'undefined') {
              acc[curr] = 1;
            } else {
              acc[curr] += 1;
            }
            return acc;
          }, {});
        return this.frequencyToArray(output);
    }

    private frequencyToArray(obj: Object) {
        let array = Object.keys(obj).map(function(key) {
            return [key, `[${String(obj[key])}]`];
        });
        return array;
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

    public filterUnique(array: any){
        return array.filter((v, i, a) => a.indexOf(v) === i);
    }

    dispose() {

    }
}