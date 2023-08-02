const templates = {
  qaTemplate: `
    You should follow ALL the rules below when generating an answer:
    - The final answer must always be styled using markdown.
    - Use bullet points, lists, paragraphs and text styling to present the answer in markdown.
    - ALWAYS prefer the result with the highest "score" value.
    - Ignore any content that is stored in html tables.
    - Answer the question based on the CONTEXT provided.

    QUESTION: {question}
    CONTEXT: {context}

    Final Answer: `,
  inquiryTemplate: `Given the following conversation and a follow up input, if it is a question rephrase it to be a standalone question.
  If it is not a question, just summarize the message.
  
  Chat history:
  {chat_history}
  Follow up input: {question}
  Standalone input:
      `,
  summerierTemplate: `Summarize the following text. You should follow the following rules when generating and answer:`,
};

export { templates };
