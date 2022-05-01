
# NahamCon CTF 2022 Android Writeup (Solutions)

Two days ago, I helped my friends to solve CTF NahamCon2022 challenges. I was wondering about Android challenges, so I focused on them. In this blog post, I'll explain how I solved Android challenges.

<p align="center">
<img src="https://user-images.githubusercontent.com/36133745/164783235-d8df38a6-e0f3-4e68-9f64-57fa21b98435.gif">
</p>

## Mobilize
This one was an easy challenge for beginners. Anyone could solve this. :))
I opened the APK file in `Jadx-GUI`. There was nothing in `MainActivity`. So I just searched in `strings.xml`, and there it is. FLAG! :)
![photo_2022-05-01_18-41-30](https://user-images.githubusercontent.com/36133745/166149698-c9913021-76f4-445c-a48c-81b61c17b9e7.jpg)


## Click Me
I think this challenge was easy too. You just had to change a little variable in `smali` code.
In the `MainActivity`, We have 3 interesting parts. It is obvious that challenges want us (in the `getFlagButtonClick` function \[Section 2\]) to click `99999999` times on something to get the flag, but also stops us being clicking after `13371337`. I'm not crazy enough to click that many times. If you want to be a crazy hacker, you can just hook `cookieViewClick` with **Frida** to bypass that limit and then you are free to go by clicking `99999999` on the button. After that, the `clickme` native code will return the flag. But time is a matter so I'm gonna just change `99999999` to `2`. :)
You can do this in the `smali` code. So I decompiled app with the `apktool` and changed `0x5f5e0ff` (int->99999999) to `0x2` (int->2). Then I build it and resigned it. Now you can just click on the cookie 2 times to get the flag. 
![2022-05-01_17-40](https://user-images.githubusercontent.com/36133745/166148625-32b5f0ba-991c-4f3d-ae5a-63dc907a7219.png)
![photo_2022-05-01_17-52-12](https://user-images.githubusercontent.com/36133745/166148638-679532d1-7b28-4127-a2a8-733404d1e680.jpg)


Of course, you could've done this by reversing the "clickme" native code, but as I said, time is a matter!

## OTPVault
This application was a little bit harder, at least you had to use your brain. Challenge developed with `ReactNative` framework. This means you have to go for reading JavaScript and again this means, opening the `index.android.bundle` from the `/asset` folder. :)
I opened `index.android.bundle` in `Developer Console` (Chromium).
![2022-05-01_17-59](https://user-images.githubusercontent.com/36133745/166148588-01c1ddf4-2109-4a4e-8cd0-c2399dc1f8a6.png)

OK, that's a mess. Who can even read that minified code?! you know I'm right. So I used the `pretty print` feature. That's far better now.
![photo_2022-05-01_18-46-22](https://user-images.githubusercontent.com/36133745/166149917-8efa9faa-35c5-44a7-803b-78dc85c73743.jpg)


I tried to be smart and search for the `flag` keyword, but I just fooled myself. :))
Then I analyzed the code from the end of the script! That works a lot better. Then I found this request. There are a lot of bullshits, the real problem is those conditions (switch-case). You don't need that `n.token` or even that `n.s` whatever it is! I used the `curl` command to see the result. Also, there is a `/flag` path.
![2022-05-01_19-16](https://user-images.githubusercontent.com/36133745/166151097-a010cc41-8c40-41e2-9aa7-4f9d48bd1cd3.png)

![2022-05-01_18-08](https://user-images.githubusercontent.com/36133745/166148672-fb577ca7-7ba6-4c2e-a96a-2616665c5978.png)

So it just says give me the damn authorization header so I did. Thanks for the Flag. :)
![photo_2022-05-01_18-50-25](https://user-images.githubusercontent.com/36133745/166150100-9bdd007e-b825-4525-95c3-86f705f501f9.jpg)


## Secure Notes
This challenge difficulty was just like the OTPVault, maybe a little more tricky.
The application is sick and contains 2 Main/Launcher activities! :/
![2022-05-01_18-19](https://user-images.githubusercontent.com/36133745/166148889-042ecdf9-3153-49df-95c1-7f5ead692cdd.png)

BTW, the real code that we have to deal with, is in the LoginActivity. 
![2022-05-01_18-22](https://user-images.githubusercontent.com/36133745/166150153-85ba23ce-ccd2-47be-aabf-5204acdf691e.png)

It seems we have an encrypted database. It is obvious whatever is this, It stores a flag! So let's decrypt it. In the first red box we can see there is a function named `d.k()` which calls in `onClick()` method. Let's see what is it!
![photo_2022-05-01_18-55-07](https://user-images.githubusercontent.com/36133745/166150278-5959d1f5-ea58-41cb-9f9a-e60860eff75c.jpg)


Oooh. There you are `AES` encryption! But we can't see AES Mode! ECB or CBC?! Based on the Oracle documentation, the default mode is ECB. the first parameter of this function is key (`str`)! In LoginActivity (previous image) you can see key is `this.f1583b.getText().toString()`, but it repeats 4 times! AES Key is 16-byte. So it means we have to find a key that contains 4 bytes (4 characters) that will repeat 4 times (4 * 4 = 16, Duh...).

Before writing a brute-force script for that encrypted database, I had a look at the `MainActivity`. It seems the decrypted data must be JSON.
![2022-05-01_18-35](https://user-images.githubusercontent.com/36133745/166149450-3c358d92-37e4-44e4-b717-93eba165e22c.png)


So I extracted db.encrypted from the `/asset` folder (via `apktool`). Then I wrote a little python script for brute force. Aaaaand Yello Flag!
![photo_2022-05-01_19-12-16](https://user-images.githubusercontent.com/36133745/166150939-0bd79358-1183-4f37-ac7d-6af8c409ca3f.jpg)

![2022-05-01_18-33_1](https://user-images.githubusercontent.com/36133745/166149503-06f33aab-422b-4f36-81b8-156a36cb04c8.png)

