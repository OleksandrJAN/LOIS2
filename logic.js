let controller;
let calView;

function createController() {
    let holder = new ExpressionHolder();
    calcView = new CalculatorView();
    controller = new Controller(holder, calcView);
}

class Controller {

    constructor(holder, calculatorView) {
        this.holder = holder;
        this.calculatorView = calculatorView;
        this.testKnf = [];
    }

    makePKNF() {
        let formula = document.getElementById('panel').value;
        if (!this.holder.checkBracket(formula)) {
            this.calculatorView.clearTable();
            this.calculatorView.renderTextResult("Неправильно расставленны скобки");
            return;
        }

        if (!this.holder.isFormula(formula)) {
            this.calculatorView.clearTable();
            this.calculatorView.renderTextResult("Неправильная формула");
            return;
        }

        let arrayWithLiteral = this.holder.getLiterals(formula);
        
        let countRow = Math.pow(2, arrayWithLiteral.length);
        let table = this.holder.madeTruthTable(arrayWithLiteral, countRow, formula);
        
        let resultArray = this.holder.makePKNF(table, arrayWithLiteral, countRow);
        let result = this.holder.makeStringPKNF(resultArray);
       

        this.calculatorView.renderTable(table, arrayWithLiteral, false);
        this.calculatorView.renderTextResult("СКНФ: " + result);
    }

    
    createFormula() {
        this.testKnf = []
        let userFormula = document.getElementById('formula').value;
        if (userFormula === "") {
            let formula = this.createSimpleFormula();
            this.createFormulaRecursion(formula);
        } else {
            if (!this.holder.checkBracket(userFormula)) {
                this.calculatorView.clearTable();
                this.calculatorView.renderTestingTextResult("Неправильно расставленны скобки");
                return;
            }
    
            if (!this.holder.isFormula(userFormula)) {
                this.calculatorView.clearTable();
                this.calculatorView.renderTestingTextResult("Неправильная формула");
                return;
            }

            this.generateTestTable(userFormula);
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }
    
    createSimpleFormula(){
        var symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        var ralations = ["&", "|", "->", "~"];
        var firstSymbol = symbols[controller.getRandomInt(symbols.length)];
        var secondSymbol = symbols[controller.getRandomInt(symbols.length)];
        while (firstSymbol == secondSymbol) {
            firstSymbol = symbols[controller.getRandomInt(symbols.length)];
            secondSymbol = symbols[controller.getRandomInt(symbols.length)];
        }
        var relation = ralations[controller.getRandomInt(ralations.length)];
        var negative = controller.getRandomInt(10) == 0;
        var formula;
        if (negative) {
            formula = "(!(" + firstSymbol + relation + secondSymbol + ")" + ")"
        } else {
            formula = "(" + firstSymbol + relation + secondSymbol + ")"
        }
        return formula;
    }
    
    createFormulaRecursion(formula) {
        let arrayAfterSplit = formula.split("");
        let arrayOfSymbols = arrayAfterSplit.filter(element => element.match("[A-Z]") != null);
        let elementToReplace = arrayOfSymbols[this.getRandomInt(arrayOfSymbols.length)];
        
        formula = formula.replace(elementToReplace, this.createSimpleFormula);
        
        if (controller.getRandomInt(2) == 0 || arrayOfSymbols.length >= 3) {
            document.getElementById('formula').value = formula;
            this.generateTestTable(formula);
        } else {
            this.createFormulaRecursion(formula);
        }
    }

    generateTestTable(formula) {
        let arrayAfterSplit = formula.split("");
        let arrayOfSymbols = arrayAfterSplit.filter(element => element.match("[A-Z]") != null);
        arrayOfSymbols = this.removeDups(arrayOfSymbols);
        let countRow = Math.pow(2, arrayOfSymbols.length);

        // this == controller
        this.arrayOfSymbols = arrayOfSymbols;

        let table = this.holder.madeTruthTableWithourResult(arrayOfSymbols, countRow);
        this.calculatorView.renderTable(table, arrayOfSymbols, true);
    }

    removeDups(names) {
        let unique = {};
        names.forEach(function(i) {
          if (!unique[i]) {
            unique[i] = true;
          }
        });
        return Object.keys(unique);
      }

    addTestKnf(rows, index) {
        let subFormula = this.holder.makeSubFormulaForRow(rows[index], this.arrayOfSymbols);
        if (!this.testKnf.includes(subFormula)) {
            this.testKnf.push(subFormula);
            document.getElementById("resultTesting").value = this.getResultTestKnf();
        }
    }

    getResultTestKnf() {
        let array = this.testKnf.slice(0);
        return this.holder.makeStringPKNF(array);
    }

    checkTesting() {
        let formula = document.getElementById('formula').value;
       
        if (!this.holder.checkBracket(formula)) {
            this.calculatorView.clearTable();
            this.calculatorView.renderTestingTextResult("Неправильно расставленны скобки в начальной формуле");
            return;
        }

        if (!this.holder.isFormula(formula)) {
            this.calculatorView.clearTable();
            this.calculatorView.renderTestingTextResult("Неправильная начальная формула");
            return;
        }

        let arrayWithLiteral = this.holder.getLiterals(formula);
        let countRow = Math.pow(2, arrayWithLiteral.length);
        let table = this.holder.madeTruthTable(arrayWithLiteral, countRow, formula);
        
        let resultArray = this.holder.makePKNF(table, arrayWithLiteral, countRow);
        
        let resSet = new Set();
        for (let i = 0; i < resultArray.length; i++) {
            resSet.add(resultArray[i])
        }
        let testingResultSet = new Set();
        for (let i = 0; i < this.testKnf.length; i++) {
            testingResultSet.add(this.testKnf[i])
        }

        let testingResult = this.eqSet(resSet, testingResultSet);

        if (testingResult == true) {
            this.calculatorView.renderTestingTextResult("Ответ верный")
        } else {
            let result = this.holder.makeStringPKNF(resultArray);
            this.calculatorView.renderTestingTextResult("Ответ неверный" + "\n" + "Правильная формула -" + "\n" + result)
        }
        
    }

    eqSet(as, bs) {
        if (as.size !== bs.size) {
            return false;
        } 
        for (var a of as) {
            if (!bs.has(a)) {
                return false;
            } 
        } 
        return true;
    }

    clearTest() {
        document.getElementById("resultTesting").value = "";
        document.getElementById("abc").innerText = ""
        this.testKnf = [];
    }

}


class ExpressionHolder {

