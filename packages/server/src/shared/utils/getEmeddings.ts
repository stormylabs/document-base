import { Document as LCDocument } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Vector } from '@pinecone-database/pinecone';

export const getEmbedding = async (
  documentId: string,
  doc: LCDocument,
  apiKey: string,
) => {
  const embedder = new OpenAIEmbeddings({
    modelName: 'text-embedding-ada-002',
    openAIApiKey: apiKey,
  });
  const embedding = await embedder.embedQuery(doc.pageContent);
  return {
    id: documentId,
    values: embedding,
    metadata: {
      botId: doc.metadata.botId,
      sourceName: doc.metadata.sourceName,
      text: doc.metadata.text,
    },
  } as Vector;
};
