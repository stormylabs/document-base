const templates = {
  qaTemplate: `
    QUESTION: {question}
    CONTEXT: {context}

    You should follow ALL the rules below when generating an answer:
    - The final answer must always be styled using markdown.
    - Use bullet points, lists, paragraphs and text styling to present the answer in markdown.
    - Answer the question based on the CONTEXT provided
    - Do not repeat the QUESTION in the answer.
    - If the QUESTION is a small-talk, answer it with a small-talk response without basing on the CONTEXT.
    - Please make sure that the answer is within 4 sentences.
    
    Final Answer: `,
  inquiryTemplate: `
  CHAT_HISTORY: {chat_history}
  INPUT: {question}

  Given the following CHAT_HISTORY and an INPUT, 
  - If INPUT is a question rephrase it to be a standalone question.
  - If INPUT is not a question, just summarize the message.
  - Please make sure that the output is within 4 sentences.

  Standalone input:
      `,
  summerierTemplate: `Summarize the following text. You should follow the following rules when generating and answer:`,
};

export { templates };