    constructor() { }

    checkBracket(formula) {
        let queueBracket = [];
        for (let i = 0; i < formula.length; i++) {
            let digit = formula.charAt(i);
            if (digit === "(") {
                queueBracket.push("(");
            }
            if (digit === ")") {
                let leftBracket = queueBracket.pop();
                if (leftBracket !== "(" || leftBracket === undefined) {
                    return false;
                }
            }
        }
        if (queueBracket.length === 0) {
            return true;
        } else return false;       
    }

    isFormula(formula) {
        let testSymbol = 'A';
        if (formula.match(/^[A-Z]$/g) || formula.match(/^\(\![A-Z]\)$/g)) {
            return true;
        }
        if (!formula.startsWith("(")) {
            return false;
        }

        let simpleNegation    = /\(![A-Z]\)/g;
        let simpleConjunction = /(\([A-Z])\&([A-Z]\))/g;
        let simpleDisjunction = /(\([A-Z])\|([A-Z]\))/g;
        let simpleEquivalent  = /(\([A-Z])\~([A-Z]\))/g;
        let simpleImplication = /(\([A-Z])\-\>([A-Z]\))/g;
        while (
            formula.match(simpleNegation) || 
            formula.match(simpleConjunction) ||
            formula.match(simpleDisjunction) || 
            formula.match(simpleEquivalent) ||
            formula.match(simpleImplication)
        ) {
            formula = formula.replace(simpleNegation, testSymbol);
            formula = formula.replace(simpleConjunction, testSymbol);
            formula = formula.replace(simpleDisjunction, testSymbol);
            formula = formula.replace(simpleEquivalent, testSymbol);
            formula = formula.replace(simpleImplication, testSymbol);
        }

        return formula == testSymbol;
    }

    makePKNF(table, arrayWithLiteral, countRow) {
        let resultColumn = arrayWithLiteral.length;
        let array = [];
        
        for (let index = 0; index < countRow; index++) {
            if (table[index][resultColumn] === "0") {
                let formula = this.makeSubFormulaForRow(table[index], arrayWithLiteral);
                array.push(formula);
            }
        }

        return array;
    }

    makeSubFormulaForRow(row, arrayWithLiteral) {
        let formula = "";
        if (arrayWithLiteral.length > 1) {
            formula += "(";
        }
        for (let index = 0; index < arrayWithLiteral.length; index++) {
            if (row[index] === "1") {
                formula += "(!" + arrayWithLiteral[index] + ")";
            } else {
                formula += arrayWithLiteral[index];
            }
            if (index != arrayWithLiteral.length - 1) {
                formula += "|";
            }
        }
        if (arrayWithLiteral.length > 1) {
            formula += ")";
        }
        return formula;
    }

    fixBrackets(array) {
        if (array.length > 1) {
            for (let i = 1; i < array.length; i++) {
                array[i] += ')';
            }

            let leftBrackets = "";
            for (let i = 1; i < array.length; i++) {
                leftBrackets += '(';
            }
            array[0] = leftBrackets + array[0];
        }
    }

    makeStringPKNF(pknfArray) {
        this.fixBrackets(pknfArray);
        return pknfArray.join("&");
    }

