// Set async to false so we load all data before proceeding
$.ajaxSetup( {"async": false} );

// load info for categories
var calvinCategoryInfo = [];
$.getJSON('./calvindata/category_info.json', function(data) {
	calvinCategoryInfo = data;
});

// load name mappings (e.g. INSTRU_BEHAVIOR --> Instrumenal Behavior)
var translations = {};
$.getJSON('./translation.json', function(data) {
	translations = data;
});

// load word frequencies
var frequencies = {};
$.getJSON('./calvindata/word_freqs.json', function(data) {
	frequencies = data;
});

var wordAssociations = {};
// load RID
/*
var RID = {};
$.getJSON('./RID.json', function(data) {
	RID = data;
});
*/

var imagesBox = $('#images-box');
// insert images and top 10 text into page
for (var i = 0; i < calvinCategoryInfo.length; i++) {
	console.log(i);
	var category = calvinCategoryInfo[i];
	var name = category['name'];
	var percent = category['percent'];
	var wordList = category['words'];
	var filepath = '/img/calvin_' + name + '.png';

	var img = $('<img></img>').attr(
				{
					'src': filepath,
				})
	var imgdiv = $('<div class="tile"></div>')
		.attr('id', i)
		.append(img);
	imagesBox.append(imgdiv);
}

imagesBox.append($('<span class="stretch"></span>'));

$(".tile").hover(
	function() {
		var info = calvinCategoryInfo[this.id];
		//$("#stats").html("<h3>" + calvinCategoryInfo[this.id][name] + "</h3><br>" + word_associations[this.id]);
		$("#stats").html("<h3>" + translations[info['name']]+ "</h3><br>" + getWordsAsString(info));
	},
	function() {
		$("#stats").html("");
	}
);

function getWordsAsString(info) {
	var name = info['name'];
	if(name in wordAssociations) {
		return wordAssociations[name];
	}

	var str = '';
	var wordlist = info['words'];
	for(var i = 0; i < wordlist.length; i ++) {
		var word = wordlist[i];
		str += wordlist[i].toLowerCase() + ' ';
	}
	wordAssociations['name'] = str;
	return str;
}

// load word associations for all top percentage categories
/*
function load_word_associations() {
	var word_associations = {};
	for (process in RID) {
		for (category in process) {
			for (subcategory in category) {
				word_associations[subcategory] = 
			}
		}
	}

};
*/


/*
calvin_percentages = {
	"morality": "Moral Imperative: 2.58%",
	"affection": "Affection: 3.27%",
	"aggression": "Aggression: 3.53%",
	"orality": "Orality: 3.75%",
	"vision": "Vision: 5.56%",
	"constructive": "Constructive Behavior: 6.97%",
	"social": "Social Behavior: 7.47%",
	"time": "Time: 10.87%",
	"concreteness": "Concreteness: 12.45%",
	"abstract": "Abstract thought: 12.72%"
}

*/
