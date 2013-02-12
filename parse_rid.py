import string
import operator

f = open('RID.CAT', 'r')

process = None 
category = None 
subcategory = None 

RID = {}
words = []
whole_words = {}
prefixes = {}

category_count = {}
subcategory_count = {}

for line in f:
	tabs = line.count("\t")
	if tabs == 0:
		process = line[:-1]
		RID[process] = {}
	elif tabs == 1:
		category = line[1:-1]
		RID[process][category] = {}
		category_count[category] = 0
	elif tabs == 2:
		subcategory = line[2:-1]
		words = []
		RID[process][category][subcategory] = words 
		subcategory_count[subcategory] = 0
	else:
		word = line[3:-5]

		# for RID
		words.append(word)

		# for inverse RID
		categorization = {'process': process,
						  'category': category,
						  'subcategory': subcategory } 

		if word[-1] == '*':
			if len(word) - 1 not in prefixes:
				prefixes[len(word) - 1] = {} 
			prefixes[len(word) - 1][word[:-1]] = categorization
		else:
			whole_words[word] = categorization


f.close()
#print RID
#print prefixes
#print whole_words


def record(categorization):
	cat = categorization['category']
	subcat = categorization['subcategory']
	category_count[cat] += 1
	subcategory_count[subcat] += 1

f = open('ch_transcript.txt', 'r')
transcript = f.read().split("<br />")
wordlist = []
total_categorized = 0

# create word list
for i in xrange(1, len(transcript), 2):
	for word in transcript[i].translate(string.maketrans("",""), string.punctuation).split(" "):
		wordlist.append(word.upper())

for word in wordlist:
	categorization = None
	if word in whole_words:
		categorization = whole_words[word]
	else:
		for n in prefixes:
			prefix = word[:n]
			if prefix in prefixes[n]:
				categorization = prefixes[n][prefix]
	if categorization:
		total_categorized += 1
		record(categorization)
print category_count
print subcategory_count
print "total categorized: ", total_categorized
print "total words: ", len(wordlist)

percentages = {}
for subcat in subcategory_count:
	ratio = (float)(subcategory_count[subcat]) / total_categorized
	percentages[subcat] = ratio * 100

print sorted(percentages.iteritems(), key=operator.itemgetter(1))

s = ""
for elem in RID['SECONDARY']['NO_CATEGORY']['ABSTRACT_TOUGHT']:
	s += elem.lower() + ' '

print s

