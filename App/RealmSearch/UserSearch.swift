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

import Foundation
import RealmSwift

// MARK: Model

final class UserSearch: Object {
    // This is the request. Update it to search for
    // users whose email address contains the text in the pattern.
    dynamic var pattern = ""
    
    // These are the properties by which the result is delivered.
    // If you are in the process of doing a search, you can use
    // `resultPattern` to see what the `users` list contains.
    dynamic var resultPattern: String?
    let users = List<UserProfile>()
}

final class UserProfile: Object {
    dynamic var email = ""
}


// MARK: Functions

func getUserSearchRequest(user: SyncUser, server: String) -> UserSearch {
    // Open Realm
    let configuration = Realm.Configuration(
        syncConfiguration: SyncConfiguration(user: user, realmURL: URL(string: "realm://" + server + "/~/usersearch")!),
        objectTypes: [UserSearch.self, UserProfile.self]
    )
    let realm = try! Realm(configuration: configuration)
    
    // do we have an existing request we can reuse?
    let requests = realm.objects(UserSearch.self)
    if requests.isEmpty {
        // Create a new search request
        var request : UserSearch?
        try! realm.write {
             request = realm.create(UserSearch.self, value: ["pattern": ""])
        }
        return request!
    }
    else {
        // Reuse existing request
        return requests.first!
    }
}

