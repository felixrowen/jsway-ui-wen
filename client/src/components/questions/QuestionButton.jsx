import React from 'react'

const QuestionButton = ({
  title,
  example,
  input,
  output,
  changeQuestion
}) => {
  return(
    <button 
      className="question-button"
      onClick={() => changeQuestion(title, example, input, output)}
    >
      {title}
    </button>
  )
}

export default QuestionButton