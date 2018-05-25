fo = open("solo2.svg", "r")
txt = fo.readlines()
#print(txt[0:10])

text = ''
for t in txt:
    #print(t[0:10])
    if t.strip().startswith('d="m'):
        text = t.strip()
        

text = text[3:]
new_text = []

temp = []

for i in range(len(text)):
    if i % 80 == 0:
        new_text.append(''.join(temp))
        temp = []
    
    temp.append(text[i])
        
new_text.append(''.join(temp))

del new_text[0]

for i in range(len(new_text)):
    new_text[i] = '"' + new_text[i] + '" +'
    
for t in new_text:
    print(t)
    
    
       
        
        