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

* `targetWindow`: It's the window that takes the message. Just that. :smile: It can be one of the following window :point_down:
  * `window.open()`: This function spawn a new window.
  * `window.opener`: A variable which reference to window that spawned.
  * `window.parent`: 
  * `window.frames`: 
  * `HTMLIFrameElement.contentWindow`: 

* `message`: This is the data you want to send. The data will serialized that this feature let you send data objects like a charm. The data will deserialize in the postMessage receiver.

* `targetOrigin`: In the second parameter of `postMessage()` you can define the target (receiver) origin, also its value can be `*` that we will cover it later in this post.
