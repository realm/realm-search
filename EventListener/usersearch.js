const Realm = require('realm');
const fs    = require('fs');

const server_url        = 'realm://localhost:9080';
const REALM_ADMIN_TOKEN = fs.readFileSync('./admin_token.base64', 'utf-8');
const ENTERPRISE_TOKEN  = fs.readFileSync('./access-token.enterprise', 'utf-8');

Realm.Sync.setAccessToken("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb3RpZmllciI6dHJ1ZSwiQ2xpZW50RW1haWwiOiJ0b0ByZWFsbS5pbyIsImlhdCI6MTQ5MjgxODc3OSwiZXhwIjoxNDk4MDAyNzc5fQ.PTMmJr8oTDiWFS5dzDQb0qXWkyi4Edqb_n-vxw1wSQ0lFeIzBUKt5DGks9yYeb_4vvA3v1tQIz46stYVo8GyEZf_rLLGEZfyg-yZ-rfPo-EHKQ-ce4d0wujE9_0MhYLVKAQwnnEQGpWH4TCSCintya-z_fPldpXIiWtqM9TUaypKazacG9qXU54M_O-x_Tfm34vQtWaE4_KTcdoc2NballUN2yFPXLyeJwzBlE4a9vj5BigCpmUcLfg76jC-bEApEi0J-rDBSz055Nsqv-8DAfc4zK7tGH7AfE-vKJq8t0Cc9o6nnl-c9F-aNqashAt5Z3c2sUpi9v8gu6eT52v94w"); // needed to enable global listener functionality
Realm.Sync.setLogLevel('error');

const adminUser = Realm.Sync.User.adminUser(REALM_ADMIN_TOKEN);

// -------------------

 function onAdmin(changeEvent) {
     console.log("admin available");
    
     const adminRealm = changeEvent.realm;
    
    function handleChange(changeEvent) {
        console.log('Change detected');
        console.log(changeEvent.path);
        
        const changes = changeEvent.changes["UserSearch"];
        
        // no reason to do any work if there are no requests
        if (typeof changes === "undefined")
            return;
        if (changes.insertions.length == 0 && changes.modifications.length == 0)
            return;
        
        const searchRealm = changeEvent.realm; // workaround for GN returning new instance on every access
        const requests    = searchRealm.objects("UserSearch");
        const accounts    = adminRealm.objects('Account');
        
        // Find users matching the request
        searchRealm.write(() => {
            // handle new requests
            changes.insertions.forEach((index) => {
                const obj = requests[index];
                
                if (obj.pattern != "") {
                    const matches = accounts.filtered("provider_id CONTAINS[c] $0", obj.pattern);
                    
                    matches.forEach((match) => {
                        obj.users.push({userid: match.user.id, email: match.provider_id});
                    });
                }
                obj.resultPattern = obj.pattern;
            });
            
            // live update result if request is modified
            changes.modifications.forEach((index) => {
                const obj = requests[index];
                
                if (obj.pattern == "") {
                    searchRealm.delete(obj.users);
                }
                else {
                    const matches = accounts.filtered("provider_id CONTAINS[c] $0", obj.pattern);
                    
                    // remove users that are no longer matching
                    const toDelete = [];
                    obj.users.forEach((profile) => {
                        if (matches.filtered("user.id == $0", profile.userid).length == 0) {
                            toDelete.push(profile);
                        } 
                    });
                    searchRealm.delete(toDelete);
                    
                    // add new matches
                    matches.forEach((match) => {
                        if (obj.users.filtered("userid == $0", match.user.id).length == 0) {
                            obj.users.push({userid: match.user.id, email: match.provider_id});
                        }
                    });
                }
                obj.resultPattern = obj.pattern;
            });
        });
    }
    Realm.Sync.addListener(server_url, adminUser, ".*/usersearch$", 'change', handleChange);
    
    // now that we have the admin realm, we don't need the listener anymore
    Realm.Sync.removeListener("^/__admin$", 'change', onAdmin)
 }

Realm.Sync.addListener(server_url, adminUser, "^/__admin$", 'change', onAdmin);

console.log('listening');
