// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let scrape = document.getElementById('scrape');

scrape.onclick = () => {

    console.log("Scrape clicked");
    calculateTrustScore();

};

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
    console.log(document);
    //var score_label_elem = document.getElementById("score_label");
    //score_label_elem.textContent = score;
};

function stripHTML(str, space) {
    var span = document.createElement('span');

    span.innerHTML = str;
    if (space) {
        var children = span.querySelectorAll('*');
        for (var i = 0; i < children.length; i++) {
            if (children[i].textContent)
                children[i].textContent += ' ';
            else
                children[i].innerText += ' ';
        }
    }
    return [span.textContent || span.innerText].toString().replace(/ +/g, ' ');
};
