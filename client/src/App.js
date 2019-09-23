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
import SweetAlert from 'react-bootstrap-sweetalert';

import Questions from './components/questions/Question'
import QuestionButton from './components/questions/QuestionButton'
import { ListOfQuestions } from './components/questions/ListOfQuestions'

class App extends Component {
  constructor() {
    super();
    this.state = {
      id: "",
      js: `function myFunction(input = /** put your input here*/) {`+ "\n\n" +`  //put the logic here`+"\n\n"+ `}` + "\n\n" + `document.getElementById("output").innerHTML = myFunction();`,
      answer: "",
      title: "",
      example: "",
      input: "",
      output: "",
      score: 0,
      // SWEET ALERT
      sweetAlert: null,
    };

    this.pusher = new Pusher("dbddcf4de43fefadd192", {
      cluster: "ap1",
      forceTLS: true
    });

    this.channel = this.pusher.subscribe("editor");
  }

  /**SWEET ALERT */
  correctSweetAlert(){
    this.setState({
      sweetAlert: (
        <SweetAlert
          success
          title="Correct Anwer!"
          style={{
            display: "block",
          }}
          btnSize="lg"
          confirmBtnBsStyle="primary" 
          confirmBtnCssClass="sweetalert-confirm-btn"
          onConfirm={() => {this.hideSweetAlert()}}
        >
        </SweetAlert>
      )
    })
  }

  wrongSweetAlert(){
    this.setState({
      sweetAlert: (
        <SweetAlert
          danger
          title="Wrong Answer..."
          style={{
            display: "block",
          }}
          confirmBtnBsStyle="primary"
          confirmBtnCssClass="sweetalert-danger-btn"
          onConfirm={() => {this.hideSweetAlert()}}
        >
        </SweetAlert>
      )
    })
  }

  hideSweetAlert = () => {
    this.setState({
      sweetAlert: null
    })
  }
  /**END OF SWEETALERT FUNCTION */  

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
          .text {
            color: green;
          }
        </style>
      </head>
      <body>
        <span class="text">Your Result :</span> <span id="output"></span>
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

    const iframe = this.refs.iframe;
    const document = iframe.contentDocument;
    const documentContents = ``;

    document.open();
    document.write(documentContents);
    document.close();
  }

  resetCode = () => {
    this.setState({
      js: `function myFunction(input = /** put your input here*/) {`+ "\n\n" +`  //put the logic here`+"\n\n"+ `}` + "\n\n" + `document.getElementById("output").innerHTML = myFunction();`
    })
  }

  answerChecker = (answer, output) => {
    if(output) {
      if(answer === output) {
        this.setState({
          score: this.state.score + 1
        })
        this.correctSweetAlert()
      } else {
        this.wrongSweetAlert()
      }
    }
  }

  changeQuestion = (title, example, input, output) => {
    this.setState({ isLoading: true })
    this.clearResult()
    this.resetCode()
    setTimeout(() => {
      this.setState({
        title: title,
        example: example,
        input: input,
        output: output,
        isLoading: false
      })
    }, 1000);
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
          <button 
            className="reset-button"
            onClick={() => this.resetCode()}
          >
            Reset
          </button>
          <div style={{ position: 'absolute', bottom: '70px', left: '60px' }}>
            <h1 style={{ color: 'white', fontSize: '25px' }}>Your Score = {this.state.score}</h1>  
          </div>
        </section>
        <section className="result">
          <div className="questions">
            {
              this.state.isLoading ? 
              <div className="loader" style={{ padding: '15%', textAlign: 'center' }}>
                <span style={{ fontSize: '25px', color: 'white' }}>Loading...</span>
              </div> :
              <Questions 
                title={this.state.title}
                example={this.state.example}
                input={this.state.input}
                output={this.state.output}
              />
            }
          </div>
          <iframe title="result" className="iframe" ref="iframe" />
          <div className="test-case">
            <span style={{ color: 'red', fontSize: '15px' }}>Choose Your Question: </span>
            <br /><br />
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
        {this.state.sweetAlert}
      </div>
    );
  }
}

export default App;