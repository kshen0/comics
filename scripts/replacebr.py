f = open('ch_transcript.txt', 'r')
out = f.read().replace('<br />', '\n')
with open('ch_transcript2.txt', 'w') as output:
	output.write(out)
