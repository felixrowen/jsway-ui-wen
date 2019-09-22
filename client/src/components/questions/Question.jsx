import React from 'react'

const Question = ({
  title,
  example,
  input,
  output
}) => {
  return(
    <div className="question-wrapper">
      <h2>Question </h2>
      <br/>
      <span style={{ fontWeight: '800' }}>Title: </span><span>{title}</span>
      <br/><br/>
      <h2>Example: </h2>
      <span>{example}</span>
      <br/><br />
      <span style={{ fontWeight: '800' }}>Input: </span>
      <span>
        {input}
      </span>
      <br/><br />
      <span style={{ fontWeight: '800' }}>Output: </span>
      <span>
        {output}
      </span>
    </div>
  )
}

export default Question