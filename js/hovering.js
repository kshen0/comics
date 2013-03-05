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

// show "about" modal
$('#about').load('about.html', function() {
	setTimeout(function() { showAbout(); }, 2500);
});

var wordAssociations = {};

insertCharts();
function insertCharts() {
	var categoryList = [];
	for (var i = 0; i < calvinCategoryInfo.length; i ++) {
		categoryList.push(calvinCategoryInfo[i]['name']);
	}

	var values = getValueList(categoryList, calvinCategoryInfo, 1);
	$("#calvin-chart").sparkline(values, {
	    type: 'bar',
	    height: '50',
	    barWidth: 10,
	    barSpacing: 65});
	garfieldCategoryInfo = stupidSort(categoryList, garfieldCategoryInfo);
	values = getValueList(categoryList, garfieldCategoryInfo, -1);
	$("#garfield-chart").sparkline(values, {
	    type: 'bar',
	    height: '50',
	    barWidth: 10,
	    barSpacing: 65});
};

function stupidSort(valueOrderList, unsortedList) {
	var sorted = [];
	for (var i = 0; i < valueOrderList.length; i ++) {
		for (var j = 0; j < unsortedList.length; j ++) {
			if (valueOrderList[i] == unsortedList[j]['name']) {
				sorted.push(unsortedList[j]);
			}
		}
	}
	return sorted;
};

function getValueList(categoryList, catInfo, multiplier) {
	var values = [];
	for (var i = 0; i < categoryList.length; i ++) {
		values.push(multiplier * 
					Math.round(catInfo[i]['percent'] * 10) / 10);
	}
	return values;
	/*
	var values = [];
	for (var i = 0; i < categoryList.length; i ++) {
		for (var j = 0; j < catInfo.length; j ++) {
			if (catInfo[j]['name'] == categoryList[i]) {
				values.push(multiplier * 
							Math.round(catInfo[j]['percent'] * 10) / 10);
				break;
			}
		}

	}
	return values;
	*/
};

insertImages(
				{
					"div": "#calvin-images",
					"filenamePrefix": "./img/small/calvin_",
					"categoryInfo": calvinCategoryInfo,
					"class": "calvin-tile",
					"onclick": 'toggleClicked("calvin")',
				}
			);
insertImages(
				{
					"div": "#garfield-images",
					"filenamePrefix": "./img/small/garfield_",
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
		var filepath = params["filenamePrefix"] + name + '_small.png';

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
			highlightImage(name);
			displayStats(name);
		}
	},
	function() {
		if(!clicked["calvin"]) {
			var name = calvinCategoryInfo[this.id]['name'];
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
			highlightImage(name);
			displayStats(name);
		}
	},
	function() {
		if(!clicked["garfield"]) {
			var name = garfieldCategoryInfo[this.id]['name'];
			$("#calvin-stats").html("");
			$(".pane").css("display", "none");
			removePanes(name);
		}
	}
);

var conclusionVisible = false;
function toggleConclusion() {
	if (conclusionVisible) {
		$('#conclusion').css( {
								'position': 'absolute',
								'display': 'none'
							});
	}
	else {
		$('#conclusion').css( {
								'position': 'relative',
								'display': 'block'
							});
	}
	conclusionVisible = !conclusionVisible;

}

function removePanes(name) {
	$("."+name).each(function(i, obj) {
		if (i == 0) {
			var imgStr = 'img/small/calvin_' + name + '_small.png';
		}
		else {
			var imgStr = 'img/small/garfield_' + name + '_small.png';
		}
		$(this).children().attr('src', imgStr);
	});
};	

function highlightImage(name) {
	$("."+name).each(function(i, obj) {
		if (i == 0) {
			var imgStr = 'img/small/panes/calvin_' + name + '_pane_small.png';
		}
		if (i == 1) {
			var imgStr = 'img/small/panes/garfield_' + name + '_pane_small.png';
		}
		$(this).children().attr('src', imgStr);
	});
};

function displayStats(name) {

	var cInfo = getCategoryInfoByName(name, calvinCategoryInfo); 
	var gInfo = getCategoryInfoByName(name, garfieldCategoryInfo); 
	var cPercent = Math.floor(cInfo['percent'] * 10) / 10; // round to 2 decimal places
	var gPercent = Math.floor(gInfo['percent'] * 10) / 10; // round to 2 decimal places
	var cHeader = '<h3 class="calvin-text">' + cPercent + "%</h3>";
	var gHeader = '<h3 class="garf-text">' + gPercent + "%</h3>";
	var wordStr = getWordsAsString(cInfo);
	$("#calvin-stats").html("<h3>" + translations[name] + "</h3>" +
							"<br>" + 
							cHeader + "    |    " + gHeader +
							wordStr );
	/*
	$("#calvin-stats").html("<h3>" + translations[name] + ": " + 
							percent +  "%</h3><br>" + '<div class="wordlist"><p>' + 
							getWordsAsString(params) + "</div>");
*	*/

	/*
	var params = {
		"charName": "calvin",
		"info": info, 
		"freq": calvin_frequencies,
	}
	*/
	/*
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
	*/
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

function getWordsAsString(wordDict) {
	var name = wordDict['name'];
	if(name in wordAssociations) {
		return wordAssociations[name];
	}

	var str = '<div style="display: inline-block">';
	var wordlist = wordDict['words'];
	for(var i = 0; i < wordlist.length; i ++) {
		var word = wordlist[i];
		var color = null;
		// if in both transcripts, make bold
		if (word in calvin_frequencies && word in garfield_frequencies) {
			color = "#000";
			word =  '<strong>' + word + '</strong>';	
		}
		// word in calvin only, make blue
		else if (word in calvin_frequencies) {
			color = '#0000f0';
		}
		// word in garfield only, make orange
		else if (word in garfield_frequencies) {
			color = '#FCA519';	
		}
		if (color != null) {
			word = '<div style="display: inline-block; color: ' + color + '">' + 
					word + "</div>";	
		}
		else {
			word = '<div style="display: inline-block">' + 
					word + "</div>";	
		}

		str += word.toLowerCase() + ' ';
	}
	str + "</div>";
	wordAssociations[name] = str;
	return str;
	/*
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
	*/
}
