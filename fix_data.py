with open('src/data.ts', 'r') as f:
    content = f.read()

bitmask_token = """
  {
    id: 'bts',
    name: 'Bitmask',
    symbol: 'BTS',
    pair: 'BTS/USST',
    chain: 'BEP-20',
    price: '1.4',
    priceChange: 0,
    listedAt: '2 Minutes ago',
    contract: '0xf504a700fe1ec44a565cd4b5a2f6c6f536b5fb98',
    creator: '0xUnknown',
    addLpTx: '0x...',
    renounceTx: '0x...',
    lockLpTx: '0x...',
    ammVersion: 'AMM V2',
    logo: 'https://picsum.photos/seed/bitmask/200/200',
    wallpaper: 'https://picsum.photos/seed/bitmask_bg/1200/400',
    totalSupply: '70,000,000',
    marketCap: '$98,000,000',
    stories: [
      {
        id: 's1',
        tokenId: 'bts',
        imageUrl: 'https://picsum.photos/seed/bitmask_story1/800/1200',
        text: 'The Bitmask token has been officially launched on the New Alpha platform.',
        timestamp: Date.now()
      }
    ]
  }
"""

content = content.replace(
    'export const mockTokensTestnet: Token[] = [];',
    f'export const mockTokensTestnet: Token[] = [{bitmask_token}];'
)
content = content.replace(
    'export const mockTokensMainnet: Token[] = [];',
    f'export const mockTokensMainnet: Token[] = [{bitmask_token}];'
)

with open('src/data.ts', 'w') as f:
    f.write(content)
