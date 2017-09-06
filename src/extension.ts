import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

export function activate(context: ExtensionContext) {

    // create a new word counter
    let wordCounter = new WordCounter();
    let classSeeker = new ClassSeeker();

    let disposable = commands.registerCommand('extension.classMate', () => {
        wordCounter.updateWordCount();
        classSeeker.updateClasses();
    });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(wordCounter);
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
        const unique = final.filter((v, i, a) => a.indexOf(v) === i);

        return unique;
    }
}

class WordCounter {

    private _statusBarItem: StatusBarItem;

    public updateWordCount() {

        // Create as needed
        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }

        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;

        // Only update status if an Markdown file
        if (doc.languageId === "html") {
            let wordCount = this._getWordCount(doc);

            // Update the status bar
            this._statusBarItem.text = wordCount !== 1 ? `${wordCount} Words` : '1 Word';
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

    public _getWordCount(doc: TextDocument): number {

        let docContent = doc.getText();

        // Parse out unwanted whitespace so the split is accurate
        docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        let wordCount = 0;
        if (docContent != "") {
            wordCount = docContent.split(" ").length;
        }

        return wordCount;
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}