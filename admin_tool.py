import json
import os

# Database ෆයිල් එක
DB_FILE = 'users.json'

def load_users():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(DB_FILE, 'w') as f:
        json.dump(users, f, indent=4)

print("--- SYNAPSE BUSINESS ADMIN TOOL ---")
print("1. Add New Paying User")
print("2. View All Users")
print("3. Delete User")

choice = input("Select Option (1-3): ")

users = load_users()

if choice == '1':
    print("\n--- NEW CUSTOMER REGISTRATION ---")
    new_user = input("Enter Customer Username: ")
    new_pass = input("Enter Customer Password: ")
    
    if new_user in users:
        print("⚠️ User already exists!")
    else:
        users[new_user] = new_pass
        save_users(users)
        print(f"✅ SUCCESS: Account created for {new_user}!")
        print("💰 You can now give these details to your customer.")

elif choice == '2':
    print("\n--- CURRENT USER LIST ---")
    for user, pw in users.items():
        print(f"👤 User: {user} | 🔑 Pass: {pw}")

elif choice == '3':
    del_user = input("Enter Username to Delete: ")
    if del_user in users:
        del users[del_user]
        save_users(users)
        print(f"🗑️ User {del_user} deleted.")
    else:
        print("User not found.")

input("\nPress Enter to exit...")