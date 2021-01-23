// switch between showing the options panel and the time/date
function toggleOptions() {
	if (!showingOptions) {
		document.getElementById("text-display").style.display = "none";
		document.getElementById("options").style.display = "block";
		showingOptions = true;
	} else {
		document.getElementById("text-display").style.display = "block";
		document.getElementById("options").style.display = "none";
		showingOptions = false;
	}
}

// save preference when a slider changes
function updatePrefs(event) {
	options[event.target.id] = event.target.checked;
	chrome.storage.sync.set(options);

	// refresh the date if needed
	var id = event.target.id;
	if (id == "showDayOfWeek" ||
		id == "showDayOfMonth" ||
		id == "showYear")
	{
		formatDateString();
		updateDate();
	} else if (id == "animateGradient") {
		if (event.target.checked) {
			container.style.webkitAnimationPlayState = "running";
		} else {
			container.style.webkitAnimationPlayState = "paused";
		}
	}
}

// called when one of the gradient selection radios is pressed
function changeSelectionMode(event)
{
	// change it to either "random" or "select"
	options["selectMode"] = event.target.id.substring(9);
	chrome.storage.sync.set(options);
}

// called when the slider for gradient speed is dragged
function changeGradientSpeed(event)
{
	// update the label
	document.getElementById("opt-speed-label").innerText = this.value + " seconds";

	// save it to the options obj
	options["gradientSpeed"] = this.value;
	chrome.storage.sync.set(options);

	// update the speed
	container.style.animation = "Animation " + this.value + "s ease-in-out infinite";
}

function restoreOptions()
{
	// use default values if nothing is set yet
	chrome.storage.sync.get({
		showTime: true,
		showDate: true,
		use24HourTime: false,
		selectMode: "random",
		currentGradient: 0,
		gradientSpeed: 25,
		showDayOfWeek: true,
		showDayOfMonth: true,
		showYear: true,
		animateGradient: true
	}, function(items) {
		// set up switches according to stored options
		document.getElementById('showTime').checked = items.showTime;
		document.getElementById('showDate').checked = items.showDate;
		document.getElementById('use24HourTime').checked = items.use24HourTime;
		document.getElementById("showDayOfWeek").checked = items.showDayOfWeek;
		document.getElementById("showDayOfMonth").checked = items.showDayOfMonth;
		document.getElementById("showYear").checked = items.showYear;
		document.getElementById("animateGradient").checked = items.animateGradient;

		// set the slider position to the current value		
		document.getElementById("opt-speed").value = items.gradientSpeed;
		document.getElementById("opt-speed-label").innerText = items.gradientSpeed + " seconds";

		// set gradient selection mode switches
		if (items.selectMode == "random")
		{
			document.getElementById("opt-grad-random").checked = true;
			document.getElementById("opt-grad-select").checked = false;
		}
		else
		{
			document.getElementById("opt-grad-select").checked = true;
			document.getElementById("opt-grad-random").checked = false;
		}
		
		// show elements that are enabled
		if (items.showTime) {
			timeElem.style.display = "block";
		}
		if (items.showDate) {
			dateElem.style.display = "block";
		}
	});
}

function resetOptions()
{
	var userIsSure = confirm("This will reset all of WaveTab's options to their defaults.\n\nDo you want to continue?");
	if (userIsSure)
	{
		// reset and clear options/storage
		options = {};
		chrome.storage.sync.clear();

		options.showTime = true;
		options.showDate = true;
		options.use24HourTime = false;
		options.selectMode = "random";
		options.currentGradient = 0;
		options.gradientSpeed = 25;
		options.showDayOfWeek = true,
		options.showDayOfMonth = true,
		options.showYear = true
		options.animateGradient = true;

		// set the storage
		chrome.storage.sync.set(options);

		// refresh the page so the options are applied
		initialize();
	}
}

function resetDateOptions()
{
	var userIsSure = confirm("This will reset WaveTab's date format options to their defaults.\n\nDo you want to continue?");
	if (userIsSure)
	{
		// set defaults
		options.showDate = true;
		options.showDayOfWeek = true,
		options.showDayOfMonth = true,
		options.showYear = true

		// set the storage
		chrome.storage.sync.set(options);

		// refresh the page so the options are applied
		initialize();
	}
}

// called when storage changes
function updateDisplay(changes)
{
	for (key in changes)
	{
		var storageChange = changes[key];

		// hide/display elements that changed
		switch(key) {
			case "showTime":
				if (storageChange.newValue == false)
					timeElem.style.display = "none";
				else
					timeElem.style.display = "block";
				break;
			case "showDate":
				if (storageChange.newValue == false)
					dateElem.style.display = "none";
				else
					dateElem.style.display = "block";
				break;
		}
	}
}

// switch between option categories
// called when a category tab is clicked
function switchTab(event)
{
	// hide all the options divs
	hideOptionsGroups();

	// will be something like "opt-tab-general", so cut off the beginning to get just "general"
	var group = event.target.id.substring(8);

	// show that group of options
	document.getElementById("opt-" + group).style.display = "block";
}

function hideOptionsGroups()
{
	document.getElementById("opt-general").style.display = "none";
	document.getElementById("opt-gradients").style.display = "none";
	document.getElementById("opt-gradient-library").style.display = "none";
	document.getElementById("opt-support").style.display = "none";
}