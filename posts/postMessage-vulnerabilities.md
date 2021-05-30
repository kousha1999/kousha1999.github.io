# postMessage and Misconfigurations
I'll discuss about postMessage feature and how it can be vulnerable by wrong way implementation. First I'm going to talk about what is postMessage feature actually,
then we are going to code and use it, at the end we will take a look at vulnerabilities.

## What is postMessage?

`postMessage()` is a feature that introduced in HTML5 and you can use it by JavaScript.
This feature let you send data between different Window objects (it can be an `iframe` or `window.open()`).
`SOP` is a mechanism which block the cross-origin requests, 
It means if we request a resource that is not in the same-origin, 
our request will send but the response will return an error. In a word **Origin** is:

>Origin = Protocol + Domain + Port


SOP Will return an error in response if one of the **protocol**, **domain** or even **port** change. 
postMessage provided a secure way that let you bypass this security mechanism.

A `postMessage()` syntax is something like:

```javascript
targetWindow.postMessage(message, targetOrigin, [transfer]);
```

* `targetWindow`: It's the window that takes the message. Just that :). It can be one of the following Window:
  * `window.open()`: This function spawn a new window.
  * `window.opener`: A variable which reference to window that spawned.
  * `window.parent`: It's a reference to the parent of the current window or subframe.
  * `window.frames`: Basically it just return an array of frames. frames are accessible by `[interator]` or simply call it `[i]` notation.
  * `HTMLIFrameElement.contentWindow`: It returns a Window object of an `<iframe>` HTML.

* `message`: This is the data you want to send. The data will serialized that this feature let you send data objects like a charm. The data will deserialize in the postMessage receiver.

* `targetOrigin`: In the second parameter of `postMessage()` you can define the target (receiver) origin, also its value can be `*` that we will cover it later in this post.

### Data Sender
Now we want to write a code that send a data to an `iframe`.

```
┌────────────────────────────────┐
│          domain-a.com          │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │                         │   │
│  │         <iframe>        │   │
│  │                         │   │
│  │       domain-b.com      │   │
│  └─────────────────────────┘   │
│                                │
│  ┌─────────────────────────┐   │
│  │Write message here...    │   │
│  └─────────────────────────┘   │
│                                │
│        ┌─────────────┐         │
│        │  Send Msg   │         │
│        └─────────────┘         │
│                                │
└────────────────────────────────┘
```

It's so much easy. Right?! :)

**hxxp://domain-a.com/sender.html:**
```html
<html>
 <head></head>
 <body>
  <form id="form1" action="/">
   <input type="text" id="message" placeholder="Write message here...">
   <input type="submit" value="Send Msg">
  </form>
  <iframe id="ifrm" src="http://domain-b.com/receiver.html">
   <script>
    window.onload=function() {
    var ifrmwindow = document.getElementById("ifrm").contentWindow;
    var form       = document.getElementById("form1");
    var msg        = document.getElementById("message").value;
    form.onsubmit = function() {
      ifrmwindow.postMessage(msg, "http://domain-b.com");
      return false;
      }
    }
   </script>
</html>
```
First we take the Window object of the `iframe` and the message which we want to send, then we set a `function()` for `onsubmit` event of form, that call `postMessage()` on iframe Window object.You can also set `*` instead of `http://domain-b.com`. The `*` means this message can send to anyone, actually you can specify the origin in that, but we set it as `*` which means it could be anyone (any origin), sooo... Never do that in production stage. :))

Now we need to code the receiver of `postMessage()`. I just want to write what receiver got in the page.

**hxxp://domain-b.com/receiver.html:**
```html
<html>
 <head></head>
 <body>
  <p id="received-message">Nothing got yet!</p>
  <script>
   function displayMessage(event) {
    document.write(event.origin);
    msg = "Message: " + event.data;
    document.getElementById("received-message").innerHTML = message;
   }
   
   if (window.addEventListener)
    window.addEventListener("message", displayMessage, false);
   else
    window.attachEvent("onmessage", displayMessage);
  </script>
</html>
```
`addEventListener()` will wait for an event, if it receive an event it will call a function which specified. `attachEvent()` is like `addEventListener()` but instead for **Internet Explorer** and **Opera**. `"message"` is the **type** of event that we waiting for. displayMessage is a function which will be call when we get what we waiting for (`"message"`).

![](https://user-images.githubusercontent.com/36133745/120114723-c4255180-c195-11eb-9257-118a282b77de.gif)

Now we know how a `postMessage()` work. Let's move on and explain what vulnerabilities may occur.

## postMessage Vulnerabilities
