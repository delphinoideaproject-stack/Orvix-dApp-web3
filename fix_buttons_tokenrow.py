with open('src/components/TokenRow.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''        <Button 
          variant="primary"
          className="flex-1 justify-center text-sm sm:text-base py-3.5 sm:py-4 font-semibold rounded-2xl" 
          size="lg" 
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.('SWAP');
          }}
        >
          Trade
        </Button>''',
'''        <Button 
          variant="primary"
          className="flex-1 justify-center font-black uppercase tracking-widest text-[10px] rounded-sm py-2" 
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.('SWAP');
          }}
        >
          TRADE NOW
        </Button>''')

with open('src/components/TokenRow.tsx', 'w') as f:
    f.write(content)
