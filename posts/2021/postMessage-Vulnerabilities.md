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

<p align="center">
<img src="https://user-images.githubusercontent.com/36133745/120114723-c4255180-c195-11eb-9257-118a282b77de.gif">
</p>

Now we know how a `postMessage()` work. Let's move on and explain what vulnerabilities may occur.

## postMessage Vulnerabilities
Three vulnerabilities can occur in postMessage.
* Sender Origin is set to `*`
* Receiver does not verify the origin of the sender
* Receiver does not sanitize the data which received

The first one is obvious and we pointed out before. Now I want to show you how to abuse the second and third misconfigurations.

As we already discussed, receiver wait for an event (based on the type of `addEventListener()`) then a function will call, but we didn't said who can send data to receiver?! It has a simple answer, **EVERYONE**!

So everone can send data to any receiver, It is on receiver own to check the sender origin, If it doesn't, the receiver "event listener" will accept any event. It means an attacker also can send a malicious data to receiver. A secure way to fix this issue is checking the Origin. It just needs a `if` condition. Let's explain by an example.

**hxxp://domain-b.com/receiver.html:**
```html
<html>
 <head></head>
 <body>
  <p id="received-message">Nothing got yet!</p>
  <script>
   function displayMessage(event) {
    if (evt.origin.startsWith != "http://domain-a.com") {
     console.log("Invalid Origin! Do Not try Hacking at home. :)");
    } else {
     document.write(event.origin);
     msg = "Message: " + event.data;
     document.getElementById("received-message").innerHTML = message;
    }
   }
   
   if (window.addEventListener)
    window.addEventListener("message", displayMessage, false);
   else
    window.attachEvent("onmessage", displayMessage);
  </script>
</html>
```
I think it doesn't need any explain. It just like the previous receiver, the only difference is an `if` condition. It checks if origin is started with **"hxxp://domain-a.com"**, If an attacker try to send a data with a **"hxxp://attacker.com"**, the receiver will write an error log. **BUT**, what if an attacker send a data by **"hxxp://domain-a.com.attacker.com"** domain?! Yeaaa... Bypassed! The receiver will accept data. A secure way to implement is to check complete origin instead of `startsWith` or `endsWith` to compare a part of origin.

```html
<html>
 <head></head>
 <body>
  <p id="received-message">Nothing got yet!</p>
  <script>
   function displayMessage(event) {
    if (evt.origin == "http://domain-a.com") {
     console.log("Invalid Origin! Do Not try Hacking at home. :)");
    } else {
     document.write(event.origin);
     msg = "Message: " + event.data;
     document.getElementById("received-message").innerHTML = message;
    }
   }
   
   if (window.addEventListener)
    window.addEventListener("message", displayMessage, false);
   else
    window.attachEvent("onmessage", displayMessage);
  </script>
</html>
```
Now it is better! :)

Now we get to the last misconfiguration. Consider a simple chatroom is implemented by the `postMessage()` functionality. There is a server which accept data from anywhere, It shows everyone data (message) that sent just like the first example that we implemented. The receiver shows the message by `innerHTML` JavaScript function.

### Break (DOM-Base XSS)
Cross-Site Scripting (a.k.a XSS) is a vulnerability that occur when user inputs reflect somewhere without sanitizing. It leds attacker to inject a script into the page that JavaScript is the most common one scripting language to exploit this vulnerability. XSS has different types:
* Reflected
* Stored
* DOM
* 
There are also other types like mXSS or Self-XSS, But they are not an actual type, they can be one of the 3 main types.
If you inject a JavaScript code into the vulnerable JavaScript code (which means it doesn't need to send a request to server for injecting JavaScript), it's a DOM-based XSS.

### Back to the Future (postMessage)
`innerHTML` is one of the vulnerable Javascript property that leads to DOM-based XSS. As you can see in the first example of **receiver.html**, the received data (message) are displayed by `innerHTML`. So what now?! Just send `<img src=x onerror=alert(1337)>` and now we exploited a XSS vulnerability.

<p align="center">
<img src="https://user-images.githubusercontent.com/36133745/120367050-a686f200-c325-11eb-81d8-a19a9eecb645.png">
</p>
