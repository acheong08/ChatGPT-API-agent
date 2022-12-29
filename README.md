# ChatGPT API Agent (Firefox version)

# Setup
1. Download from [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/chatgpt-api-client/)

# Running
1. Go to extension preferences
![image](https://user-images.githubusercontent.com/36258159/209443449-73ca41c3-39ad-4429-b1b7-028b508dddff.png)
![image](https://user-images.githubusercontent.com/36258159/209443463-7ca046e3-758b-4541-8b9d-f0f5eeebbc58.png)
2. Configure endpoint from the [server](https://github.com/ChatGPT-Hackers/ChatGPT-API-server)
3. Add emails/passwords to the preferences
4. Press save
![image](https://user-images.githubusercontent.com/36258159/209443551-ce03ce90-d1de-4e42-8b35-df46bb70c62b.png)
5. Click on the extension
![image](https://user-images.githubusercontent.com/36258159/209443565-6bb9866a-99d2-4947-96e9-2934c93db80c.png)
This will spawn the same number of tabs as there are emails/passwords
6. Wait for it to load
7. Complete the captcha and press continue (email/password autofills)
![image](https://user-images.githubusercontent.com/36258159/209443617-d96ee8d2-a016-4fa1-85da-f815a38e0087.png)
8. After that, it will autofill the password and continue to the chat site.

Done. It connects to the endpoint and you can leave it open.

<br>
<br>
<br>

# Firefox Docker (optional)

```yaml
version: '3.3'
services:
    firefox:
        container_name: firefox
        ports:
            - '5800:5800'
        volumes:
            - '<host folder path>:/config:rw'
        image: jlesage/firefox

```
1. create a folder that will contain the app data for firefox
2. access container via `<ip-address>:5800` and finish the firefox setup
3. procceed to follow <a href="#top">step 1</a> in Setup section
4. now follow steps in <a href="#top">Running section</a> 

# Contributing
In order to develop locally you need to use guide provided by Mozilla: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#trying_it_out and follow next steps:
1. Clone this repository
2. Go to `about:debugging` in Firefox
3. Specify this directory as a temporary extension
4. It will be loaded on top of the existing extension if you have one
5. You can debug your new feature.
