import React, { Component } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import Pusher from "pusher-js";
import pushid from "pushid";
import axios from "axios";

import "./App.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/dracula.css";

import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";
import "codemirror/mode/javascript/javascript";

import Questions from './components/questions/Question'
import QuestionButton from './components/questions/QuestionButton'
import { ListOfQuestions } from './components/questions/ListOfQuestions'

class App extends Component {
  constructor() {
    super();
    this.state = {
      id: "",
      js: `function myFunction() {`+ "\n\n" +`  //put the logic here`+"\n\n"+ `}` + "\n\n" + `document.getElementById("output").innerHTML = myFunction();`,
      answer: "",
      title: "",
      example: "",
      input: "",
      output: ""
    };

    this.pusher = new Pusher("dbddcf4de43fefadd192", {
      cluster: "ap1",
      forceTLS: true
    });

    this.channel = this.pusher.subscribe("editor");
  }

  componentDidMount() {
    this.setState({
      id: pushid()
    });

    this.channel.bind("text-update", data => {
      const { id } = this.state;
      if (data.id === id) return;

      this.setState({
        js: data.js
      });
    });
  }

  syncUpdates = () => {
    const data = { ...this.state };

    axios
      .post("https://jsway-api-wen.herokuapp.com/update-editor", data)
      .catch(console.error);
  };

  runCode = () => {
    const { js } = this.state;

    console.log(js)
    const iframe = this.refs.iframe;
    const document = iframe.contentDocument;
    const documentContents = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <style>
          body {
            font-family: monospace;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        Your Result : <span id="output"></span>
        <script type="text/javascript">
          ${js}
          document.getElementById("output").innerHTML = myFunction();
        </script>
      </body>
      </html>
    `;

    document.open();
    document.write(documentContents);
    this.setState({
      answer: document.getElementById("output").innerHTML
    })
    this.answerChecker(document.getElementById("output").innerHTML, this.state.output)
    document.close();
  };

  clearResult = () => {
    
    this.setState({
      js: `function myFunction() {`+ "\n\n" +`  //put the logic here`+"\n\n"+ `}` + "\n\n" + `document.getElementById("output").innerHTML = myFunction();`
    })

    const iframe = this.refs.iframe;
    const document = iframe.contentDocument;
    const documentContents = ``;

    document.open();
    document.write(documentContents);
    document.close();
  }

  answerChecker = (answer, output) => {
    if(answer === output) {
      alert('Correct Answer !')
    } else {
      alert('Wrong Answer..')
    }
  }

  changeQuestion = (title, example, input, output) => {
    this.setState({
      title: title,
      example: example,
      input: input,
      output: output
    })
  }

  render() {
    const { js } = this.state;
    const codeMirrorOptions = {
      theme: "dracula",
      lineNumbers: true,
      scrollbarStyle: null,
      lineWrapping: true,
      tabSize: 2
    };

    return (
      <div className="App">
        <section className="playground">
          <div className="code-editor js-code">
            <div className="editor-header">
              JavaScript
            </div>
            <span className="note-text">
              <span style={{ color: 'yellow' }}>note: </span>
              <span>
                put all the variables inside (<span style={{color: 'red'}}>create a function with no parameter</span>)
              </span>
            </span>
            <br /><br />
            <CodeMirror
              value={js}
              options={{
                mode: "javascript",
                ...codeMirrorOptions
              }}
              onBeforeChange={(editor, data, js) => {
                this.setState({ js }, () => this.syncUpdates());
              }}
            />
          </div>
          <button 
            className="run-button"
            onClick={() => this.runCode()}
          >
            Run
          </button>
          <button 
            className="clear-button"
            onClick={() => this.clearResult()}
          >
            Clear
          </button>
        </section>
        <section className="result">
          <div className="questions">
            <Questions 
              title={this.state.title}
              example={this.state.example}
              input={this.state.input}
              output={this.state.output}
            />
          </div>
          <iframe title="result" className="iframe" ref="iframe" />
          <div className="test-case">
            {
              ListOfQuestions.map((question) => (
                <QuestionButton 
                  title={question.title}
                  example={question.example}
                  input={question.input}
                  output={question.output}
                  changeQuestion={this.changeQuestion}
                />
              ))
            }
          </div>
        </section>
      </div>
    );
  }
}

export default App;