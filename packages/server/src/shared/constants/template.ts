const templates = {
  qaTemplate: `
    You should follow ALL the rules below when generating an answer:
    - The final answer must always be styled using markdown.
    - Use bullet points, lists, paragraphs and text styling to present the answer in markdown.
    - ALWAYS prefer the result with the highest "score" value.
    - Ignore any content that is stored in html tables.

    QUESTION: {question}

    Final Answer: `,
  summarizerTemplate: `Shorten the text in the CONTENT, attempting to answer the INQUIRY You should follow the following rules when generating the summary:
      - It is IMPERATIVE to provide the final answer in the LANGUAGE that the INQUIRY is in, instead of CONTENT.
      - It is IMPERATIVE to distinguish between Traditional Chinese and Simplified Chinese.
      - Any code found in the CONTENT should ALWAYS be preserved in the summary, unchanged.
      - Code will be surrounded by backticks (\`) or triple backticks (\`\`\`).
      - Summary should include code examples that are relevant to the INQUIRY, based on the content. Do not make up any code examples on your own.
      - The summary will answer the INQUIRY. If it cannot be answered, the summary should be empty, AND NO TEXT SHOULD BE RETURNED IN THE FINAL ANSWER AT ALL.
      - If the INQUIRY cannot be answered, the final answer should be empty.
      - The summary must be under 4000 characters.
      - The summary should be 2000 characters long, if possible.
  
      INQUIRY: {inquiry}
      CONTENT: {document}
  
      Final answer:
      `,
  summarizerDocumentTemplate: `Summarize the text in the CONTENT. You should follow the following rules when generating the summary:
      - Any code found in the CONTENT should ALWAYS be preserved in the summary, unchanged.
      - Code will be surrounded by backticks (\`) or triple backticks (\`\`\`).
      - Summary should include code examples when possible. Do not make up any code examples on your own.
      - The summary should be under 4000 characters.
      - The summary should be at least 1500 characters long, if possible.
  
      CONTENT: {document}
  
      Final answer:
      `,
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
