// Set async to false so we load all data before proceeding
$.ajaxSetup( {"async": false} );

// load info for categories
var calvinCategoryInfo = [];
$.getJSON('./calvindata/category_info.json', function(data) {
	calvinCategoryInfo = data;
});

// load info for Garfield categories
var garfieldCategoryInfo = [];
$.getJSON('./garfielddata/category_info.json', function(data) {
	garfieldCategoryInfo = data;
});

// load name mappings (e.g. INSTRU_BEHAVIOR --> Instrumenal Behavior)
var translations = {};
$.getJSON('./translation.json', function(data) {
	translations = data;
});

// load word frequencies
var calvin_frequencies = {};
$.getJSON('./calvindata/word_freqs.json', function(data) {
	calvin_frequencies = data;
});

var garfield_frequencies = {};
$.getJSON('./garfielddata/word_freqs.json', function(data) {
	garfield_frequencies = data;
});

var wordAssociations = {};

insertImages(
				{
					"div": "#calvin-images",
					"filenamePrefix": "./img/calvin_",
					"categoryInfo": calvinCategoryInfo,
					"class": "calvin-tile",
					"onclick": 'toggleClicked("calvin")',
				}
			);
insertImages(
				{
					"div": "#garfield-images",
					"filenamePrefix": "./img/garfield_",
					"categoryInfo": garfieldCategoryInfo,
					"class": "garfield-tile",
					"onclick": 'toggleClicked("garfield")',
				}
			);

function insertImages(params) {
	//var imagesBox = $('#images-box');
	var imagesBox = $(params["div"]);
	var categoryInfo = params["categoryInfo"];
	// insert images and top 10 text into page
	for (var i = 0; i < categoryInfo.length; i++) {
		var category = categoryInfo[i];
		var name = category['name'];
		var percent = category['percent'];
		var wordList = category['words'];
		//var filepath = '/img/calvin_' + name + '.png';
		var filepath = params["filenamePrefix"] + name + '.png';

		var img = $('<img/>').attr(
					{
						'src': filepath,
					})
		var imgdiv = $('<div></div>')
			.addClass(params["class"] + " tile")
			.attr(
				{
					'id': i,
					'onclick': params['onclick'],
				})
			.append(img);
		imagesBox.append(imgdiv);
	}

	// Insert stretch span for even distribution of tiles
	imagesBox.append($('<span class="stretch"></span>'));
}

var clicked = {"calvin": false, "garfield": false};

$(".calvin-tile").hover(
	function() {
		if(!clicked["calvin"]) {
			var info = calvinCategoryInfo[this.id];
			var percent = Math.floor(info['percent'] * 100) / 100; // round to 2 decimal places
			var params = {
				"charName": "calvin",
				"info": info,
				"freq": calvin_frequencies,
			}
			$("#calvin-stats").html("<h3>" + translations[info['name']] + ": " + percent +  "%</h3><br>" + '<div class="wordlist"><p>' + getWordsAsString(params) + "</div>");
		}
	},
	function() {
		if(!clicked["calvin"]) {
			$("#calvin-percent").html("");
			$("#calvin-stats").html("");
		}
	}
);

$(".garfield-tile").hover(
	function() {
		if(!clicked["garfield"]) {
			var info = garfieldCategoryInfo[this.id];
			var percent = Math.floor(info['percent'] * 100) / 100; // round to 2 decimal places
			var params = {
				"charName": "garfield",
				"info": info,
				"freq": garfield_frequencies,
			}
			$("#garfield-percent")
				.html("<h4>" + translations[info['name']] + ": " + percent + "%</h4>")
				.css("height", "25px");

			$("#garfield-stats").html("<h3>" + translations[info['name']] + ": " + percent +  "%</h3><br>" + '<div class="wordlist"><p>' + getWordsAsString(params) + "</div>");
		}
	},
	function() {
		if(!clicked["garfield"]) {
			$("#garfield-percent").html("");
			$("#garfield-stats").html("");
		}
	}
);

// TODO: grey out other boxes
function toggleClicked(comicChar) {
	clicked[comicChar] = !clicked[comicChar];
	toggleModal();
};

var modal = false;
function toggleModal() {
	if(modal) {
		$(".modal").css("display", "none");
	}
	else {
		$(".modal").css("display", "block");
	}
	modal = !modal;
}

// params {"name": "charactername", "info", category info dict, "freq": word frequencies}
function getWordsAsString(params) {
	var info = params["info"];
	var name = params["charName"] + info['name'];
	var frequencies = params["freq"];
	console.log(name);
	if(name in wordAssociations) {
		return wordAssociations[name];
	}

	var str = '<div style="display: inline-block">';
	var wordlist = info['words'];
	for(var i = 0; i < wordlist.length; i ++) {
		var word = wordlist[i];
		if(word in frequencies) {
			word = '<div style="display: inline-block; color: #000">' + word + "</div>";	
		}
		str += word.toLowerCase() + ' ';
	}
	str + "</div>";
	wordAssociations[name] = str;
	return str;
}
