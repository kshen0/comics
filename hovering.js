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

$('#about').load('about.html', function() {
	setTimeout(function() { showAbout(); }, 2500);
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

function showAbout() {
	$('#about').fadeIn('slow', function() {});
	$('#greyout').fadeIn('slow', function() {});
};

function hideAbout() {
	$('#about').fadeOut('slow', function() {});
	$('#greyout').fadeOut('slow', function() {});
};

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
			.append(img)
			.addClass(name);
		imagesBox.append(imgdiv);
	}

	// Insert stretch span for even distribution of tiles
	imagesBox.append($('<span class="stretch"></span>'));
}

var clicked = {"calvin": false, "garfield": false};

$(".calvin-tile").hover(
	function() {
		if(!clicked["calvin"]) {
			var name = calvinCategoryInfo[this.id]['name'];
			displayStats(name);
		}
	},
	function() {
		if(!clicked["calvin"]) {
			var name = calvinCategoryInfo[this.id]['name'];
			$("#calvin-percent").html("");
			$("#calvin-stats").html("");
			$(".pane").css("display", "none");
			removePanes(name);
		}
	}
);

$(".garfield-tile").hover(
	function() {
		if(!clicked["garfield"]) {
			var name = garfieldCategoryInfo[this.id]['name'];
			displayStats(name);
		}
	},
	function() {
		if(!clicked["garfield"]) {
			var name = garfieldCategoryInfo[this.id]['name'];
			$("#garfield-percent").html("");
			$("#garfield-stats").html("");
			$(".pane").css("display", "none");
			removePanes(name);
		}
	}
);

function removePanes(name) {
	$("."+name).each(function(i, obj) {
		if (i == 0) {
			var imgStr = 'img/calvin_' + name + '.png';
		}
		else {
			var imgStr = 'img/garfield_' + name + '.png';
		}
		$(this).children().attr('src', imgStr);
	});
};	

function displayStats(name) {
	$("."+name).each(function(i, obj) {
		if (i == 0) {
			var imgStr = 'img/panes/calvin_' + name + '_pane.png';
		}
		if (i == 1) {
			var imgStr = 'img/panes/garfield_' + name + '_pane.png';
		}
		$(this).children().attr('src', imgStr);
	});

	var info = getCategoryInfoByName(name, calvinCategoryInfo); 
	var params = {
		"charName": "calvin",
		"info": info, 
		"freq": calvin_frequencies,
	}
	var percent = Math.floor(info['percent'] * 100) / 100; // round to 2 decimal places
	$("#calvin-stats").html("<h3>" + translations[name] + ": " + 
							percent +  "%</h3><br>" + '<div class="wordlist"><p>' + 
							getWordsAsString(params) + "</div>");

	info = getCategoryInfoByName(name, garfieldCategoryInfo); 
	params = {
		"charName": "garfield",
		"info": info,
		"freq": garfield_frequencies,
	}
	percent = Math.floor(info['percent'] * 100) / 100; // round to 2 decimal places
	$("#garfield-stats").html("<h3>" + translations[name] + ": " + 
							  percent +  "%</h3><br>" + '<div class="wordlist"><p>' + 
							  getWordsAsString(params) + "</div>");
};

function getCategoryInfoByName(name, categoryInfo) {
	for (var i = 0; i < categoryInfo.length; i ++) {
		if (categoryInfo[i]['name'] == name) {
			return categoryInfo[i];
		}	
	}
	return null;
};

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
