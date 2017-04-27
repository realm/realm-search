const Realm = require('realm');
const fs = require('fs');

const server_url        = 'realm://localhost:9080';
const REALM_ADMIN_TOKEN = fs.readFileSync('./admin_token.base64', 'utf-8');
const ENTERPRISE_TOKEN  = fs.readFileSync('./access-token.enterprise', 'utf-8');

Realm.Sync.setAccessToken(ENTERPRISE_TOKEN); // needed to enable global listener functionality
Realm.Sync.setLogLevel('error');

const adminUser = Realm.Sync.User.adminUser(REALM_ADMIN_TOKEN);

const demoEmails = ["demo@realm.io",
                    "test@realm.io",
                    "jmelmoth0@intel.com",
                    "ablizard1@blogspot.com",
                    "gvallis2@nsw.gov.au",
                    "gzywicki3@tinypic.com",
                    "dbarents4@nature.com",
                    "cwitty5@cocolog-nifty.com",
                    "ghailston6@springer.com",
                    "sspargo7@cnn.com",
                    "gdugood8@fotki.com",
                    "vbottoms9@example.com",
                    "sslya@msu.edu",
                    "afasseb@whitehouse.gov",
                    "vnisbetc@friendfeed.com",
                    "mcunninghamd@sciencedirect.com",
                    "mmaureene@howstuffworks.com",
                    "sabdyf@yale.edu",
                    "tpoileg@sciencedirect.com",
                    "smachosteh@opera.com",
                    "zrubinovitschi@xing.com",
                    "mwoanj@addtoany.com"];

const userSchema = {
  name: 'User',
  properties: {
    email:  'string',
  }
};

let userRealm = new Realm({
      sync: {
        user: adminUser,
        url: server_url + '/globalUsers',
      },
      schema: [userSchema]
    });

var users = userRealm.objects('User');

// Add an artificial delay to allow for the ROS connection to complete
setTimeout(() => {
    if (users.length == 0) {
        userRealm.write(() => {
            demoEmails.forEach(function(emailString) {
                userRealm.create('User', { email: emailString });
            });
        });
    }
}, 2000);


