const generateIndexFile =
  () => `////////////////////////////////////////////////////////////////////////////////////////////////////
// DO NOT MODIFY THIS FILE                                                                        //
// This file is automatically generated by LightningDB Plugin and should not be manually updated. //
////////////////////////////////////////////////////////////////////////////////////////////////////

import {
  useCache,
  baseUseMutation,
  baseUseQuery,
  generateProvider,
  type SelectSubset,
  type QueryType,
} from "@lightningdb/client";
import { LightningDB } from "./schema";

const useQuery = <Query extends QueryType>(
  query: SelectSubset<
    Query,
    LightningDB.TopLevelQueries,
    LightningDB.AliasQueries
  >,
) => baseUseQuery<Query, LightningDB.Models, LightningDB.SingleModels>(query);
const useMutation = (
  mutation: LightningDB.MutationInput | LightningDB.MutationInput[],
) => baseUseMutation(mutation);

const DBProvider = generateProvider(
  LightningDB.lightningSchema,
  LightningDB.includesMap,
);

export { DBProvider, useQuery, useCache, useMutation };
`

export default generateIndexFile
