/**
 * The hotbits server sends back certain request errors as an html response
 * This takes a server html response and searches for an error
 * @param html The html returned by the server
 * @returns The error message found in the html or null if no error message
 */
export default (html) => {
  // The error is indicated by 'error' in the <title> tag and
  // the error message in <blockquote><p><b> tags followed by
  // 'See the <a href="/hotbits/apikey.html">API Key</a> documentation'

  // <title>.*error                  matches the word error in the <title> tag
  // [\S\s]*                         matches all text between <title> and <blockquote>
  // <blockquote>\s*<p>\s*<b>        matches <blockquote>, <p> and <b> tags
  // (.*)                            matching group to capture the error message
  // \s*See the[\S\s]*documentation  matches content that follows an error message
  const regex = /<title>.*error[\S\s]*<blockquote>\s*<p>\s*<b>(.*)\s*See the[\S\s]*documentation/mig;
  const match = regex.exec(html);
  return match && match[1];
};

/* SAMPLE ERROR RESPONSE FROM SERVER */
/*
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
  <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
  <title>HotBits API Key Error</title>
  <link rel="stylesheet" href="/hotbits/hotbits.css" type="text/css" />
  </head>

  <body>
  <h1><a href="." class="f"><img src="/hotbits/figures/hb10.png" class="logo"
      height="32" width="32" alt="" /></a> HotBits API Key Error</h1>

  <hr />

  <blockquote>
  <p>
  <b>
      No HotBits API Key specified.  See the
      <a href="/hotbits/apikey.html">API Key</a> documentation for details.
  </b>
  </p>
  </blockquote>

  <h3><a href="/hotbits/">Back to HotBits</a></h3>
  </body>
  </html>
*/
