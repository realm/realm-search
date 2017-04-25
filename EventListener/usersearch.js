const Realm = require('realm');
const fs    = require('fs');

require('./generateuserdata.js');

const server_url        = 'realm://localhost:9080';
const REALM_ADMIN_TOKEN = fs.readFileSync('./admin_token.base64', 'utf-8');
const ENTERPRISE_TOKEN  = fs.readFileSync('./access-token.enterprise', 'utf-8');

Realm.Sync.setAccessToken(ENTERPRISE_TOKEN); // needed to enable global listener functionality
Realm.Sync.setLogLevel('error');

const adminUser = Realm.Sync.User.adminUser(REALM_ADMIN_TOKEN);

function handleChange(changeEvent) {
    console.log('Change detected');
    console.log(changeEvent.path);
    
    const changes = changeEvent.changes["UserSearch"];
    
    // no reason to do any work if there are no requests
    if (typeof changes === "undefined")
        return;
    if (changes.insertions.length == 0 && changes.modifications.length == 0)
        return;
    
    const userSchema = {
      name: 'User',
      properties: {
        email:  'string',
      }
    };

    let accountsRealm = new Realm({ sync: {user: adminUser, url: server_url + '/globalUsers'}, schema: [userSchema] });

    const searchRealm = changeEvent.realm; // workaround for GN returning new instance on every access
    const requests    = searchRealm.objects("UserSearch");
    const accounts    = accountsRealm.objects('User');
    
    // Find users matching the request
    searchRealm.write(() => {
        // handle new requests
        changes.insertions.forEach((index) => {
            const obj = requests[index];
            
            if (obj.pattern != "") {
                const matches = accounts.filtered("email CONTAINS[c] $0", obj.pattern);
                
                matches.forEach((match) => {
                    obj.users.push({ email: match.email });
                });
            }
            obj.resultPattern = obj.pattern;
        });
        
        // live update result if request is modified
        changes.modifications.forEach((index) => {
            const obj = requests[index];
            
            if (obj.pattern == "") {
                searchRealm.delete(obj.users);
                console.log("Deleted all");
            }
            else {
                const matches = accounts.filtered("email CONTAINS[c] $0", obj.pattern);
                console.log(matches);

                // remove users that are no longer matching
                const toDelete = [];
                obj.users.forEach((profile) => {
                    if (matches.filtered("email == $0", profile.email).length == 0) {
                        toDelete.push(profile);
                        console.log("Delete " + profile.email);
                    } 
                });
                searchRealm.delete(toDelete);
                
                // add new matches
                matches.forEach((match) => {
                    if (obj.users.filtered("email == $0", match.email).length == 0) {
                        console.log("Matched: " + match.email);
                        obj.users.push({email: match.email});
                    }
                });
            }
            obj.resultPattern = obj.pattern;
        });
    });
}
Realm.Sync.addListener(server_url, adminUser, ".*/usersearch", 'change', handleChange);

console.log('listening');
