# User Search Event Handler
============================

This sample app demonstrates how to stream a subset of data from a public Realm file to a single user's private Realm. 

This is useful in scenarios where the public Realm is very large, and the user is only interested in isolating certain records from it. 

It wouldn't make sense to download the entire public Realm to the device, so this mechanism mitigates this by copying the records that the user specifies.


**How to try it out:**

1. Create text files named `admin_token.base64` and `access-token.enterprise`, containing your ROS instance's admin key, and your Enterprise/Professional token respectively into the to `EventListener` folder.
2. Copy the Professional edition NPM package to the folder and update the filename in `package.json` if needed (Currently set as `realm-1.4.3-professional.tgz`).
3. Run `npm install` to get the needed modules.
5. Start the event handler by running `node usersearch.js`.

You can run the included UserSearch app to test it out. You will need to update the credentials in the file `ViewController.swift` to match a user existing on the server.

![analytics](https://ga-beacon.appspot.com/UA-50247013-2/realm-search/README?pixel)
