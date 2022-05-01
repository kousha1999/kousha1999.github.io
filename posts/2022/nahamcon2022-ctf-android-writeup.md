
# NahamCon CTF 2022 Android Writeup (Solutions)

Two days ago, I helped my friends to solve CTF NahamCon2022 challenges. I was wondering about Android challenges so I focused on them. In this blog post, I'll explain how I solved Android challenges.

Mobilize
This is the easiest challenge for begginers. Actually anyone could solve this. :))
I opened APK file in Jadx-Gui. There was nothing in MainActivity. So I just searched in strings.xml, and there it is. FLAG! :)


Click Me
I think this challenge was easy too. You just had to change a little variable in smali code.
In the MainActivity, We have 3 interesting parts. It is obvious that challenges wants from us (in getFlagButtonClick function \[Section 2\]) to click 99999999 times on something to get flag, but also It stops us being clicking after 13371337. I'm not crazy enough to click that much times. If you want to be a crazy hacker, you can just hook cookieViewClick with Frida to bypass that limit and then you are free to go for clicking 99999999 on the button. After that, `clickme` native code will return the flag. But time is matter so I'm gonna just change 99999999 to 2. :)
You can do this in smali code. So I decompiled app with apktool and changed 0x5f5e0ff (int->99999999) to 0x2 (int->2). Then I build it and resigned it. Now you can just click on cookie for 2 times to get flag. 
![2022-05-01_17-40](https://user-images.githubusercontent.com/36133745/166148625-32b5f0ba-991c-4f3d-ae5a-63dc907a7219.png)
![photo_2022-05-01_17-52-12](https://user-images.githubusercontent.com/36133745/166148638-679532d1-7b28-4127-a2a8-733404d1e680.jpg)


Ofcourse you could've done this by reversing "clickme" native code, but as i said, time is matter!

OTPVault
This application was a little bit harder, at least you had to use your brain. Challenge developed with ReactNative framework. This means you have to go for reading JavaScript and again, this means open the index.android.bundle from asset folder. :)
I opened index.android.bundle in Developer Console (Chromium).
![2022-05-01_17-59](https://user-images.githubusercontent.com/36133745/166148588-01c1ddf4-2109-4a4e-8cd0-c2399dc1f8a6.png)


OK, that's a mess. Who can even read that minified code?! you know I'm right. So I used `pretty print` feature. That's far better now.
[image]

I tried to be smart and search for `flag` keyword, but I just fooled myself. :))
Then I analyzed code from end of script! That works a lot better. Then I found a this request. There are a lot of bullshits, the real problem is those conditions (switch-case). You don't need token or even that `s` whatever it is! I used `curl` command to see the result. Also there is a `/flag` path.
![2022-05-01_18-08](https://user-images.githubusercontent.com/36133745/166148672-fb577ca7-7ba6-4c2e-a96a-2616665c5978.png)

So it just says give me the damn authorization header so i did. Thanks for Flag. :)
[image]


Secure Notes
This challenge difficulty was just like the OTPVault, maybe a little more tricky.
Application is sick and contains 2 Main/Launcher Activity! :/
![2022-05-01_18-19](https://user-images.githubusercontent.com/36133745/166148889-042ecdf9-3153-49df-95c1-7f5ead692cdd.png)

BTW, the real code that we have to deal with, is in the LoginActivity. It seems we have an encrypted database. It is obvious whatever is this, It stores flag! So let's decrypt it. In the first red box (in the previous image) we can see there is a function named `d.k()` which calls in `onClick()` method. Lets see what is it!
[image]

Oooh. There you are `AES` encryption! But we can't see AES Mode! ECB or CBC?! Based on Oracle document, the default mode is ECB. the first parameter of this function is key (`str`)! In LoginActivity (previous image) you can see key is `this.f1583b.getText().toString()`, but it repeats 4 times! AES Key is 16-byte. So it means we have to find a key contains 4 bytes (4 character) that will repeats 4 times (4 * 4 = 16, Duh...).


Before writing a brute-force script for that encrypteb database, I had a look on the `MainActivity`. It seems the decrypted data must be a JSON.
![2022-05-01_18-35](https://user-images.githubusercontent.com/36133745/166149450-3c358d92-37e4-44e4-b717-93eba165e22c.png)


So I extraced db.encrypted from asset folder (via apktool). Then I wrote a little python script to brute-force. Aaaaand Yello Flag!

![2022-05-01_18-33_1](https://user-images.githubusercontent.com/36133745/166149503-06f33aab-422b-4f36-81b8-156a36cb04c8.png)

