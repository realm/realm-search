# User Search Event Handler
============================

A simple example of using a server-side event handler to allow users to interactively search for other users.


**How to try it out:**

1. Copy `admin_token.base64` and `access-token.enterprise` to folder
2. Copy the PE node.js binding package to the folder and update the filename in `package.json` if needed.
3. Run `npm install` to get the needed modules.
5. Start the event handler by running `node usersearch.js`.

You can run the included UserSearch app to test it out. You will need to update the credentials in the file `ViewController.swift` to match a user existing on the server.
