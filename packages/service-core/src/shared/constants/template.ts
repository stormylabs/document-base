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

  Use bullet points, lists, paragraphs and text styling to present the answer.
  When displaying web links, write them on a separate line, and continue the answer on another separate line. Do not embed the link within the text. For example:

  Correct:
  "Please visit our website:
  https://google.com
  You can perform your websearch there."


  Incorrect:
  "Please visit our website: https://google.com. You can perform your websearch there."
  
  Answer the QUESTION based only on the CONTEXT provided.
  Do not use any information outside of the CONTEXT to answer the QUESTION.
  If you are not sure about the answer, reply with the Fallback Message.

  Do not repeat the QUESTION in the FINAL ANSWER.

  If the QUESTION is a small-talk, answer it with a small-talk response without basing on the CONTEXT.
  Please make sure that the FINAL ANSWER is within 5 sentences.
  Keep the FINAL ANSWER concise and to the point.

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
