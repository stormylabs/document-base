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
    - Please make sure that the answer is within 5 sentences.
    
    Final Answer: `,
  inquiryTemplate: `Given the following CHAT_HISTORY and a FOLLOW_UP_QUESTION, rephrase the FOLLOW_UP_QUESTION to be a standalone question, answer in the same language as the follow up question. include it in the standalone question.
  - If the QUESTION is a small-talk, just output the follow up question as it is.
  - Please make sure that the answer is within 5 sentences.


  CHAT_HISTORY:
  {chat_history}
  FOLLOW_UP_QUESTION: {question}
  Standalone question:`,
  summerierTemplate: `Summarize the following text. You should follow the following rules when generating and answer:`,
};

export { templates };
