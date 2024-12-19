const templates = {
  qaTemplate: `
  Given the piece of context, question and a set of rules, create a final answer. 
  The context is provided between the = lines:
  
  =========
  CONTEXT: {context}
  =========

  The question is provided between the * lines:
  **********
  QUESTION: {question}
  **********

  Formatting Rules for Links:
  1. All web links must be written on a new line, followed by a blank line.
  2. Do not embed links in text or sentences under any circumstances.
  3. Do not continue sentences directly before or after the link.
  Example:
  Correct:  
  "Please visit our website:  
  https://google.com  

  You can perform your web search there."

  Incorrect:  
  "Please visit our website: https://google.com. You can perform your web search there."

  Use bullet points, lists, and paragraphs to present the answer. Always follow the link formatting rules strictly.
  
  Answer the QUESTION based only on the CONTEXT provided.
  Do not use any information outside of the CONTEXT to answer the QUESTION.
  If you are not sure about the answer, reply with the Fallback Message.

  Do not repeat the QUESTION in the FINAL ANSWER.

  If the QUESTION is a small-talk, answer it with a small-talk response without basing on the CONTEXT.
  Keep the FINAL ANSWER concise and to the point (no more than 5 sentences).

  The FINAL ANSWER should be in the same language as the QUESTION.

  FINAL ANSWER:
 `,
  inquiryTemplate: `Given the following CHAT_HISTORY and a FOLLOW_UP_QUESTION, rephrase the FOLLOW_UP_QUESTION to be a standalone question, answer in the same language as the follow up question. include it in the standalone question.
  - If the QUESTION is a small-talk, just output the follow up question as it is.
  - Please make sure that the answer is within 5 sentences.


  CHAT_HISTORY: {chat_history}
  FOLLOW_UP_QUESTION: {question}
  Standalone question:`,
};

export { templates };
