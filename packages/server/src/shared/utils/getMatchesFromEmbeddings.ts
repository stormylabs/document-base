import { ScoredVector } from '@pinecone-database/pinecone';
import { PineconeClientService } from 'src/module/pinecone/pinecone.service';

export type Metadata = {
  url: string;
  text: string;
  chunk: string;
};

export const getMatchesFromEmbeddings = async (
  embeddings: number[],
  pineconeService: PineconeClientService,
  tag: string,
  topK: number,
): Promise<ScoredVector[]> => {
  const index = pineconeService.index;
  const queryRequest = {
    vector: embeddings,
    topK,
    includeMetadata: true,
    filter: {
      tag,
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
