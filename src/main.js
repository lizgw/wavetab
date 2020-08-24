// page elements
var timeElem = document.getElementById("time");
var dateElem = document.getElementById("date");
var container = document.getElementById("container");

// flags
var showingOptions = false;

// storage object for options
var options = {};
var dateString = "ungenerated";

// setup everything once the page loads
document.addEventListener("DOMContentLoaded", initialize);

function initialize()
{
	// build the date string
	formatDateString();

	// load options from storage
	restoreOptions();

	// setup time and date
	updateTime();
	updateDate();
	setInterval(updateTime, 999);
	setInterval(updateDate, 1500);

	// load gradient data file
	readFile();

	// setup event listeners for buttons & options
	setupEventListeners();

	// show any new messages to the user
	showWelcomeMessage();
}

function setupEventListeners()
{
	// set up event listeners for checkboxes
	var checkboxes = document.querySelectorAll("input[type='checkbox']");
	for (var i = 0; i < checkboxes.length; i++)
		checkboxes[i].onchange = updatePrefs;

	// setup event listeners for radio buttons
	var radioBtns = document.querySelectorAll("input[type='radio']");
	for (var i = 0; i < radioBtns.length; i++) {
		// add the right event based on the type of radio
		if (radioBtns[i].classList.contains("sidebar-radio"))
		{
			radioBtns[i].onchange = switchTab;

			// set first radio button as checked
			if (i == 0)
				radioBtns[i].checked = true;
			else
				radioBtns[i].checked = false;
		}
		else if (radioBtns[i].classList.contains("grad-selection-radio"))
			radioBtns[i].onclick = changeSelectionMode;
	}

	// setup event listeners for buttons
	document.getElementById("info-icon").onclick = toggleOptions;
	document.getElementById("close-icon").onclick = toggleOptions;
	document.getElementById("close-msg1").onclick = hideMessage;
	document.getElementById("close-msg2").onclick = hideMessage;
	document.getElementById("opt-reset").onclick = resetOptions;
	document.getElementById("opt-date-reset").onclick = resetDateOptions;

	// setup event listener for range slider
	document.getElementById("opt-speed").oninput = changeGradientSpeed;

	// add event listener for when storage changes
	chrome.storage.onChanged.addListener(updateDisplay);

	// handle keyboard shortcuts
	document.onkeyup = function (event)
	{
		if(event.which == 79) // o key
			toggleOptions();

		return false;
	}
}

function showWelcomeMessage()
{
	// show welcome message if necessary
	chrome.storage.sync.get({
		showWelcomeMsg: true,
		showV2Msg: true
	}, function (items) {
		// if the user is new to the extension
		if (items.showWelcomeMsg)
		{
			// show the welcome message
			document.getElementById("welcomeMsg").style.display = "block";

			// don't show the welcome or v2 message again
			chrome.storage.sync.set({showWelcomeMsg: false, showV2Msg: false});
		}
		// if the user updated to v2
		else if (items.showV2Msg)
		{
			// show the v2 message
			document.getElementById("updateMsg").style.display = "block";

			// don't show the v2 message again
			chrome.storage.sync.set({showV2Msg: false});
		}
	});
}


function updateTime()
{
	// update the time element based on the desired display
	chrome.storage.sync.get("use24HourTime", function(items)
	{
		if (items.use24HourTime)
		{
			timeElem.textContent = moment().format("HH:mm");
		}
		else
		{
			timeElem.textContent = moment().format("h:mm A");
		}
	});
}

function updateDate()
{
	// don't bother if the date string hasn't been generated yet OR is completely hidden
	if (dateString != "ungenerated" && dateString != "")
	{
		// format the text according to the date string
		dateElem.textContent = moment().format(dateString);
	}
	else if (dateString == "") // all pieces were hidden
	{
		dateElem.textContent = "";
	}
}

function formatDateString()
{
	chrome.storage.sync.get({
		showDayOfWeek: true,
		showDayOfMonth: true,
		showYear: true
	}, function (items) {
		var datePieces = [];
		var pos = 0;

		// add pieces that will be in the string based on options
		if (items.showDayOfWeek)
		{
			datePieces[pos] = "dddd";
			pos++;
		}
		if (items.showDayOfMonth)
		{
			datePieces[pos] = "MMMM Do";
			pos++;
		}
		if (items.showYear)
		{
			datePieces[pos] = "YYYY";
			pos++;
		}

		// reset the datestring format
		dateString = "";

		// build the date string
		for (var i = 0; i < datePieces.length; i++)
		{
			// add the next part of the date string
			dateString += datePieces[i];

			// add a comma separator if there's another piece
			if (i != datePieces.length - 1)
				dateString += ", ";
		}

		updateDate();
	});
}

function pickColors(num)
{
	var randNum = 0;

	// make sure it exists already
	if (gradientData != undefined)
	{
		if (num == undefined)
			// pick a random gradient from the array
			randNum = Math.floor(Math.random() * gradientData.default.length);
		else
			// use the one that was passed in
			randNum = num;

		var gradientObj = gradientData.default[randNum];
		var colorString = makeColorString(gradientObj.colors);

		// get gradient speed and set the gradient
		chrome.storage.sync.get({
			gradientSpeed: 25,
			animateGradient: true
		}, function(items) {
			container.style.background = "linear-gradient(45deg, " + colorString + ")";
			container.style.backgroundSize = "200% 200%";
			container.style.animation = "Animation " + items.gradientSpeed + "s ease-in-out infinite";

			if (!items.animateGradient)
				container.style.webkitAnimationPlayState = "paused";
		});

		// set the options menu info
		document.getElementById("cgName").innerText = gradientObj.name;
		document.getElementById("cgPackage").innerText = gradientObj.package;
		document.getElementById("cgID").innerText = gradientObj.id;

		// save the current gradient to storage
		chrome.storage.sync.set({currentGradient: gradientObj.id});
	}
}

function makeColorString(colorArray)
{
	var colorString = "";

	// for each item (color) in the array...
	for (var color = 0; color < colorArray.length; color++)
	{
		// add the color to the string
		colorString += colorArray[color];

		// if this is NOT the last color...
		if (color != colorArray.length - 1)
			// add a comma before the next one
			colorString += ", ";
	}

	return colorString;
}

function hideMessage()
{
	document.getElementById("welcomeMsg").style.display = "none";
	document.getElementById("updateMsg").style.display = "none";
}