    madeTruthTable(arrayWithLiteral, countRow, formula) {
        let table = [];
    
        for(let index = 0; index < countRow; index++){
            let row = [];
            let byte = this.numberToBinaryString(index, arrayWithLiteral.length);
             
            row.push(...byte);
            row.push(this.getResultForRow(byte, arrayWithLiteral, formula));
            table.push(row);
        }
        return table;
    }

    madeTruthTableWithourResult(arrayWithLiteral, countRow) {
        let table = [];
    
        for(let index = 0; index < countRow; index++){
            let row = [];
            let byte = this.numberToBinaryString(index, arrayWithLiteral.length);
            row.push(...byte);
            table.push(row);
        }
        return table;
    }

    getLiterals(formula) {
        let arrayWithLiteral = [];
        for (let index = 0; index < formula.length; index++) {
            let str = formula[index];
            if (str.match(/[A-Z]/) !== null && !arrayWithLiteral.includes(str)) {
                arrayWithLiteral.push(str);
            }
        }
        return arrayWithLiteral;
    }

    numberToBinaryString(number, stringLength){
        let limit = 2
        if (stringLength == 1) {
            limit = 1
        }
        let string = number.toString(2).padStart(limit, "0")
        for (let i = string.length; i < stringLength; i++){
            string = "0" + string;
        }
        return string;
    }

    getResultForRow(byte, arrayWithLiteral, formula) {
        let map = {};
        for(let index in arrayWithLiteral) {
            map[arrayWithLiteral[index]] = byte.charAt(index++);
        }

        let correctJsString = this.replaceLogicSymbol(formula);
        for(let index in Object.keys(map)) {
            let key = Object.keys(map)[index];
            while (correctJsString.match(key) != null) {
                correctJsString = correctJsString.replace(key, map[key]);
            }
        }

        if (eval(correctJsString)) {
            return "1";
        } else {
            return "0";
        }
    }

    replaceLogicSymbol(string) {
        let newString = [];
        for(let index = 0; index < string.length; index++) {
            let symbol = string[index];
            if (symbol === "&") {
                newString.push("&&");
            } else if (symbol === "|") {
                newString.push("||");
            } else if (symbol === "~") {
                newString.push("===");
            } else if (symbol === "-" && string[++index] === ">") {
                let literal = newString.pop();
                let str = "";
                if (literal === ")") {
                    let brackets = [];
                    brackets.push(literal);
                    let buffer = [];
                    buffer.push(literal);
                    while (brackets.length > 0) {
                        let substring = newString.pop();
                        if (substring === "(") {
                            brackets.pop();
                        } else if (substring === ")"){
                            brackets.push(substring);
                        }
                        buffer.push(substring);
                    }
                    buffer = buffer.reverse();
                    str = "(!" + buffer.join("") + ")||";
                } else {
                    str = "(!" + literal + ")||";
                }
                newString.push(...str);
            } else {
                newString.push(symbol);
            }
        }
        return newString.join("");
    }
}


class CalculatorView {
    constructor() {
        this.edit = document.getElementById('panel');
        this.result = document.getElementById('result');
        this.table = document.getElementById('table');
        this.testTable = document.getElementById('testTable');
        this.testingResult = document.getElementById('resultTest')
        this.rows = []
    }

    renderTextEdit(expression) {
        this.edit.value = expression;
    }

    renderTextResult(text) {
         this.result.innerText = text;
    }

    renderTestingTextResult(text) {
        document.getElementById('abc').innerText = text;
    }

    clearTable() {
        this.table.innerHTML = "";
    }

    renderTable(table, arrayWithLiteral, isTest) {
        let size = Math.pow(2, arrayWithLiteral.length);
        let innerHTML = "<thead>";
        let tr = "<tr>";
        for (let key = 0; key < arrayWithLiteral.length; key++) {
            tr += "<td>" + arrayWithLiteral[key] + "</td>";
        }
        tr += "<td>" + "result" + "</td>";
        tr += "</tr>";
        innerHTML += "</thead>";
        innerHTML += "<tbody>";
        innerHTML += tr;
        for (let i = 0; i < size; i++) {
            let row = table[i];
            let rowTr = "<tr>";
            let iternumber = row.length
            if(isTest) {
                iternumber = iternumber + 1
            }
            for (let index = 0; index < iternumber; index++) {
                let val = row[index];
                if (isTest && index == (iternumber - 1)) {
                    this.rows[i] = row
                    let buttonHtml = "<input font-size=\"5px\" id=checkbutton" + i + " name=\"btnCheck\" type=\"button\" value=\"Добавить в формулу\" onclick=\"controller.addTestKnf(calcView.rows, " + i + ")\"/>"
                    rowTr += "<td>" + buttonHtml + "</td>"
                } else {
                    rowTr += "<td>" + val + "</td>"
                }
            }
            rowTr += "</tr>";
            innerHTML += rowTr;
        } 
        innerHTML += "</tbody>";
        if(isTest) {
            this.testTable.innerHTML = innerHTML;
        } else {
            this.table.innerHTML = innerHTML;
        }
    }

}