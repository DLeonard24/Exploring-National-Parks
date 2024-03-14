/**
 * This file is the entry point of the React application.
 * It renders the main components of the application using React Router.
 * The components include ParkSearch, ParkInfo, HomePage, and ParkPlan.
 * It also includes a Navbar and a Footer component.
 * The main CSS file is imported and applied to the rendered components.
 * The root element is obtained using ReactDOM.createRoot and the components are rendered inside it.
 * The activitiesDropdown element is commented out.
 * Performance measurement and analytics functionality are mentioned but not implemented.
 * @file
 * @summary the entry point of the React application
 * @module index
 * @requires react
 * 
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import ParkSearch from './ParkSearch.js';
import ParkInfo from './ParkInfo.js';
import HomePage from './HomePage.js';
import ParkPlan from './ParkPlan.js';
import Navbar from './GlobalComponents/Navbar.jsx';
import {BrowserRouter as Router, Routes,Route} from "react-router-dom";
import Footer from './GlobalComponents/Footer.jsx';
import './Style/main.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <div>
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/ParkSearch" element={<ParkSearch />} />
                <Route path="/ParkInfo" element={<ParkInfo />} />
                <Route path="/ParkPlan" element={<ParkPlan />} />
            </Routes>
            <Footer></Footer>
        </Router>

      
    </div>
);
/*
const Twit = require('twit');

const T = new Twit((
    consumer_key: 'Zz8JkzwzfVptkN9VQHmhSMVfT',
    consumer_secret: 'jxYvTkQHNUuMSUjsNspU4SZw48LecXhEeUaTZjP6KKtLkhHwwJ',
    access_token: '1767917739610435584-bpqrEr3hsU2mLIrponmcdAdYDlH08R',
    acess_token_secret: 'JbGaYZJKy1T0xjbtHwCK9vf6A5IcqFqcgIKpmRPmK7a5U',
    timeout_ms: 60 * 1000,
));
*/

const got = require('got');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const qs = require('querystring');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

// The code below sets the consumer key and consumer secret from your environment variables
// To set environment variables on macOS or Linux, run the export commands below from the terminal:
// export CONSUMER_KEY='YOUR-KEY'
// export CONSUMER_SECRET='YOUR-SECRET'
const consumer_key = 'Zz8JkzwzfVptkN9VQHmhSMVfT';
const consumer_secret = 'jxYvTkQHNUuMSUjsNspU4SZw48LecXhEeUaTZjP6KKtLkhHwwJ'

// These are the parameters for the API request
// specify Tweet IDs to fetch, and any additional fields that are required
// by default, only the Tweet ID and text are returned
const params = 'user.fields=created_at,description&expansions=pinned_tweet_id' // Edit optional query parameters here

const endpointURL = `https://api.twitter.com/2/users/me?{params}`;

// this example uses PIN-based OAuth to authorize the user
const requestTokenURL = 'https://api.twitter.com/oauth/request_token?oauth_callback=oob';
const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
const accessTokenURL = 'https://api.twitter.com/oauth/access_token';

const oauth = OAuth({
  consumer: {
    key: consumer_key,
    secret: consumer_secret
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
});

async function input(prompt) {
  return new Promise(async (resolve, reject) => {
    readline.question(prompt, (out) => {
      readline.close();
      resolve(out);
    });
  });
}

async function requestToken() {

  const authHeader = oauth.toHeader(oauth.authorize({
    url: requestTokenURL,
    method: 'POST'
  }));

  const req = await got.post(requestTokenURL, {
    headers: {
      Authorization: authHeader["Authorization"]
    }
  });

  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function accessToken({
  oauth_token,
  oauth_token_secret
}, verifier) {

  const authHeader = oauth.toHeader(oauth.authorize({
    url: accessTokenURL,
    method: 'POST'
  }));

  const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`

  const req = await got.post(path, {
    headers: {
      Authorization: authHeader["Authorization"]
    }
  });

  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function getRequest({
  oauth_token,
  oauth_token_secret
}) {

  const token = {
    key: oauth_token,
    secret: oauth_token_secret
  };

  const authHeader = oauth.toHeader(oauth.authorize({
    url: endpointURL,
    method: 'GET'
  }, token));

  const req = await got(endpointURL, {
    headers: {
      Authorization: authHeader["Authorization"],
      'user-agent': "v2UserLookupJS"
    }
  });

  if (req.body) {
    return JSON.parse(req.body);
  } else {
    throw new Error('Unsuccessful request');
  }
}

(async () => {
  try {

    // Get request token
    const oAuthRequestToken = await requestToken();

    // Get authorization
    authorizeURL.searchParams.append('oauth_token', oAuthRequestToken.oauth_token);
    console.log('Please go here and authorize:', authorizeURL.href);
    const pin = await input('Paste the PIN here: ');

    // Get the access token
    const oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());

    // Make the request
    const response = await getRequest(oAuthAccessToken);
    console.dir(response, {
      depth: null
    });

  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
  process.exit();
})();