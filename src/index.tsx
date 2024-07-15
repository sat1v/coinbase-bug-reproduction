import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { createSystem } from 'frog/ui';

export const { Text, Box } = createSystem();

export const View = (props: { text: string }) => {
  return <Box display="flex" alignItems="center" justifyContent="center" grow><Text color={{ custom: '#ffffff' }}>
    {props.text}
  </Text>
  </Box>
}

export const app = new Frog({
  title: 'Coinbase issue reproduction',
  initialState: {}
})

app.use('/*', serveStatic({ root: './public' }))

app.frame('/tx-3', async (c) => {
  console.log({ frameData: c.frameData });


  return c.res({ image: <View text="Success" /> })
})

app.transaction('/tx-2', async (c) => {
  return c.send({
    chainId: 'eip155:8453',
    to: '0x96BAbe8595ed944B01499200B7Cfd230f8db3558',
    value: BigInt('1')
  })
})

app.frame('/tx-1', (c) => {
  return c.res({
    image: <View text="Initial frame" />,
    intents: [
      <Button.Transaction action="/tx-3" target="/tx-2">Send tx</Button.Transaction>
    ],
  })
})

app.frame('/sign-3', async (c) => {
  console.log({ frameData: c.frameData });


  return c.res({ image: <View text="Success" /> })
})

app.signature('/sign-2', async (c) => {
  return c.signTypedData({
    chainId: 'eip155:8453',
    "primaryType": "Mail",
    "domain": {
      "name": "Ether Mail",
      "version": "1",
      "chainId": 8453,
      "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
    },
    types: {
      "Person": [
        { "name": "name", "type": "string" },
        { "name": "wallet", "type": "address" }
      ],
      "Mail": [
        { "name": "from", "type": "Person" },
        { "name": "to", "type": "Person" },
        { "name": "contents", "type": "string" }
      ]
    },
    message: {
      "from": {
        "name": "Cow",
        "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"
      },
      "to": {
        "name": "Bob",
        "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
      },
      "contents": "Hello, Bob!"
    }
  })
})

app.frame('/sign-1', (c) => {
  return c.res({
    image: <View text="Initial frame" />,
    intents: [
      <Button.Signature action="/sign-3" target="/sign-2">Sign</Button.Signature>
    ],
  })
})

const port = 3000
console.log(`Server is running on port ${port}`)

devtools(app, { serveStatic })

serve({
  fetch: app.fetch,
  port,
})
