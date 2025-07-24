import React, { useState, useRef, useMemo, useCallback } from "react"
import { QueryStoreState } from "../types.js"
import { DBContext, MutationInputType, QueryList } from "../context.js"
import { useWebSocket } from "../useWebSocket.js"
import { z } from "zod"
import { MutationState } from "../useMutation.js"
import useCache, { Cache, CacheValue } from "../cache.js"
import mergeCacheValue from "../helpers/mergeCacheValue.js"
import { applyWhere } from "../whereClauses.js"
import { Includes } from "../baseTypes.js"

const basicSchema = z.object({
  queryId: z.number().optional(),
})

type BaseSchema = z.ZodType<{
  error?: any
  data?: Record<string, CacheValue[]>
  deletes?: Record<string, { id: number }[]>
  queryId?: number
}>

const generateProvider =
  (
    schema: BaseSchema,
    includesMap: Includes,
  ): React.FC<{
    url: string
    children: React.ReactNode
  }> =>
  ({ url, children }) => {
    const { cache, internalCache, updateCache, removeCache } = useCache({})
    const [queryStates, setQueryStates] = useState<
      Map<number, QueryStoreState>
    >(new Map())
    const [mutationStates, setMutationStates] = useState<
      Map<number, MutationState>
    >(new Map())
    const queryIdCounter = useRef<number>(0)
    const tempIdCounter = useRef<number>(-1)
    const cacheHistory = useRef<Map<number, Cache>>(new Map())
    const tempModels = useRef<
      Map<number, { model: string; tempId: number | string }[]>
    >(new Map())

    const handleMessage = (message: unknown) => {
      const basicResult = basicSchema.safeParse(message)

      if (!basicResult.success) {
        console.error("Invalid message received:", basicResult.error)
        return
      }

      const queryId = basicResult.data.queryId

      try {
        const result = schema.safeParse(message)
        if (!result.success) {
          console.error("Invalid message received:", result.error)
          return
        }

        if ("error" in result.data) {
          if (queryId !== undefined && cacheHistory.current.has(queryId)) {
            const history = cacheHistory.current.get(queryId)

            if (history) updateCache(history)
            cacheHistory.current.delete(queryId)
          }
          throw new Error(JSON.stringify(result.data.error))
        }

        if ("data" in result.data) {
          const tempModel = queryId
            ? tempModels.current.get(queryId)
            : undefined
          console.log("tempModel", queryId, tempModel)

          if (tempModel) {
            const tempsToRemove: Record<string, (number | string)[]> = {}
            tempModel.forEach(({ model, tempId }) => {
              if (!tempsToRemove[model]) tempsToRemove[model] = []
              tempsToRemove[model].push(tempId)
            })

            console.log("tempsToRemove", tempsToRemove)

            removeCache(tempsToRemove)
          }

          updateCache(prevCache => {
            const newCache = { ...prevCache }
            Object.entries(result.data.data!).forEach(([key, values]) => {
              if (!newCache[key]) {
                newCache[key] = values
              } else {
                mergeCacheValue(newCache, key, values)
              }
            })
            return newCache
          })

          if (queryId !== undefined) {
            cacheHistory.current.delete(queryId)
          }
        }

        if ("deletes" in result.data) {
          const deletesToRemove = Object.entries(result.data.deletes!).reduce<
            Record<string, number[]>
          >((acc, [key, values]) => {
            acc[key] = values.map(v => v.id)
            return acc
          }, {})

          removeCache(deletesToRemove)
        }

        // Update loading state for both queries and mutations
        if (queryId !== undefined) {
          setQueryStates(prev => {
            const next = new Map(prev)
            if (next.has(queryId)) {
              next.set(queryId, {
                error: undefined,
                isLoading: false,
              })
            }
            return next
          })

          // Clear mutation loading state
          setMutationStates(prev => {
            const next = new Map(prev)
            next.delete(queryId)
            return next
          })
        }
      } catch (error) {
        if (!(error instanceof Error)) throw error

        console.error("Error parsing message:", error)

        if (queryId === undefined) throw error
        // Use queryId to set isLoading to false and error to the error for queryStates and mutationStates based on the queryId
        setQueryStates(prev => {
          const next = new Map(prev)
          if (next.has(queryId)) {
            next.set(queryId, {
              error,
              isLoading: false,
            })
          }
          return next
        })

        // Use queryId to set isLoading to false and error to the error for queryStates and mutationStates based on the queryId
        setMutationStates(prev => {
          const next = new Map(prev)
          next.set(queryId, { isLoading: false, error })
          return next
        })
      }
    }

    const { sendMessage } = useWebSocket({
      url,
      onMessage: handleMessage,
    })

    const sendQuery = useCallback(
      (queries: QueryList) => {
        const queryId = ++queryIdCounter.current

        // Set query state immediately
        setQueryStates(prev => {
          const next = new Map(prev)
          if (!next.has(queryId)) {
            next.set(queryId, {
              error: undefined,
              isLoading: true,
            })
          }
          return next
        })

        const message = JSON.stringify({ queries, queryId })

        // Send message with queryId
        sendMessage(message)
        return queryId
      },
      [sendMessage],
    )

    const sendMutation = useCallback(
      (mutation: MutationInputType | MutationInputType[]) => {
        const mutations = Array.isArray(mutation) ? mutation : [mutation]
        const queryId = ++queryIdCounter.current
        const message = JSON.stringify({ mutations, queryId })

        // Create a deep copy of the cache for history
        const deepCacheCopy = JSON.parse(JSON.stringify(cache))
        cacheHistory.current.set(queryId, deepCacheCopy)

        // Optimistically update cache
        updateCache(prevCache => {
          const newCache = { ...prevCache }

          const newTempModels: { model: string; tempId: number | string }[] = []

          mutations.forEach(mut => {
            const modelKey = Object.keys(mut)[0] as string
            const operationKey = mut[modelKey]

            if (!operationKey) throw new Error("Operation key not found")

            const operation = Object.keys(
              operationKey,
            )[0] as keyof typeof operationKey

            if (!newCache[modelKey]) newCache[modelKey] = []

            switch (operation) {
              case "create":
                const createData = operationKey.create
                if (!createData) throw new Error("Create data not found")

                // Only set temp models if they haven't been set for this queryId yet
                if (!tempModels.current.has(queryId)) {
                  const tempId = tempIdCounter.current--
                  newCache[modelKey].push({
                    ...createData.data,
                    id: tempId,
                  })
                  newTempModels.push({ model: modelKey, tempId })
                }
                break
              case "createMany":
                const createManyData = operationKey.createMany
                if (!createManyData)
                  throw new Error("CreateMany data not found")

                // Only set temp models if they haven't been set for this queryId yet
                if (!tempModels.current.has(queryId)) {
                  const tempIds = createManyData.data.map(
                    () => tempIdCounter.current--,
                  )
                  newCache[modelKey].push(
                    ...createManyData.data.map((d, index) => ({
                      ...d,
                      id: tempIds[index],
                    })),
                  )
                  tempIds.forEach(tempId => {
                    newTempModels.push({ model: modelKey, tempId })
                  })
                }
                break
              case "update":
                const updateData = operationKey.update
                if (!updateData) throw new Error("Update data not found")

                const updateId = updateData.where.id
                if (updateId === undefined) {
                  throw new Error(
                    "Update operation requires an 'id' in the where clause",
                  )
                }
                const updateIndex = newCache[modelKey].findIndex(
                  v => v.id === updateId,
                )
                if (updateIndex !== -1) {
                  newCache[modelKey][updateIndex] = {
                    ...newCache[modelKey][updateIndex],
                    ...updateData.data,
                  }
                }
                break
              case "updateMany":
                const updateManyData = operationKey.updateMany
                if (!updateManyData)
                  throw new Error("UpdateMany data not found")

                const updateManyWhere = updateManyData.where

                if (!updateManyWhere) {
                  newCache[modelKey] = newCache[modelKey].map(v => ({
                    ...v,
                    ...updateManyData.data,
                  }))
                } else {
                  const filteredCache = newCache[modelKey].filter(item =>
                    Object.entries(updateManyWhere).every(([field, value]) =>
                      applyWhere(
                        modelKey,
                        field,
                        value,
                        item,
                        includesMap,
                        newCache,
                      ),
                    ),
                  )

                  filteredCache.forEach(item => {
                    item = {
                      ...item,
                      ...updateManyData.data,
                    }
                  })
                }
                break
              case "upsert":
                const upsertData = operationKey.upsert
                if (!upsertData) throw new Error("Upsert data not found")

                const upsertId = upsertData.where.id
                if (upsertId === undefined) {
                  throw new Error(
                    "Upsert operation requires an 'id' in the where clause",
                  )
                }
                const upsertIndex = newCache[modelKey].findIndex(
                  v => v.id === upsertId,
                )
                if (upsertIndex !== -1) {
                  newCache[modelKey][upsertIndex] = {
                    ...newCache[modelKey][upsertIndex],
                    ...upsertData.create,
                  }
                } else {
                  newCache[modelKey].push({
                    ...upsertData.create,
                    id: upsertId,
                  })
                  newTempModels.push({ model: modelKey, tempId: upsertId })
                }
                break
              case "delete":
                const deleteData = operationKey.delete
                if (!deleteData) throw new Error("Delete data not found")

                const deleteId = deleteData.where.id
                if (deleteId === undefined) {
                  throw new Error(
                    "Delete operation requires an 'id' in the where clause",
                  )
                }
                newCache[modelKey] = newCache[modelKey].filter(
                  v => v.id !== deleteId,
                )
                break
              case "deleteMany":
                const deleteManyData = operationKey.deleteMany
                if (!deleteManyData)
                  throw new Error("DeleteMany data not found")

                const where = deleteManyData.where

                if (!where) {
                  newCache[modelKey] = []
                } else {
                  newCache[modelKey] = newCache[modelKey].filter(item =>
                    Object.entries(where).every(([field, value]) =>
                      applyWhere(
                        modelKey,
                        field,
                        value,
                        item,
                        includesMap,
                        newCache,
                      ),
                    ),
                  )
                }
                break
            }
          })

          if (newTempModels.length > 0) {
            console.log("newTempModels", queryId, newTempModels)
            tempModels.current.set(queryId, newTempModels)
          }

          return newCache
        })

        // Set mutation loading state
        setMutationStates(prev => {
          const next = new Map(prev)
          next.set(queryId, { isLoading: true, error: undefined })
          return next
        })

        sendMessage(message)
        return queryId
      },
      [sendMessage, cache],
    )

    const value = useMemo(
      () => ({
        includesMap,
        cache,
        internalCache,
        updateCache,
        sendQuery,
        sendMutation,
        queryStates,
        mutationStates,
      }),
      [cache, internalCache, sendQuery, queryStates, mutationStates],
    )

    return <DBContext.Provider value={value}>{children}</DBContext.Provider>
  }

export default generateProvider
