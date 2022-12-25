# ChatGPT API Agent (Firefox version)

# Setup
1. `git clone https://github.com/ChatGPT-Hackers/ChatGPT-API-agent`
2. Download firefox (if you don't already have it)
3. Open `about:debugging#/runtime/this-firefox` in Firefox
4. Click `Load Temporary Add-on`
5. Drag and drop `manifest.json` from `ChatGPT-API-agent` into the popup and press `Select`

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
