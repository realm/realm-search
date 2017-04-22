////////////////////////////////////////////////////////////////////////////
//
// Copyright 2017 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

import UIKit
import RealmSwift

class ViewController: UITableViewController, UISearchBarDelegate {
    let server = "localhost:9080"
    var request : UserSearch?
    var notificationToken: NotificationToken!

    let searchBar = UISearchBar()

    deinit {
        notificationToken.stop()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Realm Search"
        view.backgroundColor = .white

        searchBar.frame.size.height = 44
        searchBar.placeholder = "Search"
        searchBar.delegate = self
        tableView.tableHeaderView = searchBar

        login()
    }

    // MARK: - Search Bar Delegate -
    func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
        print(searchBar.text!)
        if (self.request != nil) {
            try! self.request!.realm?.write {
                self.request!.pattern = searchBar.text!
            }
        }
    }

    // MARK: - Table View Data Source -
    override func tableView(_ tableView: UITableView?, numberOfRowsInSection section: Int) -> Int {
        if (request != nil) {
            return request!.users.count
        }
        else {
            return 0
        }
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let identifier = "Cell"
        var cell = tableView.dequeueReusableCell(withIdentifier: identifier)
        if cell == nil {
            cell = UITableViewCell(style: .default, reuseIdentifier: identifier)
        }

        let item = request!.users[indexPath.row]
        cell!.textLabel?.text = item.email

        return cell!
    }

    func setupRealm(user: SyncUser) {
        print("open realm")
        self.request = getUserSearchRequest(user: user, server: self.server)

        // Show initial users
        self.searchBar.text = self.request?.resultPattern
        self.tableView.reloadData()

        // Notify us when the server updates the request results
        self.notificationToken = self.request?.users.addNotificationBlock { _ in
            self.tableView.reloadData()
        }
    }

    func login() {
        if let user = SyncUser.current {
            setupRealm(user: user)
        }
        else {
            // Log in existing user with username and password
            let username = "tester@realm.io"  // <--- Update this
            let password = "a"  // <--- Update this

            print("logging in...")
            SyncUser.logIn(with: .usernamePassword(username: username, password: password, register: false), server: URL(string: "http://" + self.server)!) { user, error in
                guard let user = user else {
                    fatalError(String(describing: error))
                }
                print("login done")
                DispatchQueue.main.async {
                    self.setupRealm(user: user)
                }
            }
        }
    }
}

