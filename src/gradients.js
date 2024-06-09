// holds the gradient library data (json)
var gradientData;

function readFile()
{
    // get the path of the json file(s)
    var path = chrome.runtime.getURL("assets/data/default.json");

    // request and read the file
    var req = new XMLHttpRequest();
    req.addEventListener("load", reqOnLoad)
    req.open("GET", path);
    req.send();
}

function reqOnLoad()
{
    gradientData = JSON.parse(this.responseText);
    
    chrome.storage.sync.get({
        currentGradient: 0,
        selectMode: "random"
    }, function(items) {
        if (items.selectMode == "random")
            pickColors();
        else
            pickColors(items.currentGradient);
    });

    generateGradientLibrary();
}

function generateGradientLibrary()
{
	// for each gradient listed in the library
	for (var i = 0; i < gradientData.default.length; i++)
	{
		// create a display element for the gradient
		var gradientElem = document.createElement("div");
		gradientElem.classList.add("grad-lib-box");

		var gradient = gradientData.default[i];

		// have it use the colors in the gradientObj's color array
		var colorString = makeColorString(gradient.colors);
		gradientElem.style.background = "linear-gradient(45deg, " + colorString + ")";

		// give it a tooltip
		var tooltip = document.createElement("span");
		tooltip.classList.add("tooltip");

		var idString = makeIDString(gradient.id)

		tooltip.innerText = idString + ": " + gradient.name;
		gradientElem.appendChild(tooltip);

		// give it an action to carry out on click
		gradientElem.onclick = onGradientClick;

		// add it to the DOM inside the container
		document.getElementById("opt-gradient-library").appendChild(gradientElem);
	}
}

function onGradientClick(event)
{
	// get the ID of the gradient clicked
	var id = parseInt(event.target.innerText.substring(0, 3));

	// set the background to that gradient
    pickColors(id);
	
	// save it into storage
    chrome.storage.sync.set({currentGradient: id});
}

// creates a three digit (padded with zeroes if needed) gradient ID string
function makeIDString(id)
{
	var idString = "";

	// add leading zeroes if needed
	if (id < 100)
		idString += "0";

	if (id < 10)
		idString += "0";

	idString += id;

	return idString;
}