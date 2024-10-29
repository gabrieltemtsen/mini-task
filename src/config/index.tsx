import { cookieStorage, createStorage, } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { morphHolesky } from '@reown/appkit/networks'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '08e98e52e456055a2826f902cc6639af'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [morphHolesky]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig