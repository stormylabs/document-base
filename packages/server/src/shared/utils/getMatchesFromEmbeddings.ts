import { ScoredVector } from '@pinecone-database/pinecone';
import { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

export type Metadata = {
  botId: string;
  text: string;
  sourceName: string;
};

export const getMatchesFromEmbeddings = async (
  botId: string,
  index: VectorOperationsApi,
  embeddings: number[],
  topK: number,
): Promise<ScoredVector[]> => {
  const queryRequest = {
    vector: embeddings,
    topK,
    includeMetadata: true,
    filter: {
      botId,
    },
  };
  try {
    const queryResult = await index.query({
      queryRequest,
    });
    return (
      queryResult.matches?.map((match) => ({
        ...match,
        metadata: match.metadata as Metadata,
      })) || []
    );
  } catch (e) {
    console.log('Error querying embeddings: ', e);
    throw new Error(`Error querying embeddings: ${e}`);
  }
};
