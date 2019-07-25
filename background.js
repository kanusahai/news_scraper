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
}, {url: [{urlMatches : ".*news.*"}]});


