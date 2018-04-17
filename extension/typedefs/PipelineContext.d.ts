import * as Logger from 'bunyan'
  
interface PipelineContext {
  config: PipelineConfiguration
  log: Logger

  storage: PipelineStorageContainer
}

interface PipelineStorageGetCallback {
  (err: Error | null, value: string | number | Object): void
}

interface PipelineStorageDelCallback {
  (err: Error | null, value: string | number | Object): void
}

interface PipelineStorageSetCallback {
  (err: Error | null, value: string | number | Object): void
}

interface PipelineStorage {
  get(key: string, callback: PipelineStorageGetCallback)

  set(key: string, value: string | number | Object, callback: PipelineStorageSetCallback)

  del(key: string, callback: PipelineStorageDelCallback)
}

interface PipelineStorageContainer {
  user: PipelineStorage
  device: PipelineStorage
  extension: PipelineStorage
}

interface PipelineConfiguration {
  storeHash: string
  clientId: string
  clientSecret: string
  accessToken: string
  requestTimeout: string
  storeDomain?: string
}
