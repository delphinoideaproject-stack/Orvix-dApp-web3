import re

# Update src/swap-components/constants/contracts.ts
with open('src/swap-components/constants/contracts.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r"address: '0xF504A700fe1eC44A565cd4b5a2f6c6f536b5FB98',\s*symbol: 'BTS',\s*name: 'BTS Token'",
    "address: '0xf504a700fe1ec44a565cd4b5a2f6c6f536b5fb98',\n    symbol: 'BTS',\n    name: 'Bitmask'",
    content,
    flags=re.IGNORECASE
)

content = re.sub(
    r"address: '0x0b826aFC12380Cd138ED9e7211631033fa51716F',\s*symbol: 'USST',\s*name: 'USST Token'",
    "address: '0x0b826aFC12380Cd138ED9e7211631033fa51716F',\n    symbol: 'USST',\n    name: 'USST Token'",
    content,
    flags=re.IGNORECASE
)

with open('src/swap-components/constants/contracts.ts', 'w') as f:
    f.write(content)

# Update src/components/TokenModal.tsx
with open('src/components/TokenModal.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r"id: 'usst',\s*name: 'USST Token',\s*symbol: 'USST',\s*contract: '[^']+'",
    "id: 'usst',\n    name: 'USST Token',\n    symbol: 'USST',\n    contract: '0x0b826aFC12380Cd138ED9e7211631033fa51716F'",
    content,
    flags=re.IGNORECASE
)

content = re.sub(
    r"id: 'bts',\s*name: 'BTS Token',\s*symbol: 'BTS',\s*contract: '[^']+'",
    "id: 'bts',\n    name: 'Bitmask',\n    symbol: 'BTS',\n    contract: '0xf504a700fe1ec44a565cd4b5a2f6c6f536b5fb98'",
    content,
    flags=re.IGNORECASE
)

with open('src/components/TokenModal.tsx', 'w') as f:
    f.write(content)
