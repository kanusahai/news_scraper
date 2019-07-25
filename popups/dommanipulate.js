

function calculateTrustScore() {
    chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
        function (tabs) {
            var jsonPayload = {};
            jsonPayload["url"] = tabs[0].url;
            jsonPayload["header"] = tabs[0].title;
            calculateTrustScoreInternal(tabs[0].id, jsonPayload);

            //chrome.tabs.executeScript(tabs[0].id, { code: 'chrome.runtime.sendMessage({text: document.documentElement.innerHTML});' });

            /*chrome.runtime.onMessage.addListener(function (msg) {
                if (msg.text !== undefined) {
                    var plainText = stripHTML(msg.text, true);
                    //jsonPayload["body"] = plainText;
                    calculateTrustScoreInternal(tabs[0].id, jsonPayload);
                }
            }); */        
        }
    );
};

function calculateTrustScoreInternal(tabID, jsonPayload)
{
    console.log(jsonPayload);
    var url = "http://trustednews.westus.cloudapp.azure.com/api/get_website_score";
    sendRequestToMLModel(tabID, url, JSON.stringify(jsonPayload), handleResponse);
};

function sendRequestToMLModel(tabID, url, body, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            callback(tabID, xhr.response);
        }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(body);
};

function handleResponse(tabID, response) {
    console.log(response);

    var jsonResponse = JSON.parse(response);
    var evaluation = jsonResponse.evaluation;
    var reliability = evaluation.reliability;
    var score = parseInt(parseFloat(reliability)*100);
    var label = evaluation.label;
    var characterstics = evaluation.characteristics;
    var relevant_articles = jsonResponse.relevant_articles;
    

    //TODO: Pass the score, label and articles to different htmls as required.
    var logo_bad = false;
    var logo_good = false;
    var logo_ok = false;

    if (score > 75) {
        chrome.browserAction.setPopup({ tabId: tabID, popup: "popups/popup1.html" });
        logo_good = true;
    } else if (score > 30) {
        chrome.browserAction.setPopup({ tabId: tabID, popup: "popups/popup2.html" });
        logo_ok = true;
    } else {
        chrome.browserAction.setPopup({ tabId: tabID, popup: "popups/popup3.html" });
        logo_bad = true;
    }

    changeTextOfElement("score_label", score + "% Reliablity");
    changeTextOfElement("label_label", label);

    toggleDisplayOfElement("logo_bad1", logo_bad);
    toggleDisplayOfElement("logo_bad2", logo_bad);
    toggleDisplayOfElement("logo_ok1", logo_ok);
    toggleDisplayOfElement("logo_ok2", logo_ok);
    toggleDisplayOfElement("logo_good1", logo_good);
    toggleDisplayOfElement("logo_good2", logo_good);

    // Set news links
    var i;
    for (i=0; i<3; i++)
    {
        var elemId = "news" + (i+1).toString();
        if (relevant_articles[i] != undefined)
        {
            changeTextOfElement(elemId, relevant_articles[i].title);
            changeUrlofElement(elemId, relevant_articles[i].url);

        } else {
            toggleDisplayOfElement(elemId, false);
        }
    }  

    // Set characterstics
    // 7 characterstics
    Object.keys(characterstics).forEach(function(key) {
        changeTextOfElement(key, key + ": " + characterstics[key] + "%");
      })
};

function changeUrlofElement(elemId, url) {
    var domElement = document.getElementById(elemId);
    domElement.href = url;
}

function changeTextOfElement(elemId, text) {
    var domElement = document.getElementById(elemId);
    domElement.textContent = text;
};


function toggleDisplayOfElement(elemId, bool){

    var domElement = document.getElementById(elemId);
    if (bool){
        domElement.style.display = "block";
    } else {
        domElement.style.display = "none";
    }

}

calculateTrustScore();
