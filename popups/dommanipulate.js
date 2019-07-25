

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
    var score = parseFloat(reliability)*100;
    var label = evaluation.label;
    var relevant_articles = jsonResponse.relevant_articles;
    //TODO: Pass the score, label and articles to different htmls as required.
    if (score > 75) {
        chrome.browserAction.setPopup({ tabId: tabID, popup: "popups/popup1.html" });
    } else if (score > 30) {
        chrome.browserAction.setPopup({ tabId: tabID, popup: "popups/popup2.html" });
    } else {
        chrome.browserAction.setPopup({ tabId: tabID, popup: "popups/popup3.html" });
    }

    changeTextOfElement("score_label", score + "% Reliablity");
    changeTextOfElement("label_label", label);

    toggleDisplayOfElement("logo_bad1", false);
    toggleDisplayOfElement("logo_bad2", false);
    toggleDisplayOfElement("logo_ok1", false);
    toggleDisplayOfElement("logo_ok2", false);
    // toggleDisplayOfElement("logo_good1", false);
    // toggleDisplayOfElement("logo_good2", false);
    
};

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
