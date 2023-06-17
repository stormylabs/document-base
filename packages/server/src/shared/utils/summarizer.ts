import Bottleneck from 'bottleneck';
import { LLMChain, OpenAI, PromptTemplate } from 'langchain';
import { templates } from '../constants/template';
import { chunkSubstr } from './web-utils';

const { summarizerTemplate, summarizerDocumentTemplate } = templates;
const llm = new OpenAI({
  concurrency: 10,
  temperature: 0,
  modelName: 'gpt-3.5-turbo',
  openAIApiKey: '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',
});

const limiter = new Bottleneck({
  minTime: 5050,
});

const summarize = async ({
  document,
  inquiry,
  onSummaryDone,
}: {
  document: string;
  inquiry?: string;
  onSummaryDone?: (result: string) => void;
}) => {
  console.log('summarizing ', document.length);
  const promptTemplate = new PromptTemplate({
    template: inquiry ? summarizerTemplate : summarizerDocumentTemplate,
    inputVariables: inquiry ? ['document', 'inquiry'] : ['document'],
  });
  const chain = new LLMChain({
    prompt: promptTemplate,
    llm,
  });

  try {
    const result = await chain.call({
      prompt: promptTemplate,
      document,
      inquiry,
    });

    console.log(result);

    onSummaryDone && onSummaryDone(result.text);
    return result.text;
  } catch (e) {
    console.log(e);
  }
};

const rateLimitedSummarize = limiter.wrap(summarize);

export const summarizeLongDocument = async ({
  document,
  inquiry,
  onSummaryDone,
}: {
  document: string;
  inquiry?: string;
  onSummaryDone?: (result: string) => void;
}): Promise<string> => {
  // Chunk document into 4000 character chunks
  const templateLength = inquiry
    ? summarizerTemplate.length
    : summarizerDocumentTemplate.length;
  try {
    if (document.length + templateLength > 4000) {
      console.log('document is long and has to be shortened', document.length);
      const chunks = chunkSubstr(document, 4000 - templateLength - 1);
      let summarizedChunks: string[] = [];
      summarizedChunks = await Promise.all(
        chunks.map(async (chunk) => {
          let result;
          if (inquiry) {
            result = await rateLimitedSummarize({
              document: chunk,
              inquiry,
              onSummaryDone,
            });
          } else {
            result = await rateLimitedSummarize({
              document: chunk,
              onSummaryDone,
            });
          }
          return result;
        }),
      );

      const result = summarizedChunks.join('\n');
      console.log(result.length);

      if (result.length + templateLength > 4000) {
        console.log('document is STILL long and has to be shortened further');
        return await summarizeLongDocument({
          document: result,
          inquiry,
          onSummaryDone,
        });
      } else {
        console.log('done');
        return result;
      }
    } else {
      return document;
    }
  } catch (e) {
    throw new Error(e as string);
  }
};
