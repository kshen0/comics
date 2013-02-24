import string
import operator
import json

def read_rid():
	f = open('RID.CAT', 'r')

	# current process, category, subcategory updated whenever new classification is found in file
	process = None 
	category = None 
	subcategory = None 


	for line in f:
		tabs = line.count("\t")
		if tabs == 0:
			process = line[:-1]
			RID[process] = {}
			process_count[process] = 0
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
				'''	
				if len(word) - 1 not in prefixes:
					prefixes[len(word) - 1] = {} 
				prefixes[len(word) - 1][word[:-1]] = categorization
				'''
				if len(word) not in prefixes:
					prefixes[len(word)] = {} 
				prefixes[len(word)][word] = categorization
			else:
				whole_words[word] = categorization
	f.close()


def record(categorization):
	process = categorization['process']
	cat = categorization['category']
	subcat = categorization['subcategory']
	process_count[process] += 1
	category_count[cat] += 1
	subcategory_count[subcat] += 1

def increment_freqs(word):
	if word not in word_freqs:
		word_freqs[word] = 0
	word_freqs[word] += 1
'''
def process_textfile(filename):
	global total_categorized
	f = open(filename, 'r')
	transcript = f.read().split("<br />")
	wordlist = []

	# create word list
	for i in xrange(1, len(transcript), 2):
		for word in transcript[i].translate(string.maketrans("",""), string.punctuation).split(" "):
			wordlist.append(word.upper())
	print len(wordlist)

	# tally each word
	for word in wordlist:
		categorization = None
		if word in whole_words:
			categorization = whole_words[word]
		else:
			for n in prefixes:
				prefix = word[:n] + '*'
				if prefix in prefixes[n]:
					word += '*'
					categorization = prefixes[n][prefix]
		if categorization:
			increment_freqs(word)
			total_categorized += 1
			record(categorization)
'''
def process_textfile(filename):
	f = open(filename, 'r')
	wordlist = []

	for i, line in enumerate(f):
		if i % 2 == 1:
			new_words = line.translate(string.maketrans("",""), string.punctuation).split()
			wordlist += [word.upper() for word in new_words]

	tally_words(wordlist)

def tally_words(wordlist):
	global total_categorized
	# tally each word
	for word in wordlist:
		categorization = None
		if word in whole_words:
			categorization = whole_words[word]
		else:
			for n in prefixes:
				prefix = word[:n] + '*'
				if prefix in prefixes[n]:
					word += '*'
					categorization = prefixes[n][prefix]
		if categorization:
			increment_freqs(word)
			total_categorized += 1
			record(categorization)

def parse_garkov_transcript():
	'''Parses transcript format provided by author of Garkov'''
	f = open('_garf.txt', 'r')
	wordlist = []

	for line in f:
		new_words = line.translate(string.maketrans("",""), string.punctuation).split()
		# if not comment
		if len(new_words) > 0 and "#" not in new_words[0]:
			wordlist += [word.upper() for word in new_words[1:]]

	tally_words(wordlist)

def parse_naive(filepath):
	'''Parses every word of a text file'''
	f = open(filepath, 'r')
	wordlist = []

	for line in f:
		new_words = line.translate(string.maketrans("",""), string.punctuation).split()
		if len(new_words) > 0:
			wordlist += [word.upper() for word in new_words]

	tally_words(wordlist)

def write_word_frequencies(filepath):
	'''Write word frequencies to json file'''
	with open(filepath, 'w') as outfile:
		json.dump(word_freqs, outfile)

def write_category_info(filepath, verbose=False):
	'''Writes the top 10 categories to json file'''
	# compute the percentage of words that fall into every category
	percentages = {}
	for subcat in subcategory_count:
		ratio = (float)(subcategory_count[subcat]) / total_categorized
		percentages[subcat] = ratio * 100

	# sort descending by percentage
	percentages = sorted(percentages.iteritems(), key=operator.itemgetter(1), reverse=True)[:num_categories]

	# create set of categories we care about
	categories = [] 
	cat_map = {}
	for (category, percent) in percentages:
		entry = {
					"name": category, 
					"percent": percent
				}
		cat_map[category] = entry
		categories.append(entry)


	# iterate over RID to find words associated with categories we care about
	# in this case, category refers to the second level and subcategory refers to the ones we care about
	# sorry, that's ugly
	for process in RID:
		for category in RID[process]:
			for subcategory in RID[process][category]:
				if subcategory in cat_map and verbose:
					# add list of words to output
					cat_map[subcategory]["words"] = RID[process][category][subcategory]



	# write top 10 categories to json file
	with open(filepath, 'w') as outfile:
		json.dump(categories, outfile)

num_categories = 10 # top x number of categories

def init():
	global words
	global category_info
	global process_count
	global category_count
	global subcategory_count
	global word_freqs
	global total_categorized

	words = [] # words in the text file
	category_info = {} # maps category to info: percentage, parent category, parent process, words found in text that belong in this category (?)

	# keep track of the number of words that fall into each process, category, and subcategory
	for p in process_count:
		process_count[p] = 0
	for c in category_count:
		category_count[c] = 0
	for s in subcategory_count:
		subcategory_count[s] = 0

	word_freqs = {} # number of times each word that has a match in the RID appears in the text file
	total_categorized = 0 # total number of words that found a match in the RID after processing


RID = {}
words = [] # words in the text file
whole_words = {} # whole words in RID file
prefixes = {} # glob patterns in RID file (e.g. BREAD*)

category_info = {} # maps category to info: percentage, parent category, parent process, words found in text that belong in this category (?)

# keep track of the number of words that fall into each process, category, and subcategory
process_count = {}
category_count = {}
subcategory_count = {}

word_freqs = {} # number of times each word that has a match in the RID appears in the text file
total_categorized = 0 # total number of words that found a match in the RID after processing

read_rid()
process_textfile('ch_transcript2.txt')
#write_word_frequencies('./calvindata/word_freqs.json')
#write_category_info('./calvindata/category_info.json', True)
p = process_count["PRIMARY"] / float(process_count["PRIMARY"] + process_count["SECONDARY"])
print str(p)
init()
process_textfile('garfield_transcript.txt')
parse_garkov_transcript()
#write_word_frequencies('./garfielddata/word_freqs.json')
#write_category_info('./garfielddata/category_info.json', True)
p = process_count["PRIMARY"] / float(process_count["PRIMARY"] + process_count["SECONDARY"])
print str(p)

# for parsing of speeches, etc for your own curiosity
'''
init()
parse_naive('filepath')
write_word_frequencies('output1.json')
write_category_info('output2.json')
'''


'''
# write RID to json file
with open('RID.json', 'w') as outfile:
	json.dump(RID, outfile)
'''
