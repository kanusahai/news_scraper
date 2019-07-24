// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let scrape = document.getElementById('scrape');




scrape.onclick = () => {

    createRequestAndSend();

};

function createRequestAndSend() {
    chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
        function (tabs) {
            var jsonPayload = {};
            jsonPayload["url"] = tabs[0].url;
            jsonPayload["header"] = tabs[0].title;

            chrome.tabs.executeScript(tabs[0].id, { code: 'chrome.runtime.sendMessage({text: document.documentElement.innerHTML});' });


            chrome.runtime.onMessage.addListener(function (msg) {
                if (msg.text !== undefined) {
                    var plainText = extractContent(msg.text, true);
                    jsonPayload["body"] = plainText;
                }
            });
            load("http://trustednews.westus.cloudapp.azure.com/api/get_website_score", JSON.stringify(jsonPayload), verify);
        }
    );
};


function handleResponse(response) {

}


function load(url, body, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            callback(xhr.response);
        }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(body);
};

function extractContent(s, space) {
    var span = document.createElement('span');

    span.innerHTML = s;
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



function verify(jsonPayloadString) {
    chrome.extension.getBackgroundPage().console.log(jsonPayloadString);
};
