// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function () {
    console.log('Background Script started running');
});

// Listener for when you load a new web-page
// Only activates trust-worthiness analysis is the URL contains "news"
chrome.webNavigation.onCompleted.addListener(function () {
    console.log('Navigated to a news webpage');
    calculateTrustScore();

}, {url: [{urlMatches : ".*news.*"}]});


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
    var score = evaluation.reliability;
    var label = evaluation.label;
    //TODO: Pass the score and label to different htmls as required.
    if (score > 75) {
        chrome.browserAction.setPopup({ tabId: tabID, popup: "popups/popup1.html" });
    } else if (score > 30) {
        chrome.browserAction.setPopup({ tabId: tabID, popup: "popups/popup2.html" });
    } else {
        chrome.browserAction.setPopup({ tabId: tabID, popup: "popups/popup3.html" });
    }
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