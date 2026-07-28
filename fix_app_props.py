with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<TokenDetailPage \n          token={selectedToken} \n        />',
    '<TokenDetailPage \n          token={selectedToken} \n          onBack={() => setSelectedToken(null)} \n          onSwap={() => { setSelectedToken(null); handleNavigate("SWAP"); }}\n        />'
)

content = content.replace(
    '<CreatorPortalPage \n            walletConnected={isConnected}\n            walletAddress={address}\n            onNavigate={handleNavigate}\n          />',
    '<CreatorPortalPage \n            walletConnected={isConnected}\n            walletAddress={address}\n            onNavigate={handleNavigate}\n            onOpenWalletModal={openWallet}\n          />'
)

# And missing renderContent ? I need to fix it too!
content = content.replace('renderPage()', 'renderContent()')

with open('src/App.tsx', 'w') as f:
    f.write(content)
